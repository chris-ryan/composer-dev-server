const NetworkUpgrade = require('composer-cli').Network.Upgrade;
const Archive = require('./archive-actions');

function handleErr(err) {
  console.log(err.message);
}

module.exports = {
  upgrade: async (network, version) => {
    // Generate the business network archive and install
    await Archive.installBna(network, version).catch(handleErr);

    // Upgrade the network to the new bna version
    let options = {
      networkName: network,
      networkVersion: version,
      card: 'PeerAdmin@hlfv1'
    };
    await NetworkUpgrade.handler(options).catch(handleErr);
  }
}