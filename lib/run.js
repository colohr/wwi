const clean_folder = require('./clean_folder')
const console = require('better-console')
const fxy = require('fxy')
module.exports.copy = run_copy
module.exports.example = run_example
module.exports.template = run_template



function run_copy(directory,logs) {
	const copy = require('./copy')
	return copy(directory,logs).then(public_modules => {
		//console.info('public modules at')
		//console.warn(public_modules)
		return public_modules
	})
}

function run_example(args) {
	const example = require('./example')
	const example_directory = fxy.join(__dirname, '../example')
	return run_copy(example_directory).then(public_modules => {
		return example({publics: example_directory, modules: public_modules}).listen(args.port).then(app => {
			console.log(app)
			return app
		})
	})
}

function run_template(directory) {
	//const example = require('./example')
	const example_directory = fxy.join(__dirname, '../example')
	let template_wwi_path = fxy.join(directory, 'modules', 'wwi')
	console.info('\n--------------\n','Installing "wwi" at: ', template_wwi_path,'\n--------------')
	return clean_template_folder(template_wwi_path).then(()=>{
		return run_copy(example_directory,false).then(public_modules => {
			return fxy.copy_dir(example_directory, directory)
			          .then(copier => {
				          //console.info('--------------\nwwi ready!\n--------------')
				          return copier
			          })
		})
	})
	
	//return new Promise((success,error)=>{
	//	try{
	//
	//
	//	}
	//	catch(e){ return error(e) }
	//})
}

function clean_template_folder(template_wwi_path){
	return new Promise((success,error)=>{
		try {
			let cleaned = null
			if (fxy.exists(template_wwi_path)) cleaned = clean_folder(template_wwi_path)
			else cleaned = true
			if(cleaned) return success()
			return error(new Error(`unable to clean wwi directories at: ${template_wwi_path}`))
		}
		catch(e){
			return error(e)
		}
	})
}
