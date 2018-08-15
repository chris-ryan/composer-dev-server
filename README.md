# composer-rest-devserv

A wrapper for running a development [composer-rest-service](https://github.com/hyperledger/composer) instance with automatic restart on saved changes to the logic or model.

## Installation Prerequisites

Make sure you have [Node.js](http://nodejs.org/) and the [Composer CLI tools](https://hyperledger.github.io/composer/latest/installing/development-tools.html) installed.

```sh
git clone https://github.com/chris-ryan/composer-rest-devserv # or clone your own fork
cd composer-rest-devserv
npm install

```

## Execution

### Runtime Prerequesites
Before running, you'll need to start your local fabric and create a business network card.
eg:
```sh
cd ~/fabric-dev-servers
// export FABRIC_VERSION=hlfv12
./startFabric.sh
./createPeerAdminCard.sh
```

###

## Configuration
The REST Server can be configured by declaring environment variables before executing composer-dev-server
Eg:
```sh
COMPOSER_TLS=true
COMPOSER_TLS_CERTIFICATE=/tmp/cert.pem
COMPOSER_TLS_KEY=/tmp/key.pem
```

The list of available options can be found in the [Hyperledger docs](https://hyperledger.github.io/composer/latest/reference/rest-server)