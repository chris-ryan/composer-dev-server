const fs = require('fs');
const semver = require('semver')
const Network = require('./lib/network-api');

// const baseDir = process.cwd();
const baseDir = '/Users/chris/Documents/Development/DREME'
// get the package.json info
let pckg = JSON.parse(fs.readFileSync(`${baseDir}/package.json`));
const networkName = pckg.name;

// Deploy the BNA (using variable bna file name)
// composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna

// Increment the version in package.json
let newVer = semver.inc(pckg.version, 'patch');
console.log('Updating network version in package.json:');
console.log(`  ${pckg.version} -> ${newVer}`);
pckg.version = newVer;
fs.writeFileSync(`${baseDir}/package.json`, JSON.stringify(pckg, null, 2));

//async function restartComposer() {
   
//}
// Upgrade the business network
Network.upgrade(networkName, newVer);


// process.on('exit', function () {
//   gracefulShutdown(function () {
//     console.log('app being shutdown');
//     process.kill(process.pid, 'SIGUSR2');
//   });
// });

// ArchiveCreate.handler(options);