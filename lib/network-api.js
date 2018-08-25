const Admin = require('composer-admin');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Export = require('./export');
const IdCard = require('./idcard');
const cmdUtil = require('./cmdutils');
const ora = require('ora');
const Validate = require('./validate');

const BusinessNetworkDefinition = Admin.BusinessNetworkDefinition;

//set baseDir to where the app is called
const baseDir = process.cwd();

function handleErr(err) {
  console.log(err.message);
}

module.exports = {
  create: (filename) => {
    let options = {
       sourceType: 'dir',
       sourceName: baseDir,
       archiveFile: filename
    };
    cmdUtil.log(chalk.blue.bold('Creating Business Network Archive\n'));
    cmdUtil.log(chalk.blue.bold('\nLooking for package.json of Business Network Definition'));
    cmdUtil.log(chalk.blue('\tInput directory: ') + baseDir);

    let createOptions = cmdUtil.parseOptions(options);
    createOptions.updateExternalModels = options.updateExternalModels;

    return BusinessNetworkDefinition.fromDirectory(baseDir, createOptions).then((result) => {
      cmdUtil.log(chalk.blue.bold('\nFound:'));
      cmdUtil.log(chalk.blue('\tDescription: ') + result.getDescription());
      cmdUtil.log(chalk.blue('\tName: ') + result.getName());
      cmdUtil.log(chalk.blue('\tIdentifier: ') + result.getIdentifier());
      // need to write this out to the required file.
      return result.toArchive()
        .then((result) => {
          //write the buffer to a file
          fs.writeFileSync(filename, result);
          cmdUtil.log(chalk.blue.bold('\nWritten Business Network Definition Archive file to '));
          cmdUtil.log(chalk.blue('\tOutput file: ') + filename);
          return;
      });
    });
  },
  importCard: (networkName) => {
    let cardFile = `${baseDir}/networkadmin.card`;
    let cardToImport;
    let cardName = `admin@${networkName}`;
    let adminConnection;
    return module.exports.readCardFromFile(cardFile).then(card => {
      cardToImport = card;
      adminConnection = cmdUtil.createAdminConnection();
      return adminConnection.hasCard(cardName);
    }).then((existingCard) => {
      if (existingCard) {
        throw new Error('Card already exists: ' + cardName);
      }
        let errors = Validate.validateProfile(cardToImport.getConnectionProfile());
        if(errors) {
          cmdUtil.log(chalk.red.bold('\nFailed to import the business network card'));
          errors.forEach((err) => {
            cmdUtil.log(err + '\n');
          });
          throw new Error(chalk.red.bold('Errors found in the connection profile in the card'));
        }
        return adminConnection.importCard(cardName, cardToImport);
    }).then(() => {
      cmdUtil.log(chalk.blue.bold('\nSuccessfully imported business network card'));
      cmdUtil.log(chalk.blue('\tCard file: ')+cardFile);
      cmdUtil.log(chalk.blue('\tCard name: ')+cardName);
    });
  },
  install: (card, filename) => {
    const adminConnection = new Admin.AdminConnection();
    
    let definition;
    return adminConnection.connect(card).then(() => {
      const businessNetworkArchive = cmdUtil.getArchiveFileContents(filename);
      return BusinessNetworkDefinition.fromArchive(businessNetworkArchive);
    }).then((definition_) => {
        definition = definition_;
        return adminConnection.install(definition, {archiveFile: filename, card: card});
    }).then((result) => {
      // eslint-disable-next-line no-console
      console.log(chalk.bold.blue(`\n Successfully installed business network ${definition.getName()}, version ${definition.getVersion()}`));
      return result;
    })
    .catch((error) => {
        cmdUtil.log();
        throw error;
    });
  },
  createAndInstall: async (network, version) => {
    let archiveFile = `${baseDir}/${network}@${version}.bna`;
    await module.exports.create(archiveFile).catch(handleErr);
    const spinner = ora('Installing business network. This wont take long...').start();
    await module.exports.install('PeerAdmin@hlfv1', archiveFile).catch(handleErr);
    spinner.succeed();
  },
  readCardFromFile: (cardFileName) => {
    const cardFilePath = path.resolve(cardFileName);
    let cardBuffer;
    try {
      cardBuffer = fs.readFileSync(cardFilePath);
    } catch (cause) {
      const error = new Error(`Unable to read card file: ${cardFilePath}`);
      error.cause = cause;
      return Promise.reject(error);
    }
    return IdCard.fromArchive(cardBuffer);
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
    const cardName = 'PeerAdmin@hlfv1';
    const networkName = network;

        cmdUtil.log(chalk.blue.bold(`Starting business network ${networkName} at version ${version}`));
        cmdUtil.log('');
        const startOptions = cmdUtil.parseOptions(options);

        // grab the network admins
        // what we want is an array of the following: {userName, certificate, secret, file}
        const networkAdmins = cmdUtil.parseNetworkAdmins(options);
        startOptions.networkAdmins = networkAdmins;
        cmdUtil.log(chalk.bold.blue('Processing these Network Admins: '));
        networkAdmins.forEach(e => {
            cmdUtil.log(chalk.blue('\tuserName: ') + e.userName);
        });
        cmdUtil.log('');

        const spinner = ora('Starting business network definition. This may take a minute...').start();
        try {
            const adminConnection = cmdUtil.createAdminConnection();
            await adminConnection.connect(cardName);

            const adminCardMap = await adminConnection.start(networkName, version, startOptions);
            const writeNetworkAdminCardPromises = Array.from(adminCardMap.values()).map(card => {
                // check the networkAdmins for matching name and return the file
                const adminMatch = networkAdmins.find(e => (e.userName === card.getUserName()));
                const fileName = (adminMatch && adminMatch.file) || cmdUtil.getDefaultCardName(card) + '.card';
                return Export.writeCardToFile(fileName, card).then(() => fileName);
            });

            const cardFileNames = await Promise.all(writeNetworkAdminCardPromises);

            spinner.succeed();
            cmdUtil.log(chalk.bold.blue('Successfully created business network card'+(cardFileNames.length>1? 's:':':')));
            cardFileNames.forEach(e => {
                cmdUtil.log(chalk.blue('\tFilename: ') + e);
            });
        } catch (error) {
            spinner.fail();
            throw error;
        }
  },
  installAndUpgrade: async (network, version) => {
    let archiveFile = `${baseDir}/${network}@${version}.bna`;
    let adminCard = 'PeerAdmin@hlfv1';
    await module.exports.create(archiveFile).catch(handleErr);
    const spinner = ora('Installing business network. This wont take long...').start();
    // eslint-disable-next-line no-console
    console.log('');
    await module.exports.install(adminCard, archiveFile);
    spinner.text = 'Upgrading business network definition. This may take a minute... or two...';
    await module.exports.upgrade(network, version, adminCard);
    spinner.succeed();
  },
  upgrade: async (network, version, card) => {
    cmdUtil.log(chalk.blue.bold(`Upgrading business network ${network} to version ${version}`));
    // eslint-disable-next-line no-console
    console.log('');
    const adminConnection = cmdUtil.createAdminConnection();
    await adminConnection.connect(card);
    await adminConnection.upgrade(network, version, {card: card}); // this is the bit that take a while
    // eslint-disable-next-line no-console
    console.log('Network upgraded');
  }
}
