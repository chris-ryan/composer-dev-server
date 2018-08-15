const ArchiveCreate = require('composer-cli').Archive.Create;
const CardImport = require('composer-cli').Card.Import;
const NetworkInstall = require('composer-cli').Network.Install;
const NetworkStart = require('composer-cli').Network.Start;
const NetworkUpgrade = require('composer-cli').Network.Upgrade;

//set baseDir to where the app is called
// const baseDir = process.cwd();
const baseDir = '/Users/chris/Documents/Development/DREME';

function handleErr(err) {
  console.log(err.message);
}

module.exports = {
  create: (filename) => {
    let options = {
      sourceType: 'dir',
      sourceName: baseDir,
      //sourceName: `${process.cwd()}`,
      archiveFile: filename
    };
    return ArchiveCreate.handler(options);
  },
  importCard: () => {
    let options = {
      file: `${baseDir}/networkadmin.card`
    };
    return CardImport.handler(options);
  },
  install: (card, filename) => {
    let options = {
      archiveFile: filename,
      card: card
    };
    return NetworkInstall.handler(options);
  },
  installBna: async (network, version) => {
    let archiveFile = `${baseDir}/${network}@${version}.bna`;
    await module.exports.create(archiveFile).catch(handleErr);
    await module.exports.install('PeerAdmin@hlfv1', archiveFile).catch(handleErr);
  },
  start: async (network, version) => {
    let options = {
      networkName: network,
      networkVersion: version,
      networkAdmin: 'admin',
      networkAdminEnrollSecret: 'adminpw',
      card: 'PeerAdmin@hlfv1',
      file: `${baseDir}/networkadmin.card`
    };
    return NetworkStart.handler(options);
  },
  upgrade: async (network, version) => {
    // Generate the business network archive and install
    await module.exports.installBna(network, version).catch(handleErr);

    // Upgrade the network to the new bna version
    let options = {
      networkName: network,
      networkVersion: version,
      card: 'PeerAdmin@hlfv1'
    };
    await NetworkUpgrade.handler(options).catch(handleErr);
  }
}