#!/usr/bin/env -S node
//--experimental-modules --experimental-specifier-resolution=node

import { Command } from "commander";
import PrettyError from "pretty-error";

import makeCommandGenerate from "./commands/generate";
import makeCommandInit from "./commands/init";
import makeCommandStart from "./commands/start";

export interface ICommonOptions {
  config: string;
  output: string;
}

/**
 * Main entrypoint for the CLI
 */
async function main(): Promise<void> {
  // const program = commander.createCommand();
  const cmd = new Command();

  cmd.version("0.1.0").description(`Welcome to REPA CLI.`);

  /// HERE we start with adding the 1st level commands
  cmd.addCommand(await makeCommandInit());
  cmd.addCommand(await makeCommandGenerate());
  cmd.addCommand(await makeCommandStart());

  await cmd.parseAsync();
}

main().catch((e) => {
  const pe = new PrettyError();
  const renderedError = pe.render(e);
  console.log(renderedError);
  // console.log(e);
  process.exit(1);
});
