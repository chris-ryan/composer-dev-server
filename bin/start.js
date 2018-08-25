#!/usr/bin/env node

// TODO - need a way to check if the Network is already started (chaincode already exists) then upgrade instead of start.

// const fs = require('fs');
const nodemon = require('nodemon');
// const { spawn } = require('child_process');
const Network = require('../lib/network-api');
const Server = require('../lib/rest-launcher');
//set baseDir to where the app is called
const baseDir = process.cwd();

// get package.json for the business network name and version
let pckg = require(`${baseDir}/package.json`);

function handleErr(err) {
  console.log(err.message);
}

let server = {};

// On script start...
async function init() {
  // Generate the business network archive and install
  await Network.createAndInstall(pckg.name, pckg.version);
  // Start the business network
  await Network.start(pckg.name, pckg.version).catch(handleErr);
  // Import the network admin identity card
  await Network.importCard(pckg.name).catch(handleErr);
  // Spawn a process to run the composer-rest-server cli script
  let spawnServer = Server.spawn(pckg.name);
  return spawnServer();
}

// Do all the init functions & save the process handler to a local variable to kill on restart
init().then((result)=> {
  server = result;
});

// execute nodemon and supply options
 // nodemon('-e --on-change-only -w models "cto js json" restart.js');
nodemon({
  script: `${__dirname}/../lib/restart.js`,
  watch: [`${baseDir}/lib`, `${baseDir}/models`],
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