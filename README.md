# RElaychain and PArachain production setup

> This is WIP, probably it's buggy, not 100% safe or extensively tested. Use at your own risk!!!


## Why REPA?

There are plenty of tools to spin up and test parachains like zombienet or parachain-launch, but not full production ready setup.


## What can i do with REPA?
With `repa` you can:

- generate custom prod relay chain spec
- set custom addresses for validators ( do not use Alice and friends on production )
- production ready `docker-compose.yml` file for relaychain with arbitrary number of nodes
- use `caddy` for reverse-proxy and automatic `TLS`
- generate specs for parachain
- generate parachain genesis state
- generate parachain verification wasm code
- production ready `docker-compose.yml` file for parachains with arbitrary number of nodes


## How to start?

First, check the [examples](./examples/) directory. There you will find generated files. they should not be deployed to production, their purpose is to show you the directory structure.

If you do not have the `repa` CLI you need to build this project. 

You will need 
- nodejs installed at least 16LTS, recommended 18LTS or even 19
- pnpm 

Building the CLI: 

```sh
# clone it 
git clone https://github.com/anagolay/repa.git && cd repa

# install deps 
node common/scripts/install-run-rush.js install

# build 
node common/scripts/install-run-rush.js rebuild --verbose


# symlink the repa cli 
ln -fs libraries/repa/dist/repa.js repa && chmod +x ./repa

# test that it works, you should see CLI output and no errors
./repa 

# repa has binaries located here 
ls libraries/repa/binaries/
```

Now when you have the CLI you can do create a template config.
```sh
./repa init
```

Next steps are to edit the config as you wish. Do not forget that the `suri` can be anything really, most commonly it is a `12 word` mnemonic seed which you can generate in any wallet. This also is the most important piece to keep safe. In the future versions we will try to make it as safe as possible. All the accounts needed for session keys are generated automatically from `suri` and added to the spec file.

When you are done with editing run: 

```sh
./repa generate
```

This will generate `plain` and `raw` spec files with the `docker-compose.yml` file. 

Next step is to start the containers. Due to the restrictions in the nodejs processes and this project being WIP and literally done in 3 days you need to hack stuff a bit.

```sh
# create correct COMPOSE_PROJECT_NAME var, make .env file, source it and run the containers
./repa export vars --config ./repa.yml > .env && source .env && docker-compose up # or with -d 
```

When your containers are running, it's time to add your keys:
```sh
./repa insert-keys 
```

If everything is OK you will see your relaychain producing and authoring blocks. 

Congrats, you have a running relaychain!! 🎉🎉 

----

## Commands

Commands are aimed to be intuitive and familiar.

### init

Initialize the `repa.yml` config.

Sample config file:

```yml
version: 1
cme: docker
projectName: relaychain-idiyanale-testnet
relay:
  image: parity/polkadot:v0.9.38
  spec:
    chainType: rococo-local
    name: Idiyanale Testnet
    protocolId: 'idiyanale_rococo'
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
  nodes:
    - name: relay1
      suri: 'SURIIIIIIII'
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
          caddy: 'idiyanale-testnet.anagolay.io'
          caddy.reverse_proxy: '{{upstreams 9944}}'
        networks:
          - caddy
    - name: relay2
      suri: 'ANOTHER_SURIIIII'
      balance: 3000000000000000000
```

### generate

This command generates the spec and compose file based on `repa.yml` config

### insert-keys

Add the gran and babe keys to running services.

### export

For now there is only one subcommand. There will be more in the future.

#### vars

Export needed env variables like `COMPOSE_PROJECT_NAME`. Best way to use this command is to create the `.env` file and source it to the shell.

```sh
# check does it work
repa export vars --config ./repa.yml > .env && source .env && echo $COMPOSE_PROJECT_NAME

# create .env file with all env vars, source it and run the containers
repa export vars --config ./repa.yml > .env && source .env && docker-compose up -d
```
