const fxy = require('fxy')
const template = require('wxy').template.get
const Components = require('./Components')
class Collection extends Map{
	static get create(){ return create_collection }
	constructor(app){
		app = fxy.is.data(app) ? app:{}
		super()
		this.app = app
		this.path = fxy.join(this.main_path,this.components_path)
	}
	get code_path(){
		if('code' in this.app) return `${this.app.code}`
		return `/${this.path}`
	}
	get components_path(){ return fxy.is.text(this.app.components_path) ? this.app.components_path:'components' }
	find(name){
		if(this.size === 0) return null
		for(let components of this.values()){
			let component = components.find(name)
			if(component) return component
		}
		return null
	}
	get folder(){ return 'folder' in this.app ? this.app.folder:'' }
	get folders(){ return fxy.is.array(this.app.folders) ? this.app.folders:[] }
	get index_path(){
		if('index' in this.app) return `${this.app.index}`
		return `/${this.path}.json`
	}
	get main_path(){ return fxy.is.text(this.app.main_path) ? this.app.main_path:'' }
	render(item){
		if('rendered' in item) return item.rendered
		let content = fxy.readFileSync(item.file,'utf8')
		let path = this.code_path.replace("/",'')
		let url = this.url.lastIndexOf('/') === this.url.length-1 ? this.url+path+".js":`${this.url}/${path}.js`
		return item.rendered = template(content,{
			code:`<script src="${url}"></script>`
		})
	}
	get url(){
		if('url' in this.app) return `${this.app.url}`
		return ''
	}
	get web_path(){ return `/${this.path}` }
	get web_url(){
		return `${this.url}/${this.path}`
	}
	
	
}

//exports
module.exports = Collection

//shared actions
function create_collection(app){
	let collection = new Collection(app)
	let folders = collection.folders
	for(let item of folders){
		let components = new Components(item.folder)
		collection.set(components.name,components)
	}
	return collection
}

//function get_path(collection){
//	let main_path =
//	let components_path =
//	let web_path = fxy.join(main_path,components_path)
//	console.log({web_path})
//	app.web_path = web_path
//	return web_path
//}