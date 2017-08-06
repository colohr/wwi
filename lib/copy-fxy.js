const fxy = require('fxy')
const paths = require('./paths')('fxy')

//exports
module.exports = function export_fxy_module(folder){
	return new Promise((success,error)=>{
		try{
			folder = paths.valid(folder)
			let destination = paths.ensure.folder(folder)
			console.log(`     • from: ${paths.from}`)
			console.log(`     • to: ${destination}`)
			return fxy.copy_folder(paths.from,destination)
			          .then(success)
			          .catch(error)
		}catch(e){
			return error(e)
		}
	})
}


