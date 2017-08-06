const fxy = require('fxy')

const paths = {
	get data(){ return fxy.join(this.example,this.main,'data.json') },
	example:fxy.join(__dirname,'../../../example'),
	get folder(){ return fxy.join(this.main,'graphics') },
	get graphics(){ return fxy.join(this.example,this.folder) },
	main:'custom-elements/wwe/background/'
}

const graphics = {
	get folders(){ return fxy.list(paths.graphics).dirs.filter(name=>name.charAt(0) !== '.') },
	get trees(){
		return this.folders
		           .map(name=>fxy.join(paths.graphics,name))
		           .map(folder=>fxy.tree(folder,...this.types))
	},
	types:['png','jpg','jpeg','gif','tiff']
}

class BackgroundData{
	constructor(){}
	add(type,items){
		if(!(type in this)) this[type] = {}
		for(let item of items) {
			item.data = get_item_data(type, item)
			
			this[type][item.name] = item.data
		}
		
		return this
	}
}

//exports
module.exports = set_data()

//shared actions
function get_item_data(type,item){
	let data = {}
	let items = item.items.only
	for(let file of items){
		data[file.name] = {
			folder:item.name,
			name:file.name,
			path:get_item_path(file),
			type
		}
		switch(type){
			case 'effects':
				
				let style = {}
				switch(item.name){
					case 'overlay':
						style.backgroundSize = '100% auto'
						style.backgroundPosition = 'center bottom'
						data[file.name].control = 'overlay'
						break
					case 'panorama':
						style.backgroundSize = 'cover auto 100%'
						style.backgroundPosition = 'center center'
						data[file.name].control = 'parallax'
						break
					case 'pattern':
						style.backgroundSize = '50px auto'
						style.backgroundRepeat = 'repeat'
						style.backgroundPosition = 'center center'
						break
					
				}
				data[file.name].style = style
				break
		}
	}
	
	return data
}

function get_item_path(file){
	let path = file.get('path')
	let folder = path.replace(paths.graphics,'')
	                 .split('/')
	                 .filter(item=>item.length)
	                 .join('/')
	
	return fxy.join(paths.folder,folder)
}

function save_data(data){
	let saved_collection = fxy.exists(paths.data) ? require(paths.data):null
	if(saved_collection && JSON.stringify(saved_collection) === JSON.stringify(data)) return false
	fxy.json.writeSync(paths.data,data)
	return true
}

function set_data(){
	let trees = graphics.trees
	let data = new BackgroundData()
	for(let tree of trees){
		let items = tree.items
		data.add(tree.name,items)
	}
	if(save_data(data)) console.log('Updated Graphics')
}