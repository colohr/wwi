const fxy = require('fxy')
const paths = require('./paths')('example')

//exports
module.exports = function export_template_module(folder){
	return new Promise((success,error)=>{
		try{
			let destination = paths.valid(folder)
			console.log(`     • from: ${paths.from}`)
			console.log(`     • to: ${destination}`)
			return fxy.copy_folder(paths.from,destination)
			          .then(success)
			          .catch(error)
		}
		catch(e){ return error(e) }
	})
}