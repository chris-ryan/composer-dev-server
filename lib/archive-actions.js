const ArchiveCreate = require('composer-cli').Archive.Create;
const NetworkInstall = require('composer-cli').Network.Install;

//set baseDir to where the app is called
// const baseDir = process.cwd();
const baseDir = '/Users/chris/Documents/Development/DREME';

// let pckg = require(`${baseDir}/package.json`);
//let pckg = JSON.parse(fs.readFileSync(`${baseDir}/package-copy.json`));

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
  }
};