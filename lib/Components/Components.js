const fxy = require('fxy')
const components_items = Symbol('Components items')
const components_name = Symbol('Components name')
const wwi_components = Symbol('WWI Components')

class Components{
	static get wwi(){
		if(wwi_components in this) return this[wwi_components]
		const wwi_components_folder = fxy.join(__dirname,'../../components')
		return this[wwi_components] = new Components(wwi_components_folder,'wwi')
	}
	constructor(folder,name){
		this.folder = fxy.is.text(folder) && fxy.exists(folder) ? folder:null
		if(this.folder === null) throw new Error(`WWI Components folder: "${folder}" does not exist.`)
		if(fxy.is.text(name)) this[components_name] = name
	}
	
	find(name){
		let matches = this.items.filter(item=>item.name === name)
		if(matches.length) {
			let component = matches[0]
			if(!component.file){
				let path = component.get('path')
				let file = null
				if(component.get('type').directory) {
					file = fxy.join(path,'index.html')
					if(fxy.exists(file) !== true) component.error = new Error(`Component named:"${component.name}" is invalid the  index file:"${file}" does not exist.`)
				}
				else file = path
				component.file = file
			}
			return component
		}
		return null
	}
	get items(){
		if(components_items in this) return this[components_items]
		return this[components_items] = fxy.tree(this.folder).items
	}
	get name(){
		if(components_name in this) return this[components_name]
		return fxy.basename(this.folder)
	}
}

//exports
module.exports = Components