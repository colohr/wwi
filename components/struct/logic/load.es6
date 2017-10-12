window.fxy.exports('struct',(struct,fxy)=>{
	struct.library = {folder:window.components.struct.path}
	//load
	load()
	//exports
	struct.load = {
		get actions(){ return load_actions },
		get index(){ return get_index },
		get ui(){ return load_ui },
		get url(){ return get_url }
	}
	
	//shared actions
	function get_index(index){ return window.components[index].struct }
	
	function get_url(...paths){
		return fxy.file.url(struct.library.url,'external',...paths)
	}
	
	function load(){
		fxy.port.eval(fxy.file.url(window.components.struct.path,'logic/Interface.es6')).then(Interface=>struct.Interface = Interface)
		return null
	}
	
	function load_actions(item,type){
		if(fxy.is.text(item)) item = {file:item}
		if(!fxy.is.text(type)) type = 'text'
		return new Promise((success,error)=>{
			let name = struct.Actions.get_name(item.file,item.name)
			let action = struct.Actions.get(name)
			if(action) return success(action)
			return window.fetch(item.file).then(x=>x[type]()).then(content=>{
				if(fxy.is.text(content)) item.content = content
				else if(fxy.is.array(content)) item = content[0]
				else item = content
				return success(struct.Actions.get(name,item))
			}).catch(error)
		})
	}
	
	function load_ui(){
		return new Promise((success,error)=>{
			if('UI' in struct) return success(struct.UI)
			return fxy.port.eval(fxy.file.url(struct.library.folder,'external/UI.es6'))
			          .then(UI=>struct.UI = UI)
			          .then(success).catch(error)
		})
	}
	
})