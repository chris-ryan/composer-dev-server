#!/usr/bin/env node

// TODO - need a way to check if the Network is already started (chaincode already exists) then upgrade instead of start.

// const fs = require('fs');
const nodemon = require('nodemon');
// const { spawn } = require('child_process');
const Network = require('../lib/network-api');
const Server = require('../lib/rest-launcher');
//set baseDir to where the app is called
// const baseDir = process.cwd();
const baseDir = '/Users/chris/Documents/Development/DREME';

// get the business network name and version from package.json
// let pckg = JSON.parse(fs.readFileSync(`${baseDir}/package.json`));
let pckg = require(`${baseDir}/package.json`);
//const networkName = pckg.name;
//let version = pckg.version;

function handleErr(err) {
  console.log(err.message);
}

let server = {};

// On script start...
async function init() {
  // Generate the business network archive and install
  await Network.installBna(pckg.name, pckg.version);
  // Start the business network
  await Network.start(pckg.name, pckg.version).catch(handleErr);
  // Import the network admin identity card
  await Network.importCard().catch(handleErr);
  // Spawn a process to run the composer-rest-server cli script
  let spawnServer = Server.spawn();
  return spawnServer();
}

// Do all the init functions & save the process handler to a local variable to kill on restart
init().then((result)=> {
  server = result;
});

// execute nodemon and supply options
 // nodemon('-e --on-change-only -w models "cto js json" restart.js');
nodemon({
  script: 'restart.js',
  //watch: [`${baseDir}/lib`, `${baseDir}/models`],
  watch: [`${baseDir}/models`],
  runOnChangeOnly: true,
  spawn: true, //required for runOnChangeOnly
  ext: 'cto js json',
});
  
  // nodemon.on('start', function () {
  //   console.log(`baseDir: ${baseDir}`);
  //   console.log('App has started');
  // })
  nodemon.on('restart', function(files) {
    console.log('Detected changes to: ', files);
    console.log('Stopping composer-rest-server');
    server.kill();
  });
  // }).on('quit', function () {
  //   console.log('App has quit');
  //   process.exit();
  // }).on('restart', function (files) {
  //   console.log('App restarted due to: ', files);
  // });

  console.log(`${baseDir}/lib`);