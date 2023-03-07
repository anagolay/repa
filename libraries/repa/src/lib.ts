import { equals, isNil, map, mergeDeepRight } from "ramda";

import { exec } from "./exec";
import { createAccount, IAccountForSpec, relaySessionKeys } from "./helpers";
import { RelayPlainSpec, SessionKey } from "./types/plainSpecRelay";
import { IRepaConfig, RawRelayChainSpec } from "./types/relayChainTypes";

/**
 * Update the specs
 * @param config
 * @param spec
 */
export async function updateSpec(
  config: IRepaConfig,
  spec: RelayPlainSpec
): Promise<RelayPlainSpec> {
  console.debug(` modifying the plain spec file ...`);

  const { name, protocolId, sudo, runtimeGenesisConfig } = config.relay.spec;

  const nodes: {
    sessionKey: SessionKey;
    account: IAccountForSpec;
    balance: number;
  }[] = await Promise.all(
    config.relay.nodes.map(async (node, i) => {
      const account = await createAccount(node.suri);
      const sessionKey: SessionKey = await relaySessionKeys(node.suri);
      if (isNil(node.balance) || equals(node.balance, 0)) {
        console.warn(
          `Balance for the node on index ${i}, is not valid. Setting to 0 [zero]`
        );
      }
      return {
        balance: node.balance || 0,
        account,
        sessionKey,
      };
    })
  );

  const balances = [
    ...map((e) => {
      return [e.account.aura.address, e.balance];
    }, nodes),
    ...(config.relay.spec.runtimeGenesisConfig?.balances.balances || []),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutSpec: any = {
    ...spec,
    name,
    protocolId: protocolId || spec.protocolId,
    chainType: "Live",
    genesis: {
      runtime: {
        ...spec.genesis.runtime,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        runtime_genesis_config: {
          ...mergeDeepRight(
            spec.genesis.runtime.runtime_genesis_config,
            runtimeGenesisConfig || {}
          ),
          session: {
            keys: map((e) => e.sessionKey, nodes),
          },
          balances: {
            balances,
          },
          sudo: {
            key: sudo,
          },
        },
      },
    },
  };
  return mutSpec;
}

/**
 *
 * Build the plain specs
 * @param config
 */
export async function buildSpec(config: IRepaConfig): Promise<RelayPlainSpec> {
  console.log(`Generating plain spec file ...`);
  const {
    relay: {
      image,
      spec: { chainType },
    },
  } = config;
  const out = exec(
    [
      "docker",
      "run",
      "--rm",
      image,
      "build-spec",
      `--chain=${chainType}`,
      "--disable-default-bootnode",
    ].join(" ")
  );

  const spec: RelayPlainSpec = JSON.parse(out);
  return spec;
}

/**
 * Build RAW specs based on the updated specs
 * @param config
 * @param specFileName
 * @param outputDir
 * @returns
 */
export async function buildSpecRaw(
  config: IRepaConfig,
  specFileName: string,
  outputDir: string
): Promise<RawRelayChainSpec> {
  console.debug(`Generating raw spec file ...`);
  const {
    relay: {
      image,
      spec: { chainType },
    },
  } = config;
  const absOutput = outputDir.startsWith("/")
    ? outputDir
    : `$(pwd)/./"${outputDir}"`;
  const out = exec(
    [
      "docker",
      "run",
      `--volume ${absOutput}:/app`,
      `--name=tmp_relaychain_${chainType}`,
      "--rm",
      image,
      "build-spec",
      `--raw`,
      `--chain=/app/${specFileName}`,
      "--disable-default-bootnode",
    ].join(" ")
  );

  const spec: RawRelayChainSpec = JSON.parse(out);
  return spec;
}

export async function exportGenesisWasm(config: any): Promise<void> {
  console.log("implement me");
}

/**
 *
 * @param config
 */
export async function exportGenesisState(config: any): Promise<void> {
  console.log("implement me");
}
