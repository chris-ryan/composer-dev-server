// const fs = require('fs');
const nodemon = require('nodemon');
const Archive = require('./lib/archive-actions');

//set baseDir to where the app is called
// const baseDir = process.cwd();
const baseDir = '/Users/chris/Documents/Development/DREME';

// get the business network name and version from package.json
// let pckg = JSON.parse(fs.readFileSync(`${baseDir}/package.json`));
let pckg = require(`${baseDir}/package.json`);
//const networkName = pckg.name;
//let version = pckg.version;

// let pckg = require(`${baseDir}/package-copy.json`);
// get the business network name from package.json
// const networkName = pckg.name;

// function handleErr(err) {
//   console.log(err.message);
// }

// On script start...
// Generate the business network archive and install
Archive.installBna(pckg.name, pckg.version);


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