const modules = require('./copy')



//exports
module.exports = (folder)=>{
	console.log(`\n-----WWI-----`)
	let copies = []
	return new Promise((success,error)=>{
		return copy_next(folder,copies,success,error)
	})
}

//shared actions
function copy_folder_module(name,folder){
	return modules[name](folder).then(_=>{
		console.log(`\t  --> COPIED`)
		return name
	})
}

function copy_next(folder,copies,success,error){
	for(let name in modules){
		if(copies.includes(name) !== true){
			console.log(`  ${copies.length+1}. ${name}`)
			return copy_folder_module(name,folder).then(module_name=>{
				copies.push(module_name)
				return copy_next(folder,copies,success,error)
			}).catch(error)
		}
	}
	console.log(`-------------`)
	return success(copies)
}


