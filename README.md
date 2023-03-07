- [RElay and PAra chain production setup](#relay-and-para-chain-production-setup)
- [Commands](#commands)
  - [init](#init)
  - [generate](#generate)
  - [start](#start)
- [NOTES](#notes)

## RElaychain and PArachain production setup

There are plenty of tools to spin up test chains like zombienet, parachain-launch, but not full prod ready setup for relaychains and parachain.

With `repa` you can:

- generate custom prod relay chain spec
- set custom addresses for validators ( do not use Alice and friends on production )
- production ready docker-compose.yml file for relaychain with arbitrary number of nodes
- caddy for reverse-proxy and automatic tools
- generate specs for parachain
- generate parachain genesis state
- generate parachain verification wasm code
- production ready docker-compose.yml file for parachains with arbitrary number of nodes

## Commands

### init

Initialize the `repa.yml` config.

Sample config file:

```yml
version: 1
cme: docker
relay:
  image: parity/polkadot:v0.9.38
  spec:
    chainType: rococo-local
    name: Idiyanale Testnet
    protocolId: "idiyanale_rococo"
    sudo: MY-SUDO-SS58
    runtimeGenesisConfig:
      configuration:
        config:
          validation_upgrade_cooldown: 5
      balances:
        balances:
          - - MY-SUDO-SS58
            - 3000000000000000000
  env:
    RUST_LOG: parachain::candidate-backing=trace
  cmdFlags:
    - --rpc-methods=unsafe
  nodes:
    - name: relay1
      suri: "SURIIIIIIII"
      balance: 3000000000000000000
      wsPort: 9944
      rpcPort: 9933
      port: 30333
      cmdFlags:
        - --force-authoring
      env:
        RUST_LOG: babe=debug
      service:
        labels:
          caddy: "idiyanale-testnet.anagolay.io"
          caddy.reverse_proxy: "{{upstreams 9944}}"
        networks:
          - caddy
    - name: relay2
      suri: "ANOTHER_SURIIIII"
      balance: 3000000000000000000
```

### generate

This command generates the spec and compose file based on `repa.yml` config

### start

Start the relaychain nodes, add the gran and babe keys.

## NOTES

The goal is to have `repa` CLI standalone and bundled with node. Currently this is not possible since the `shelljs` has issues when bundled with webpack and pkg.

What we need to fix is the `exec` stdout size limit
