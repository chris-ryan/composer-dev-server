# composer-dev-server

A wrapper for running a development [composer-rest-service](https://github.com/hyperledger/composer) instance with automatic restart on saved changes to the logic or model.

## Installation Prerequisites

Make sure you have [Node.js](http://nodejs.org/), the [Composer CLI tools](https://hyperledger.github.io/composer/latest/installing/development-tools.html) and [composer-rest-server](https://www.npmjs.com/package/composer-rest-server) installed.

## Installation instructions
```sh
git clone https://github.com/chris-ryan/composer-dev-server.git # or clone your own fork
npm install -g composer-dev-server

```

## Execution

### Runtime Prerequesites
Before running, you'll need to start your local fabric and create a business network card.
eg:
```sh
cd ~/fabric-dev-servers
./startFabric.sh
./createPeerAdminCard.sh
```

### Running the dev server

Change the root of your hyperledger's project directory.
eg:
```sh
cd ~/Development/my-hyperledger
```

start the rest server (and watcher) using the command composer-dev-server
```sh
composer-dev-server
```

### Terminating the dev server

ctrl + c

## Configuration
The REST Server can be configured by declaring environment variables before executing composer-dev-server
Eg:
```sh
COMPOSER_TLS=true
COMPOSER_TLS_CERTIFICATE=/tmp/cert.pem
COMPOSER_TLS_KEY=/tmp/key.pem
```

The list of available options can be found in the [Hyperledger docs](https://hyperledger.github.io/composer/latest/reference/rest-server)