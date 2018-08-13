const nodemon = require('nodemon');

//set baseDir to where the app is called
const baseDir = process.cwd();

nodemon({
    script: 'start.js',
    watch: [`${baseDir}/lib`, `${baseDir}/models`],
    ext: 'js json'
  });
  
  nodemon.on('start', function () {
    console.log('App has started');
  }).on('quit', function () {
    console.log('App has quit');
    process.exit();
  }).on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });

  console.log(`${baseDir}/lib`);