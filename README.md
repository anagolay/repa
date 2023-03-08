# RElaychain and PArachain production setup

> This is WIP, probably it's buggy, not 100% safe or extensively tested. Use at your own risk!!!

## Why REPA?

There are plenty of tools to spin up and test parachains like zombienet or parachain-launch, but not full production ready setup.

## What can i do with REPA?

With `repa` you can:

- [x] generate custom prod relay chain spec
- [x] set custom addresses for validators ( do not use Alice and friends on production )
- [x] production ready `docker-compose.yml` file for relaychain with arbitrary number of nodes
- [x] use `caddy` for reverse-proxy and automatic `TLS`
- [ ] generate specs for parachain
- [ ] generate parachain genesis state
- [ ] generate parachain verification wasm code
- [ ] production ready `docker-compose.yml` file for parachains with arbitrary number of nodes

## Installing

Easiest way to install `repa` is to download the binaries from the releases page, or if you have wget|curl you can just download it like this:

```sh
# wget
wget https://github.com/anagolay/repa/releases/latest/download/repa-node18-linux-x64 -O repa && chmod +x ./repa

# curl
curl -Lo repa https://github.com/anagolay/repa/releases/latest/download/repa-node18-linux-x64 && chmod +x ./repa

# smoke test
./repa --version
```

You do not need to install it from the npm, unless you want to use it as a library, in which case you will do this:

```sh
# pnpm
pnpm add -E @anagolay/repa

# rushstack
rush add -p @anagolay/repa


# smoke test
repa --version
```

You will need these dependencies if you want to build this project yourself:

- nodejs installed at least 16LTS, recommended 18LTS or even 19
- pnpm
- docker
- docker-compose

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

# or if you like it globally
sudo ln -fs $(pwd)/libraries/repa/dist/repa.js /usr/local/bin/repa && sudo chmod +x /usr/local/bin/repa

# test that it works, you should see CLI output and no errors
./repa

# repa has binaries located here
ls libraries/repa/binaries/
```

## How to start?

First, check the [examples](./examples/) directory. There you will find generated files. they should not be deployed to production, their purpose is to show you the directory structure.

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

---

## Commands

Commands are aimed to be intuitive and familiar.

### init

Initialize the `repa.yml` config. Sample config file is located in [examples](./examples/repa.yml)

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
