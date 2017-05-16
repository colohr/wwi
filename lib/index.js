const fxy = require('fxy')
const yargs = require('yargs')
const args =  yargs
    .usage('Usage: $0 <command> [options]')
    .command('public', 'Set the name of the public directory & create modules/wwi folder')
    .alias('wwi', 'public')
    .command('test', 'Define port to create & run test + examples on localhost:${test}')
    .alias('port','test')
    .help('h')
    .alias('h', 'help')
    .epilog('colohr.code@gmail.com - world wide internet - wwi')
    .argv;




if(args.test){
  run_example().then(app=>{
    console.log('wwi running examples on')
    console.log(app.url)
  }).catch(console.error)
}
else if(args.public){
  run_copy(args.public).then(()=>{
    console.log('wwi copy finished')
    process.exit(0)
  }).catch(console.error)
}
else yargs.showHelp()





function run_copy(directory){
  const copy = require('./copy')
  return  copy(directory).then(public_modules=>{
    console.log('public modules at')
    console.log(public_modules)
    return public_modules
  })
}

function run_example(){
  const example = require('./example')
  const example_directory = fxy.join(__dirname,'../example')

  return run_copy(example_directory).then(public_modules=>{
    return example({publics:example_directory,modules:public_modules}).listen(args.port).then(app=>{
      console.log(app)
      return app
    })
  })
}