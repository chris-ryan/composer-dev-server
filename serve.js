const nodemon = require('nodemon');

//set baseDir to where the app is called
const baseDir = process.cwd();

nodemon({
    script: 'start.js',
    watch: [`${baseDir}/lib`, `${baseDir}/models`],
    ext: 'js json',
  });

  // nodemon('-e "js json" app.js');
  
  nodemon.on('start', function () {
    console.log(`baseDir: ${baseDir}`);
    console.log('App has started');
  })
  .on('restart', function() {
    console.log('watch has triggered');
  }).on('quit', function () {
    console.log('App has quit');
    process.exit();
  }).on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });

  console.log(`${baseDir}/lib`);