// Generate BNA
// composer archive create -t dir -n .

// Deploy the BNA (using variable bna file name)
// composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna

const ArchiveCreate = require('composer-cli').Archive.Create;
const baseDir = process.cwd();

let options = {
  sourceType: 'dir',
  sourceName: '.',
  archiveFile: `${baseDir}/digitalproperty-network.bna`
};

ArchiveCreate.handler(options);