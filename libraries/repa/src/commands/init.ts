import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import yaml from 'yaml';

import { configFileName } from '..';
import { IRepaConfig } from '../types/repaConfig';

const initFile: IRepaConfig = {
  version: 1,
  /**
   * container management engine, possible values `podman`, `docker`
   */
  cme: 'docker',
  projectName: 'my compose project name',
  relay: {
    image: 'parity/polkadot:v0.9.38',
    spec: {
      name: 'Testnet',
      chainType: 'rococo-local',
      sudo: 'ss58-address'
    },
    env: {
      RUST_LOG: 'parachain::candidate-backing=trace'
    },
    // common flags
    // cmdFlags: ["--rpc-methods=unsafe"],
    cmdFlags: [],
    nodes: [
      {
        suri: '$MY_SURY_ENV_VAR',
        name: 'relay1',
        wsPort: 9944,
        rpcPort: 9933,
        port: 30333,
        cmdFlags: ['--force-authoring'],
        env: {
          RUST_LOG: 'babe=debug'
        },
        balance: 1000000000
      }
    ]
  }
};

/**
 * Workflow main Command
 *
 * @remarks Usage `anagolay help workflow`
 *
 * @public
 */
export default async function makeCommand(): Promise<Command> {
  const cmd = new Command('init');
  cmd.description('Generate repa.json config');
  cmd.option('-f --force', 'Force creation, overwrite', false);

  cmd.action(init);

  return cmd;
}

/**
 * Generate init config
 */
async function init(): Promise<void> {
  const initPath = resolve(process.cwd(), configFileName);
  await writeFile(initPath, yaml.stringify(initFile, null, 2));
  console.log(`${configFileName} config file written`);
}
