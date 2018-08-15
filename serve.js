// const fs = require('fs');
const nodemon = require('nodemon');
const Network = require('./lib/network-api');
const Server = require('./lib/rest-launcher');
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

// On script start...
async function init() {
  // Generate the business network archive and install
  await Network.installBna(pckg.name, pckg.version);
  // Start the business network
  await Network.start(pckg.name, pckg.version).catch(handleErr);
  // Import the network admin identity card
  await Network.importCard().catch(handleErr);
  Server.start(`admin@${pckg.name}`);
}

init();


// execute nodemon and supply options
nodemon({
  script: 'restart.js',
  //watch: [`${baseDir}/lib`, `${baseDir}/models`],
  watch: [`${baseDir}/models`],
  runOnChangeOnly: true,
  spawn: true, //required for runOnChangeOnly
  ext: 'cto js json',
});

  // nodemon('-e --on-change-only -w models "js json" start.js');
  
  // nodemon.on('start', function () {
  //   console.log(`baseDir: ${baseDir}`);
  //   console.log('App has started');
  // })
  // .on('restart', function() {
  //   console.log('watch has triggered');
  // }).on('quit', function () {
  //   console.log('App has quit');
  //   process.exit();
  // }).on('restart', function (files) {
  //   console.log('App restarted due to: ', files);
  // });

  console.log(`${baseDir}/lib`);