'use strict';

const { resolve } = require('path');
const { exec } = require('pkg');
// const { version } = require("./package.json");

async function main() {
  // console.log(`Building repa cli for node18`);
  await exec([
    resolve(__dirname, './dist/repa.js'),
    '--target',
    'node18-linux-x64',
    '--output',
    resolve(__dirname, `./binaries/repa-node18-linux-x64`)
  ]);
  // console.log(
  //   `Binary is here %s`,
  //   resolve(__dirname, `./binaries/repa-node18-linux-x64`)
  // );
  // console.log(`🎉 done`);

  // console.log(`Building repa cli for node16`);
}

main().catch(console.error);
