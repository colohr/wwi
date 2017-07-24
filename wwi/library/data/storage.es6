wwi.exports('data', (data, fxy) => {
	const indexed_storage = Symbol('indexed storage')
	const item_store_name = Symbol('item store name')
	class StorageItem{
		constructor(values,store_name){
			this[item_store_name] = store_name
			if(fxy.is.data(values)){
				Object.assign(this,values)
			}
		}
	}
	
	class Storage extends Map {
		constructor(listener) {
			super([['listener', listener]])
		}
		get listener(){ return fxy.is.element(this.get('listener')) ? this.get('listener'):document }
		open(name) {
			this.name = name
			return this
		}
		save(item,store_name){
			item = new StorageItem(item,store_name)
			return item
		}
	}
	
	
	
	const StorageMix = Base => class extends Base {
		get storage() {
			if (indexed_storage in this) return this[indexed_storage]
			return this[indexed_storage] = new Storage(this)
		}
	}
	Storage.Mix = StorageMix
	data.Storage = Storage
	
})
    

    
