window.fxy.exports('data',(data,fxy)=>{
	
	class Database{
		static get load(){ return load_idb }
		constructor(container){
			if(fxy.is.element(container)){
				this.element = container
			}
			if(fxy.is.text(container)) this.name = container
			else if(this.element){
				if(this.element.hasAttribute('database-name')) this.name = this.element.getAttribute('database-name')
			}
			if(!this.name) this.name = 'local-database'
		}
		get db(){
			return get_idb(this)
		}
		get write(){
			return new Promise((success,error)=>{
				return this.db.then(db=>{
					const transaction = db.transaction(this.name,'readwrite')
					const store = transaction.objectStore(this.name)
					return success({store,transaction})
				}).catch(error)
			})
			
		}
		get read(){
			return new Promise((success,error)=>{
				return this.db.then(db=>{
					const transaction = db.transaction(this.name)
					const store = transaction.objectStore(this.name)
					return success({store,transaction})
				}).catch(error)
			})
		}
		get(name) {
			return this.read.then(({store})=>store.get(name))
			return this.db.then(db => {
				return db.transaction('keyval')
				         .objectStore('keyval').get(key);
			});
		}
		set(name, value) {
			return this.write.then(({store,transaction})=>{
				store.put(value,name)
				return transaction.complete
			})
			return this.db.then(db => {
				const tx = db.transaction('keyval', 'readwrite');
				tx.objectStore('keyval').put(val, key);
				return tx.complete;
			});
		}
		delete(name) {
			return this.write.then(({store,transaction})=>{
				store.delete(name)
				return transaction.complete
			})
			return this.db.then(db => {
				const tx = db.transaction('keyval', 'readwrite');
				tx.objectStore('keyval').delete(key);
				return tx.complete;
			});
		}
		clear() {
			return this.write.then(({store,transaction})=>{
				store.clear()
				return transaction.complete
			})
			return this.db.then(db => {
				const tx = db.transaction('keyval', 'readwrite');
				tx.objectStore('keyval').clear();
				return tx.complete;
			});
		}
		get names(){ return this.keys() }
		keys() {
			return this.read.then(({store,transaction})=>{
				const keys = []
				return get_keys().complete.then(() => keys)
				//shared actions
				function get_keys(){
					// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
					// openKeyCursor isn't supported by Safari, so we fall back
					(store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
						if (!cursor) return
						keys.push(cursor.key)
						cursor.continue()
					})
					return transaction
				}
			})
			return this.db.then(db => {
				const tx = db.transaction('keyval');
				const keys = [];
				const store = tx.objectStore('keyval');
				
				// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
				// openKeyCursor isn't supported by Safari, so we fall back
				(store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
					if (!cursor) return;
					keys.push(cursor.key);
					cursor.continue();
				});
				
				return tx.complete.then(() => keys);
			});
		}
	}
	
	//exports
	data.LocalDatabase = Database
	
	//shared actions
	function get_idb(database){
		//return value
		
		return get_database_idb(database.name)
		//shared actions
		function get_database_data(){
			if('data' in Database) return Database.data
			return Database.data = new Map()
		}
		function get_database_idb(name){
			if(!has_database_idb(name)){
				get_database_data().set(name,data.idb.open(`${name}-store`, 1, upgradeDB => {
					upgradeDB.createObjectStore(name)
				}))
			}
			return get_database_data().get(name)
		}
		function has_database_idb(name){
			if('data' in Database) return Database.data.has(name)
			return false
		}
	}
	
	function load_idb(){
		return new Promise((success,error)=>{
			if('idb' in data) return success(data.idb)
			return fxy.port.eval(components.data.url+'/logic/scripts/idb.js').then(idb=>success(data.idb=idb)).catch(error)
		})
	}
})