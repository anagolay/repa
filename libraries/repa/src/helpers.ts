import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { encodeAddress } from '@polkadot/util-crypto';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { endsWith, isNil, trim } from 'ramda';
import { parse } from 'yaml';

import { exec } from './exec';
import { IRepaConfig } from './types/repaConfig';
import { SessionKey } from './types/specRelay';

export interface IAccountForSpec {
  aura: KeyringPair;
  // with hard path //stash
  stash: KeyringPair;
  grandpa: KeyringPair;
  beefy: KeyringPair;
}

/**
 * Sanity checks and read config file
 * @param configName - config name
 * @returns
 * @public
 */

export async function readConfig(configName: string): Promise<IRepaConfig> {
  if (!endsWith('yml', configName)) {
    throw new Error(`Config must end with [.yml]. Got ${configName}`);
  }
  const filePath = resolve(process.cwd(), configName);

  await stat(filePath);

  const content = await readFile(filePath);
  const configContent: IRepaConfig = parse(content.toString());
  return configContent;
}

/**
 * Create accounts based on suri
 * @param suri - A phrase to generate the key from
 * @returns
 * @public
 */
export async function createAccount(suri: string): Promise<IAccountForSpec> {
  if (!suri) {
    throw new Error('please provide SURI');
  }

  const keyring = new Keyring();

  const aura = keyring.createFromUri(suri, undefined, 'sr25519');
  const stashAddr = keyring.createFromUri(suri + '//stash', undefined, 'sr25519');
  const grandpa = keyring.createFromUri(suri, undefined, 'ed25519');
  const beefy = keyring.createFromUri(suri, undefined, 'ecdsa');

  return {
    aura,
    stash: stashAddr,
    grandpa,
    beefy
  };
}

/**
 * Generate session keys in the form of {@link SessionKey}
 * @param suri - Mnemonic phrase
 * @returns
 * @public
 */
export async function relaySessionKeys(suri: string): Promise<SessionKey> {
  const { aura, beefy, grandpa } = await createAccount(suri);
  const relayChainSessionKey: SessionKey = [
    aura.address,
    aura.address,
    {
      grandpa: grandpa.address,
      babe: aura.address,
      im_online: aura.address,
      parachain_validator: aura.address,
      authority_discovery: aura.address,
      para_validator: aura.address,
      para_assignment: aura.address,
      beefy: encodeAddress(beefy.publicKey)
    }
  ];

  return relayChainSessionKey;
}

/**
 * Generate spec file name
 * @param chainType - chain type defined in the binary
 * @param raw - if true it will add `raw` to the name, if not `plain`
 * @public
 *
 */
export function generateSpecFileName(chainType: string, raw: boolean = false): string {
  if (isNil(chainType)) {
    throw new Error('chainType params is needed');
  }
  const kind = raw ? 'raw' : 'plain';
  return `relay-${kind}-${chainType}.json`;
}

/**
 * Generate node key using docker run
 *
 * @param image - OCI
 * @public
 */
export async function generateNodeKey(image: string): Promise<{
  key: string;
  address: string;
}> {
  const { stderr, stdout } = await exec(`docker run --rm ${image} key generate-node-key`);
  return {
    key: trim(stdout),
    address: trim(stderr)
  };
}
