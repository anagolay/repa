import chalk from "chalk";
import { Command } from "commander";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { equals, find, includes, isNil, map, propEq, startsWith } from "ramda";
import slug from "slug";
import { parse } from "yaml";

import { configFileName } from "..";
import { ICommonOptions } from "../bin";
import { exec } from "../exec";
import { generateSpecFileName, readConfig } from "../helpers";
import { IDockerCompose } from "../types/dockerComposeTypes";
import { Node } from "../types/repaConfig";

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
  cmd.option(
    "-d, --debug",
    "Include all console.debug, UNSAFE because it will show the suri",
    false
  );
  cmd.option(
    "--justKeys",
    "Skip starting the containers, assume they are running, just add keys",
    false
  );

  cmd.action(start);

  return cmd;
}
interface IStartOptions extends ICommonOptions {
  tail: boolean;
  justKeys: boolean;
  debug: boolean;
}
/**
 * Generate init config
 */
async function start(
  options: IStartOptions = {
    config: configFileName,
    output: "output",
    tail: false,
    justKeys: false,
    debug: false,
  }
): Promise<void> {
  const { output, justKeys, config: configFileName } = options;

  const { dockerComposeProject } = await readConfig(configFileName);

  const composeFile: IDockerCompose = parse(
    (
      await readFile(resolve(process.cwd(), `${output}/docker-compose.yml`))
    ).toString()
  );

  if (isNil(dockerComposeProject)) {
    throw new Error(
      "Cannot determine the project name, either add `dockerComposeProject` to the `repa.yml` file or export the COMPOSE_PROJECT_NAME"
    );
  }

  console.log(chalk.yellow("Checking compose integrity"));
  await exec(
    [
      "docker-compose",
      `-f ${process.cwd()}/${output}/docker-compose.yml`,
      "config",
    ].join(" ")
  );

  console.log(chalk.yellow("Starting the containers"));
  console.log(
    chalk.yellow(
      [
        "    $",
        "docker-compose ",
        `-f ./${output}/docker-compose.yml`,
        "up",
      ].join(" ")
    )
  );

  // console.debug('compose process %s', composeUp.pid)
  console.log(chalk.yellow("  Waiting for services to start"));
  let processedServices = Object.keys(composeFile.services).length;

  // by default we start the containers, but this is very buggy, we can just add keys
  if (!justKeys) {
    const composeUp = spawn("docker-compose", [`-f docker-compose.yml`, "up"], {
      detached: true,
      shell: true,
      // stdio: tail ? "inherit" : undefined,
      cwd: resolve(process.cwd(), output),
    });

    composeUp.on("close", (code) => {
      console.log("shutting down code", code);
      process.exit(code || 0);
    });

    composeUp.stderr?.on("data", async (data) => {
      // this is where the output is written, this is NOT AN ERROR but it can be :()
      const d = data.toString();

      if (includes("Native runtime:", d)) {
        console.log(d);
        processedServices -= 1;
      } else {
        // this must be here
        // process.stdout.write(d);
        console.log(d);
      }
    });
  } else {
    // now when we assume we have the containers running, we need to set this to 0 so the keys can pick it up
    processedServices = 0;
  }

  const interval = setInterval(async () => {
    console.log("checking the services ...", processedServices);
    if (equals(0, processedServices)) {
      // clear interval first
      clearInterval(interval);

      // insert keys
      await insertKeys(options);

      console.log("Restarting services so the finalization can begin ...");
      await exec(
        ["docker-compose", `-f docker-compose.yml`, "restart"].join(" "),
        {
          cwd: resolve(process.cwd(), output),
        }
      );
      console.log("🎉🎉🎉🎉🎉🎉 done");
      process.exit(0);
    }
  }, 1000);
}

/**
 * Insert keys using docker image with docker-compose mounted volumes. Keys are calculated based on provided suri.
 * The keys are inserted using the `key insert` command.
 * Key-types which are inserted are `babe` and `gran`
 * @param options - {@link IStartOptions}
 */
async function insertKeys(options: IStartOptions): Promise<void> {
  const { output, debug } = options;
  const config = await readConfig(configFileName);

  const composeFile: IDockerCompose = parse(
    (
      await readFile(resolve(process.cwd(), output, `docker-compose.yml`))
    ).toString()
  );
  console.log(composeFile);
  const keys: string[] = Object.keys(composeFile.services);
  const composeProjectName = slug(
    process.env.COMPOSE_PROJECT_NAME as string,
    "-"
  );

  await Promise.all(
    map(async (key: string) => {
      const svc = composeFile.services[key];
      // find the node name in the config
      const node = find<Node>(propEq("name", key))(config.relay.nodes);

      if (isNil(node)) {
        throw new Error(`Cannot find service in the config [ ${key} ]`);
      }

      const volumes = map((v) => {
        if (startsWith(key, v)) {
          // true name of the volume. compose will prefix it with the name of the stack
          return ["-v", `${composeProjectName}_${key}:/data`].join(" ");
        } else if (startsWith(".:", v)) {
          // we need to have the abs patch calculated because docker-compose
          // will have the relative local ctx path
          return ["-v", `${process.cwd()}/${output}:/app`].join(" ");
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
      if (debug) {
        console.debug(
          "cmd",
          [...baseCmd, "--scheme sr25519", "--key-type babe"].join(" ")
        );
      }

      console.log(` Inserting the ${chalk.green("babe")} key for ${key}`);
      const b = await exec(
        [...baseCmd, "--scheme sr25519", "--key-type babe"].join(" "),
        {
          cwd: resolve(process.cwd(), output),
        }
      );
      if (debug) {
        console.debug(
          "cmd",
          [...baseCmd, "--scheme ed25519", "--key-type gran"].join(" ")
        );
      }
      if (debug) {
        console.debug("babe out: ", b);
      }
      console.log(` Inserting the ${chalk.green("gran")} key for ${key}`);
      const g = await exec(
        [...baseCmd, "--scheme ed25519", "--key-type gran"].join(" "),
        {
          cwd: resolve(process.cwd(), output),
        }
      );

      if (debug) {
        console.debug("gran out: ", g);
      }

      //// maybe this needs to be handled better
      // const pid = composeUp.pid as number;
      // // Please note - before pid. This converts a pid to a group of pids for process kill() method.
      // process.kill(-pid);

      // https://azimi.me/2014/12/31/kill-child_process-node-js.html
    })(keys)
  );
}
