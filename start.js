// Generate BNA
// composer archive create -t dir -n .

// Deploy the BNA (using variable bna file name)
// composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna

// const ArchiveCreate = require('composer-cli').Archive.Create;
const baseDir = process.cwd();
console.log('start.js executed');

let options = {
  sourceType: 'dir',
  sourceName: '.',
  archiveFile: `${baseDir}/digitalproperty-network.bna`
};

// process.on('exit', function () {
//   gracefulShutdown(function () {
//     console.log('app being shutdown');
//     process.kill(process.pid, 'SIGUSR2');
//   });
// });

// ArchiveCreate.handler(options);