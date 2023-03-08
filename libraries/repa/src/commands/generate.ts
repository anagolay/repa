import { cryptoWaitReady } from "@polkadot/util-crypto";
import chalk from "chalk";
import { Command } from "commander";
import { exec } from "node:child_process";
import { writeFile as writeFileOrig } from "node:fs/promises";
import { resolve } from "node:path";
import { equals } from "ramda";
import yaml from "yaml";

import { configFileName } from "..";
import { ICommonOptions } from "../bin";
import { generateRelayDockerCompose } from "../docker";
import { generateSpecFileName, readConfig } from "../helpers";
import { buildSpec, buildSpecRaw, updateSpec } from "../lib";

/**
 * Generate main Command
 *
 * @remarks Usage `repa help generate`
 *
 * @public
 */
export default async function makeCommand(): Promise<Command> {
  const cmd = new Command("generate");
  cmd.description("Generate files based on the config");

  cmd.option("-c, --config <file>", "Config path", configFileName);
  cmd.option("-o, --output <string>", "Output directory", "output");
  cmd.action(generate);

  return cmd;
}

/**
 * Generate files for relay chain
 * @param options
 * @param cmd
 */
async function generate(
  options: ICommonOptions = { config: configFileName, output: "output" }
): Promise<void> {
  await cryptoWaitReady();
  const { output } = options;

  const yamlFile = await readConfig(configFileName);

  if (!equals(yamlFile.cme, "docker")) {
    throw new Error(
      `Unsupported engine: ${yamlFile.cme}. Currently supported engines are [docker]`
    );
  }

  const plainSpec = await buildSpec(yamlFile);
  const plainSpecModified = await updateSpec(yamlFile, plainSpec);

  const outputDir = resolve(process.cwd(), output);

  exec(`mkdir -p ${outputDir}`);
  const relayFileNameSpecPlain = generateSpecFileName(
    yamlFile.relay.spec.chainType
  );

  await writeFile(
    resolve(process.cwd(), output, relayFileNameSpecPlain),
    plainSpecModified
  );

  const rawSpec = await buildSpecRaw(yamlFile, relayFileNameSpecPlain, output);
  const relayFileNameSpecRaw = generateSpecFileName(
    yamlFile.relay.spec.chainType,
    true
  );
  await writeFile(
    resolve(process.cwd(), output, relayFileNameSpecRaw),
    rawSpec
  );

  console.log(`Generating docker-compose ...`);
  const dcr = await generateRelayDockerCompose(yamlFile, relayFileNameSpecRaw);

  await writeFile(resolve(outputDir, `docker-compose.yml`), dcr, true);

  console.log("docker-compose.yml written");

  console.log(
    `All files are written, please run the ${chalk.green(
      "start"
    )} command to start the containers.`
  );
}

/**
 * Wrapper around native `writeFile` with
 * @param filePath - fully resolved path
 * @param data - any data that will be stringified
 * @param asYaml - use yaml for encoding
 * @typeParam T - Generic type
 */
async function writeFile<T>(
  filePath: string,
  data: T,
  asYaml: boolean = false
): Promise<void> {
  const encoded = asYaml
    ? yaml.stringify(data, null, 2)
    : JSON.stringify(data, null, 2);

  await writeFileOrig(filePath, encoded);
}
