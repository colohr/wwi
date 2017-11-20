const Collection = require('./Collection')
const Components = require('./Components')
const express = require('express')
const fxy = require('fxy')
const logic = require('./logic')
const request = require('./request')

//exports
module.exports = components_router


//shared actions
function components_router(options,app){ return collection(options,app) }

function collection(options,cloud){
	const collection = Collection.create(options.wwi,cloud)
	const statics = static_index(collection,...(Array.from(collection.values())))
	const wwi_statics = static_index(collection,Components.wwi)
	collection.index = fxy.as.one({},statics.index,wwi_statics.index)
	collection.code = get_collection_code(collection,cloud)
	
	let router = get_router(collection)
	router = set_static_routers(collection,router,statics,wwi_statics)
	return set_folders_routers(router,options)
}

function get_collection_code(collection,cloud){
	const data = {
		components_index:JSON.stringify(collection.index),
		struct_index:JSON.stringify(cloud && 'struct_index' in cloud ? cloud.struct_index:{})
	}
	return logic.code(data)
}

function get_router(collection){
	let router = express.Router()
	router.get(collection.web_path+'/:component',request(collection))
	router.get(collection.web_path+'/:component/index.html',request(collection))
	router.get(collection.index_path,(request,response)=>response.json(collection.index))
	router.get(collection.code_path+'.js',(request,response)=>{
		response.set('Content-Type', 'application/javascript')
		response.set('Cache-Control', `public, ${collection.cache.control}`)
		return send_response(request,response,collection)
		return response.send(collection.code)
	})
	router.get(collection.code_path+'.es6',(request,response)=>{
		response.set('Content-Type', 'application/javascript')
		response.set('Cache-Control', `public, ${collection.cache.control}`)
		return send_response(request,response,collection)
		return response.send(collection.code)
	})
	return router
}

function set_static_routers(collection,router,statics,wwi_statics){
	for(let route of statics.routers) router.use(collection.web_path,route)
	for(let route of wwi_statics.routers) router.use(collection.web_path,route)
	return router
}

function set_folders_routers(router,options){
	const wxy = require('wxy')
	const components_options = options.wwi.components
	const url = options.url
	let folders_router = wxy.files({folder:Components.wwi.folder,url})
	router.use(folders_router)
	if(components_options.folders){
		let routers = wxy.files.collection(components_options,{url})
		for(let folder_router of routers) router.use(folder_router)
	}
	return router
}

function static_index(collection,...items){
	let index = {}
	let routers = []
	for(let components of items){
		routers.push(express.static(components.folder,collection.cache.headers))
		for(let component of components.items){
			let name = component.name
			let path = `${fxy.url(collection.web_url).pathname}/${name}`
			index[name] = {
				library:components.name,
				name,
				path,
				url:`${collection.web_url}/${name}`,
				index_url:`${collection.web_url}/${name}${name.includes('.html') ? '':'/index.html'}`
			}
		}
	}
	return {index,routers}
}

function send_response(request,response,collection){
	if(request.mini){
		if(request.es_file===collection.code_path+'.js' || request.es_file===collection.code_path+'.es6'){
			let file_id = collection.code_path+'.js'
			let file_value = request.mini.has(file_id) ? request.mini.get(file_id) : request.mini.code(file_id,collection.code)
			return response.send(file_value.mini)
		}
	}
	return response.send(collection.code)
}