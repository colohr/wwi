const fxy = require('fxy')
const root = fxy.join(__dirname,'../')

//exports
module.exports = (name)=>{
	if(typeof name !== 'string') throw new Error(`Invalid name for wwi paths`)
	return {
		ensure:{
			name,
			modules:ensure_modules,
			folder(folder){ return ensure_folder(this.modules(folder),this.name) }
		},
		get modules(){return fxy.join(this.root,'modules')},
		name,
		get folder(){
			if(this.name === 'example') return fxy.join(this.root,this.name)
			return fxy.join(this.modules,this.name)
		},
		get from(){return this.folder},
		root,
		valid:get_valid_folder
	}
}

//shared actions
function ensure_folder(folder,name){
	let folder_path = get_valid_folder(fxy.join(folder,name))
	if(fxy.exists(folder_path)) return folder_path
	fxy.make_folder.sync(folder_path)
	return folder_path
}

function ensure_modules(folder){
	let modules_folder = get_modules_folder(folder)
	if(fxy.exists(modules_folder)) return modules_folder
	fxy.make_folder.sync(modules_folder)
	return modules_folder
}

function get_modules_folder(folder){
	folder = get_valid_folder(folder)
	return fxy.join(folder,'modules')
}

function get_valid_folder(folder){
	if(!fxy.is.text(folder)) throw new Error(`Invalid folder`)
	folder = fxy.resolve(folder)
	if(folder.includes(root)) throw new Error(`WWI module folder cannot be used`)
	return folder
}
