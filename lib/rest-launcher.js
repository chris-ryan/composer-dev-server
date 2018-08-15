const { spawn } = require('child_process');

module.exports = {
  //execute shell command: composer-rest-server -c admin@network -n never -w true
  start: (identifyCard) => {
    const restServer = spawn('composer-rest-server', [`-c ${identityCard}`, '-n never', '-w true'], [{ cwd: '/Users/chris/Documents/Development/DREME'}]);
    console.log(restServer);
  }
}