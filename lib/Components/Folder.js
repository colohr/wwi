const express = require('express')
const fxy = require('fxy')


class Files{
	constructor(tree,target,options){
		let files = tree.items
		if(files.length){
			let items = files.only
			for(let item of items){
				let name = get_file_name(item)
				this[name] = get_file_data(item,target,options)
			}
		}
		
	}
}

//exports
module.exports.collection = get_collection_router
module.exports.router = get_files_router


//shared actions
function get_collection_router(options){
	let targets = []
	let folders = options.folders || []
	for(let folder of folders){
		let target = folder
		targets.push(get_files_router(options.name,target))
	}
	
	return targets
}

function get_file_data(item,target,options){
	let data = {}
	data.name = item.name
	data.path = item.get('path').replace(target.folder,'')
	data.url = item.get('path').replace(target.folder,target.url || '')
	data.type = item.type
	if(fxy.is.data(options) && options.content) data.content = item.content
	return data
}

function get_file_name(item){
	let name = item.name
	let extension = fxy.extname(name)
	item.type = extension.replace('.','')
	return name.replace(`${extension}`,'')
}

function get_file_tree(target,params){
	if(fxy.is.text(params.folder)){
		let path = get_folder_paths(params.folder)
		let folder_path = fxy.resolve(target.folder,path)
		if(fxy.exists(folder_path)){
			let types = get_file_types(params)
			return fxy.tree(folder_path,...types)
		}
	}
	return null
}

function get_file_types({types}){
	if(fxy.is.text(types)) return types.split(',').map(type=>type.trim()).filter(type=>type.length)
	return []
}

function get_files(target,options){
	return function files_request(request,response){
		return get_request(target,request,options).then(json=>response.json(json)).catch(error=>response.json(error))
	}
}

function get_files_router(name,target){
	const router = express.Router()
	name = fxy.is.text(name) ? `${name}.files`:`files`
	router.get(`/${name}/:folder/:types`,get_files(target))
	router.get(`/${name}.content/:folder/:types`,get_files(target,{content:true}))
	return router
}

function get_folder_paths(folder){
	let paths = folder.split('>').map(item=>item.trim()).filter(item=>item.length)
	return fxy.join(...paths)
}

function get_request(target,request,options){
	return new Promise((success,error)=>{
		let tree = get_file_tree(target,request.params)
		if(tree) return process.nextTick(()=>success(new Files(tree,target,options)))
		return error({error:{message:'Invalid wwi.files request',input:request.params}})
	})
}