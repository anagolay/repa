#!/usr/bin/env -S node
//--experimental-modules --experimental-specifier-resolution=node

import { Command } from 'commander';

import makeCommandExport from './commands/export';
import makeCommandGenerate from './commands/generate';
import makeCommandInit from './commands/init';
import makeCommandKeys from './commands/keys';

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

  cmd.version('0.1.0').description(`Welcome to REPA CLI.`);

  /// HERE we start with adding the 1st level commands
  cmd.addCommand(await makeCommandInit());
  cmd.addCommand(await makeCommandGenerate());
  cmd.addCommand(await makeCommandKeys());
  cmd.addCommand(await makeCommandExport());

  await cmd.parseAsync();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
