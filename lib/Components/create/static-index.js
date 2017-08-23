const express = require('express')
const fxy = require('fxy')

//exports
module.exports = get_collection_static_index

//shared actions
function get_collection_static_index(collection,...items){
	let index = {}
	let routers = []
	for(let components of items){
		routers.push(express.static(components.folder,{maxage:'30d'}))
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

