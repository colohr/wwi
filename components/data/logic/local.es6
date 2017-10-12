window.fxy.exports('data',(data,fxy)=>{
	
	class LocalStorage{
		static get load(){ return load() }
		constructor(name){ this.name = name }
		clear(){ return this.driver.clear() }
		get count(){ return this.driver.length() }
		delete(name) { return this.driver.removeItem(name) }
		get driver(){ return get_driver(this) }
		filter(on_item){ return this.values().then(values=>values.filter(on_item)) }
		get(name){ return this.driver.getItem(name) }
		map(on_item){ return this.values().then(values=>values.map(on_item)) }
		name(index){ return this.driver.key(index) }
		get names(){ return this.driver.keys() }
		set(name, value) { return this.driver.setItem(name,value) }
		values(){
			return new Promise((success,error)=>{
				const values = []
				return this.driver
				           .iterate((value)=>values.push(value))
				           .then(()=>success(values))
				           .catch(error)
			})
		}
	}
	
	
	//load
	load()
	//exports
	data.LocalDatabase = LocalStorage
	
	//shared actions
	function get_driver(database){
		//return value
		return get_store(database.name)
		//shared actions
		function get_data(){
			if('data' in LocalStorage) return LocalStorage.data
			return LocalStorage.data = new Map()
		}
		function get_store(name){
			if(!has_store(name)) get_data().set(name,data.local_forage.createInstance({name}))
			return get_data().get(name)
		}
		function has_store(name){
			if('data' in LocalStorage) return LocalStorage.data.has(name)
			return false
		}
	}
	
	function load(){
		return new Promise((success,error)=>{
			if('local_forage' in data) return success(data.local_forage)
			fxy.port.eval(fxy.file.url(window.components.data.url,'/logic/scripts/local-forage.js'))
			   .then(local_forage=>success(data.local_forage=local_forage))
			   .catch(error)
			return null
		})
	}
})