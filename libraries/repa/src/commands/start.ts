import { Command } from "commander";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { find, isNil, map, mapObjIndexed, propEq, startsWith } from "ramda";
import { parse } from "yaml";

import { configFileName } from "..";
import { ICommonOptions } from "../bin";
import { exec } from "../exec";
import { generateSpecFileName, readConfig } from "../helpers";
import { IDockerCompose } from "../types/dockerComposeTypes";
import { Node } from "../types/relayChainTypes";
/**
 * Workflow main Command
 *
 * @remarks Usage `anagolay help workflow`
 *
 * @public
 */
export default async function makeCommand(): Promise<Command> {
  const cmd = new Command("start");
  cmd.description("Start containers");
  cmd.option("-c, --config <file>", "Config path", configFileName);
  cmd.option("-o, --output <string>", "Output directory", "output");
  cmd.option("-t, --tail", "Tail the compose logs", false);

  cmd.action(start);

  return cmd;
}
interface IStartOptions extends ICommonOptions {
  tail: boolean;
}
/**
 * Generate init config
 */
async function start(
  options: IStartOptions = {
    config: configFileName,
    output: "output",
    tail: false,
  }
): Promise<void> {
  const { output, tail } = options;
  const config = await readConfig(configFileName);

  const composeFile: IDockerCompose = parse(
    (
      await readFile(resolve(process.cwd(), `${output}/docker-compose.yml`))
    ).toString()
  );

  exec(
    [
      "docker-compose",
      `-f ${process.cwd()}/${output}/docker-compose.yml`,
      "config",
    ].join(" ")
  );

  console.log("Starting the containers ...");
  const composeUp = spawn(
    "docker-compose",
    [`-f ./${output}/docker-compose.yml`, "up"],
    {
      detached: true,
      shell: true,
      stdio: tail ? "inherit" : undefined,
      cwd: process.cwd(),
    }
  );
  composeUp.stdout?.on("close", () => {
    console.log("shutting down");
    process.exit();
  });
  composeUp.stderr?.on("error", (e) => {
    console.error(e);
    process.exit(1);
  });

  // console.debug('compose process %s', composeUp.pid)
  console.log("Waiting for services to start ...");
  // until we find better way of checking are the services running
  setTimeout(() => {
    console.log("Adding the keys ...");

    mapObjIndexed((svc, key) => {
      // find the node name in the config
      const node = find<Node>(propEq("name", key))(config.relay.nodes);

      if (isNil(node)) {
        throw new Error(`Cannot find service in the config [ ${key} ]`);
      }

      const volumes = map((v) => {
        if (startsWith(key, v)) {
          // true name of the volume. compose will prefix it with the name of the stack
          return ["-v", `${composeFile.name}_${key}:/data`].join(" ");
        }
        return ["-v", v].join(" ");
      }, svc.volumes);

      const baseCmd = [
        "docker",
        "run",
        "--rm ",
        ...volumes,
        config.relay.image,
        "key",
        "insert",
        "--base-path=/data",
        `--chain=/app/${generateSpecFileName(
          config.relay.spec.chainType,
          true
        )}`,
        `--suri="${node.suri}"`,
      ];

      console.log(`Inserting the babe key for ${key}`);
      exec([...baseCmd, "--scheme sr25519", "--key-type babe"].join(" "), {
        silent: true,
      });

      console.log(`Inserting the grandpa key for ${key}`);
      exec([...baseCmd, "--scheme ed25519", "--key-type gran"].join(" "), {
        silent: true,
      });
    }, composeFile.services);

    // https://azimi.me/2014/12/31/kill-child_process-node-js.html
    const pid = composeUp.pid as number;
    // Please note - before pid. This converts a pid to a group of pids for process kill() method.
    process.kill(-pid);
    // now we need to restart
    exec(
      ["docker-compose", `-f ${output}/docker-compose.yml`, "restart"].join(" ")
    );
    console.log("🎉🎉🎉🎉🎉🎉 done");
    process.exit(0);
  }, 3000);
}
