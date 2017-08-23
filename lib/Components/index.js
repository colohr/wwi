const create = require('./create')
//const Files = require('./Files')

//const express = require('express')
//const fxy = require('fxy')
//const logic = require('./logic')

//exports
module.exports = new Proxy(get_router,{
	get:get_value,
	has:has_value
})

//shared actions
function get_router(options){ return create.collection(options) }

function get_value(o,name){
	if(name in o) return o[name]
	if(name in create.components) return create.components[name]
	switch(name){
		case 'Components':
			return require('./Components')
			break
		case 'Collection':
			return require('./Collection')
			break
		case 'Folder':
			return require('./Folder')
			break
		case 'wwi':
			return create.components
			break
	}
	return null
}

function has_value(o,name){
	if(name in o) return true
	else if(name in create.components) return true
	if(['Components','Collection','Folder','wwi'].includes(name)) return true
	return false
}


//function get_router_old(options){
//	let collection = Collection.create(options)
//	let statics = get_collection_static_index(collection,...(Array.from(collection.values())))
//	let wwi_statics = get_collection_static_index(collection,wwi_components)
//	collection.index = fxy.as.one({},statics.index,wwi_statics.index)
//	collection.code = logic.code({index:JSON.stringify(collection.index)})
//
//	let router = express.Router()
//	router.get(collection.web_path+'/:component',get_component_request(collection))
//	router.get(collection.web_path+'/:component/index.html',get_component_request(collection))
//	router.get(collection.index_path,(request,response)=>response.json(collection.index))
//
//	router.get(collection.code_path+'.js',(request,response)=>{
//		response.set('Content-Type', 'application/javascript')
//		response.set('Cache-Control', 'public, max-age=2592000')
//		return response.send(collection.code)
//	})
//
//	router.get(collection.code_path+'.es6',(request,response)=>{
//		response.set('Content-Type', 'application/javascript')
//		response.set('Cache-Control', 'public, max-age=2592000')
//		return response.send(collection.code)
//	})
//
//	for(let route of statics.routers) router.use(collection.web_path,route)
//	for(let route of wwi_statics.routers) router.use(collection.web_path,route)
//
//	router.use(wwi_components.files_router)
//	if(options.files && fxy.is.text(options.files)) {
//		let file_router = Files.router({folder:options.files})
//		router.use(file_router)
//	}
//
//	return router
//}




