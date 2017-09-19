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
function collection(options,app){
	let collection = Collection.create(options)
	let statics = static_index(collection,...(Array.from(collection.values())))
	let wwi_statics = static_index(collection,wwi_components)
	collection.index = fxy.as.one({},statics.index,wwi_statics.index)
	collection.code = logic.code({index:JSON.stringify(collection.index)})
	
	let router = get_collection_router(collection)
	router = set_static_routers(collection,router,statics,wwi_statics)
	return set_folders_routers(router,options,app)
}


function get_collection_router(collection){
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

function set_folders_routers(router,options,{url}){
	const wxy = require('wxy')
	let folders_router = wxy.files({folder:wwi_components.folder,url})
	//router.use(wwi_components.folders_router)
	router.use(folders_router)
	if(options.folders){
		let routers = wxy.files.collection(options,{url})
		for(let folder_router of routers) router.use(folder_router)
	}
	return router
}