window.fxy.exports('google',(google,fxy)=>{
	const action_names = {
		account:{
			changed:'onAuthStateChanged',
			create:'createUserWithEmailAndPassword',
			providers:'fetchProvidersForEmail',
			uid:'getUid'
		},
		action_code:{
			apply:'applyActionCode',
			check:'checkActionCode'
		},
		password:{
			confirm:'confirmPasswordReset',
			email:'sendPasswordResetEmail',
			verify:'verifyPasswordResetCode'
		},
		sign_in:{
			redirect_result:'getRedirectResult'
		},
		token:{
			add_listener:'addAuthTokenListener',
			changed:'onIdTokenChanged',
			id:'getIdToken',
			remove_listener:'removeAuthTokenListener'
		}
	}
	
	const collection_events = [ 'added','removed','changed','moved' ]
	
	class Api{
		static get provider(){ return get_provider }
		static get providers(){ return get_providers() }
		static get savable(){ return get_savable }
		constructor(options){
			this.options = fxy.is.data(options) ? options:{}
			this.database = new Data()
			this.users = new Users(this)
		}
		get app(){ return window.firebase.app() }
		get firebase(){ return window.firebase }
		get name(){ return this.constructor.name }
	}
	
	class Users extends fxy.Authority(){
		constructor(api){
			super(fxy.Authority.options(api.options))
			this.get_token_input = function get_account(){
				let user = this.user
				if(user && user.uid) return user.uid
				return null
			}
			this.get_token = function get_token(uid){
				return new Promise((success,error)=>{
					if(uid) return api.database.collection[this.get('tokens')].value[uid].then(x=>x.value).then(success)
					return error(new Error('Unable to request the account token'))
				})
			}
			this.changed(user=>{
				if(user){
					if(this.has('tokens')) return this.authority_token().then(()=>api.changed_user(user)).catch(console.error)
				}
				else this.delete('token')
				if('changed_user' in api) api.changed_user(user)
			})
		}
		get account(){ return get_action('account',this.auth) }
		get action_code(){ return get_action('action_code',this.auth) }
		get auth(){ return window.firebase.auth() }
		get changed(){ return this.account.changed }
		get sign_in(){ return get_action('sign_in',this.auth,'signIn') }
		get sign_out(){ return this.auth.signOut() }
		get user(){ return this.auth.currentUser }
	
	}
	
	class Collection extends Map{
		constructor(reference){
			super()
			this.name = reference.ref.key
			this.child = name=>reference.child(name)
			this.data = ()=>{
				return new Promise((success,error)=>reference.once('value').then(get_snapshot).then(success).catch(error))
			}
			this.on = get_on(this,reference)
		}
		get value(){ return get_value(this) }
		get watch(){ return get_watch(this) }
	}
	
	class Data extends Map{
		get collection(){ return get_collection(this) }
		get database(){ return window.firebase.database() }
	}
	
	
	//exports
	google.firebase = {
		get Api(){ return Api },
		get Data(){ return Data },
		get Users(){ return Users },
		get provider(){ return get_provider },
		get providers(){ return get_providers() }
	}
	
	//shared actions
	function get_action(type,controller,matching){
		let actions = action_names[type]
		let names = get_names(controller)
		return new Proxy(controller,{
			get(o,name){
				let value = null
				if(fxy.is.text(name)){
					name = get_name(o,name)
					if(name in o) value = o[name]
				}
				else if(name in o) value = o[name]
				if(fxy.is.function(value)) value = value.bind(o)
				return value
			}
		})
		//shared actions
		function get_names(object){
			if(fxy.is.object(object) === false || !fxy.is.text(matching)) return []
			return Object.keys(object).filter(name=>name.includes(matching))
		}
		function get_name(o,name){
			if(name in o) return name
			name = fxy.id._(name)
			if(type === 'sign_in' && !name.includes('sign_in')){
				let sign_in_name = fxy.id.code(`sign_in_${name}`)
				if(sign_in_name in o) return sign_in_name
			}
			if(name in actions) return  actions[name]
			else if(names.includes(name)) return name
			return name
		}
	}
	
	function get_collection(data){
		return new Proxy(data,{
			get(o,name){
				if(fxy.is.text(name)){
					let path = fxy.id.path(name)
					if(o.has(path)) return o.get(path)
					return o.set(path,new Collection(o.database.ref(path))).get(path)
				}
				return null
			},
			has(o,name){ return o.has(name) }
		})
	}
	
	function get_on(collection,reference){
		return new Proxy(connect(),{
			get(o,name){
				if(o.has(name)) return o.get(name)
				if(name === 'disconnect') return disconnect
				return null
			},
			has(o,name){ return o.has(name) },
			set(o,name,action){
				if(fxy.is.text(name)) o.set(name,action)
				return true
			}
		})
		//shared actions
		function connect(){
			for(let name of collection_events){
				reference.on(`child_${name}`, (...x) => {
					x[0]=get_snapshot(x[0])
					if(collection.has(name)) return collection.get(name)(...x)
				})
			}
			return collection
		}
		function disconnect(){
			for(let name of collection_events){
				reference.off(`child_${name}`)
				collection.delete(name)
			}
			return collection
		}
	}
	
	function get_provider(name){
		name = get_provider_name(name)
		if(name) return new (window.firebase.auth[name])()
		return null
	}
	
	function get_provider_name(provider){
		if(!fxy.is.text(provider)) provider = 'google'
		let providers = get_providers()
		if(provider in providers) return provider
		provider = fxy.id.class(provider)
		if(provider in providers) return provider
		provider = `${provider}AuthProvider`
		if(provider in providers) return provider
		return null
	}
	
	function get_providers(){
		let names = Object.keys(window.firebase.auth).filter(name=>name.includes('Provider'))
		return new Proxy(names,{
			get(o,name){ return o.includes(name) ? window.firebase.auth[name]:null },
			has(o,name){ return o.includes(name) }
		})
	}
	
	function get_savable(value){
		if(fxy.is.array(value)){
			let o = {}
			value.forEach((item,i)=>o[i] = item)
			return o
		}
		return value
	}
	
	function get_snapshot(snapshot){
		return new Proxy(snapshot,{
			get(o,name){
				let value = null
				switch(name){
					case 'array':
						value = o.val()
						return fxy.is.nothing(value) ? []:Object.keys(value).map(key=>{return value[key]})
					case 'count':
					case 'length':
						return o.numChildren()
					case 'data':
					case 'value':
						return o.val()
					case 'empty': return o.exists() === true ? o.numChildren() === 0:true
					case 'nothing': return fxy.is.nothing(o.val())
				}
				if(name in o) {
					value = o[name]
					if(fxy.is.function(value)) value.bind(o)
				}
				return value
			}
		})
	}
	
	function get_value(collection){
		return new Proxy(collection,{
			get(o,name){
				if(fxy.is.text(name)) return value(o,name)
				return null
			}
		})
		//shared actions
		function value(o,name){
			return new Promise((success,error)=>{
				let child = o.child(name)
				return child.once('value')
				            .then(snapshot=>get_snapshot(snapshot))
				            .then(success)
				            .catch(error)
			})
		}
	}
	
	function get_watch(collection){
		return new Proxy(collection,{
			deleteProperty(o,name){ return unwatch(o,`${name}-watcher`) },
			get(o,name){
				let id = `${name}-watcher`
				if(o.has(id)) return o.get(id)
				return null
			},
			has(o,name){
				let id = `${name}-watcher`
				return o.has(id)
			},
			set(o,name,value){
				if(fxy.is.function(value)) {
					let watcher = watch(o,name,value)
					o.set(watcher.id,watcher)
				}
				return true
			}
		})
		//shared actions
		function watch(o,name,action){
			let id = `${name}-watcher`
			unwatch(o,id)
			let watcher = { id, name }
			let path = fxy.id.path(name)
			watcher.action = function watcher_action(snapshot){ return action(get_snapshot(snapshot)) }
			o.child(path).on('value',watcher.action)
			return watcher
		}
		function unwatch(o,id){
			if(!o.has(id)) return true
			let watcher = o.get(id)
			let path = fxy.id.path(name)
			o.child(path).off('value',watcher.action)
			o.delete(id)
			return true
		}
	}
	
	
})