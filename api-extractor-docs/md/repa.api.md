## API Report File for "@anagolay/repa"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { KeyringPair } from "@polkadot/keyring/types";
import shell from "shelljs";

// Warning: (ae-forgotten-export) The symbol "IRepaConfig" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "RelayPlainSpec" needs to be exported by the entry point index.d.ts
//
// @public
export function buildSpec(config: IRepaConfig): Promise<RelayPlainSpec>;

// Warning: (ae-forgotten-export) The symbol "RawRelayChainSpec" needs to be exported by the entry point index.d.ts
//
// @public
export function buildSpecRaw(
  config: IRepaConfig,
  specFileName: string,
  outputDir: string
): Promise<RawRelayChainSpec>;

// @public
export const configFileName: "repa.yml";

// @public
export function createAccount(suri: string): Promise<IAccountForSpec>;

// @public
export function dockerRun(
  image: string,
  before: string[],
  after: string[]
): Promise<string>;

// @public
export function exec(
  cmd: string,
  options?: {
    silent?: boolean;
    fatal?: boolean;
  }
): shell.ShellString;

// @public (undocumented)
export function exportGenesisState(config: any): Promise<void>;

// @public (undocumented)
export function exportGenesisWasm(config: any): Promise<void>;

// @public
export function generateNodeKey(image: string): {
  key: string;
  address: string;
};

// @public
export function generateRelayDockerCompose(
  config: IRepaConfig,
  outputAppDir: string,
  rawSpecsFileName: string
): Promise<any>;

// @public
export function generateSpecFileName(chainType: string, raw?: boolean): string;

// @public (undocumented)
export interface IAccountForSpec {
  // (undocumented)
  aura: KeyringPair;
  // (undocumented)
  beefy: KeyringPair;
  // (undocumented)
  grandpa: KeyringPair;
  // (undocumented)
  stash: KeyringPair;
}

// @public
export function isFalse(value: string | number): boolean;

// @public
export function isTrue(value: string | number): boolean;

// @public
export function readConfig(configName: string): Promise<IRepaConfig>;

// Warning: (ae-forgotten-export) The symbol "SessionKey" needs to be exported by the entry point index.d.ts
//
// @public
export function relaySessionKeys(suri: string): Promise<SessionKey>;

// @public
export function updateSpec(
  config: IRepaConfig,
  spec: RelayPlainSpec
): Promise<RelayPlainSpec>;
```