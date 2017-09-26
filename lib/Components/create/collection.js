const express = require('express')
const fxy = require('fxy')
const Collection = require('../Collection')
const request = require('./request')
const logic = require('../logic')
const static_index = require('./static-index')
const wwi_components = require('./components')

//exports
module.exports = collection

//shared actions
function collection(options,cloud){
	const collection = Collection.create(options.wwi,cloud)
	const statics = static_index(collection,...(Array.from(collection.values())))
	const wwi_statics = static_index(collection,wwi_components)
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
		response.set('Cache-Control', 'public, max-age=2592000')
		return response.send(collection.code)
	})
	router.get(collection.code_path+'.es6',(request,response)=>{
		response.set('Content-Type', 'application/javascript')
		response.set('Cache-Control', 'public, max-age=2592000')
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
	let folders_router = wxy.files({folder:wwi_components.folder,url})
	router.use(folders_router)
	if(components_options.folders){
		let routers = wxy.files.collection(components_options,{url})
		for(let folder_router of routers) router.use(folder_router)
	}
	return router
}