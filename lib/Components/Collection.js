const fxy = require('fxy')
const template = require('wxy').template.get
const Components = require('./Components')
class Collection extends Map{
	static get create(){ return create_collection }
	constructor(options,cloud){
		options = fxy.is.data(options) ? options:{}
		super()
		this.cache = get_cache(options,cloud)
		this.options = options.components
		this.path = fxy.join(this.main_path,this.components_path)
		this.url = this.options.url || (cloud ? cloud.url:'')
	}
	get code_path(){ return get_code_path(this) }
	get components_path(){ return get_component_path(this) }
	find(name){ return find_item(this,name) }
	get folder(){ return get_folder(this) }
	get folders(){ return get_folders(this)  }
	get index_path(){ return get_index_path(this) }
	get main_path(){ return get_main_path(this) }
	render(item){ return render_item(this,item) }
	get web_path(){ return `/${this.path}` }
	get web_url(){ return `${this.url}/${this.path}` }
	
	
}

//exports
module.exports = Collection

//shared actions
function create_collection(options,cloud){
	let collection = new Collection(options,cloud)
	let folders = collection.folders
	for(let item of folders){
		let components = new Components(item.folder)
		collection.set(components.name,components)
	}
	return collection
}

function find_item(collection,name){
	if(collection.size === 0) return null
	for(let components of collection.values()){
		let component = components.find(name)
		if(component) return component
	}
	return null
}

function get_component_path(collection){
	return fxy.is.text(collection.options.components_path) ? collection.options.components_path : 'components'
}

function get_cache(options,cloud){
	let cache = options.cache ? options.cache:null
	if(!cache && cloud && cloud.options && cloud.options.cache) cache = cloud.options.cache
	if(!cache) cache = {age:0}
	return require('wxy').cache(cache)
}

function get_code_path(collection){
	if('code' in collection.options) return `${collection.options.code}`
	return `/${collection.path}`
}

function get_folder(collection){
	return 'folder' in collection.options ? collection.options.folder:''
}

function get_folders(collection){
	return fxy.is.array(collection.options.folders) ? collection.options.folders:[]
}

function get_index_path(collection){
	if('index' in collection.options) return `${collection.options.index}`
	return `/${collection.path}.json`
}

function get_main_path(collection){
	return fxy.is.text(collection.options.main_path) ? collection.options.main_path:''
}

function render_item(collection,item){
	if('rendered' in item) return item.rendered
	const content = fxy.readFileSync(item.file,'utf8')
	const path = collection.code_path.replace('/','')
	const file = `${path}.js`
	const url = collection.url ? fxy.source.url(collection.url,file):`${file}`
	return item.rendered = template(content,{
		code:`<script src="${url}"></script>`
	})
}
