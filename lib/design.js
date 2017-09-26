const fxy = require('fxy')
const folder = fxy.join(__dirname,'../modules/design')
const icons_folder = fxy.join(folder,'icons')
const default_icons = require('./icons.json')
//exports
module.exports = design_router

//shared actions
function design_router(url){
	const router = require('wxy').router()
	const json = get_icons_map(url)
	router.use('/icons.json',function(request,response){response.json(json)})
	router.use('/:collection/icons.json',function(request,response){
		let collection = request.params.collection
		if(collection && collection in json){
			return response.json(json[collection])
		}
		return response.json({})
	})
	return router
}

function get_icons(){ return fxy.tree(icons_folder,'svg','txt').items.only }
function get_icons_map(url){
	let files = get_icons()

	let json = {
		index:[]
	}
	for(let name in default_icons){
		let value = default_icons[name]
		let icon = {}
		if(typeof value === 'string'){
			icon.svg = value
		}else icon = value
		icon.name = name
		json.index.push([name,icon])
	}
	for(let file of files){
		let item = {}
		let extension = fxy.extname(file.name)
		let type = extension.replace('.','')
		item.name = file.name.replace(extension,'')
		item.file = file.name
		let path = file.get('path').replace(icons_folder,'')
		let collection = fxy.dirname(path).replace('/','')
		let map = null
		if(!(collection in json)) map = json[collection] = []
		else map = json[collection]
		let content = file.content
		item.url = type === 'txt' ? content:fxy.source.url(url,'modules','design','icons',path)
		if(type === 'svg') item.svg = content
		map.push([item.name,item])
	}
	return json
}