const fxy = require('fxy')
const yargs = require('yargs')
const run = require('./run')
const args =  yargs
    .usage('Usage: $0 <command> [options]')
    .command('public', 'Set the name of the public directory & create modules/wwi folder')
    .alias('wwi', 'public')
    .command('test', 'Define port to create & run test + examples on localhost:${test}')
    .alias('port','test')
    .alias('example','test')
    .command('template', 'Creates a template directory like example setup')
    .help('h')
    .alias('h', 'help')
    .epilog('colohr.code@gmail.com - world wide internet - wwi')
    .argv;



module.exports = run
module.exports.app = require('./app')

if(args.test){
  run.example(args).then(app=>{
    console.log('wwi running examples on')
    console.log(app.url)
  }).catch(console.error)
}
else if(args.public){
  run.copy(args.public).then(()=>{
    console.log('wwi copy finished')
    process.exit(0)
  }).catch(console.error)
}
else if(args.template){
  run.template(args.template).then(()=>{
    console.log('wwi template finished')
    process.exit(0)
  }).catch(console.error)
}
