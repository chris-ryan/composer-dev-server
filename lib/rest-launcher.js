const { spawn } = require('child_process');

module.exports = {
  //execute shell command: composer-rest-server -c admin@network -n never -w true
  spawn: () => {
    return () => {
      console.log('Launching composer-rest-server');
      restServer = spawn('composer-rest-server', ['-c', 'admin@medicinetracking-network', '-n', 'never', '-w', 'true'], [{ cwd: '/Users/chris/Documents/Development/DREME'}]);
      // capture stdout and stderr of spawned process and output to console.
      restServer.stdout.on('data', (data) => {
        console.log(`composer-rest-server: ${data}`);
      });
      restServer.stderr.on('data', (data) => {
        console.log(`composer-rest-server: ${data}`);
      });
      restServer.on('error', (err) => {
        console.log('Failed to start composer-rest-server');
      });
      restServer.on('close', (code) => {
        console.log(`composer-rest-server stopped`);
      });
      return restServer;
    };
  },
  start: (identifyCard) => {
    console.log('Launching composer-rest-server');
    return spawn('composer-rest-server', ['-c', 'admin@medicinetracking-network', '-n', 'never', '-w', 'true'], [{ cwd: '/Users/chris/Documents/Development/DREME'}]);
  }
}