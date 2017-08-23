wwi.exports('user',(_user,fxy)=>{
	
	class Provider{
		static get list(){
			
			let keys = firebase ? Object.keys(firebase.auth).filter((key)=>{ return key.includes('Provider'); }):[];
			let values = keys.length ? keys.map((key)=>{ return [firebase.auth[key].PROVIDER_ID,key.replace('AuthProvider','')]; }):[];
			let map = new Map(values)
			return {
				keys,
				map,
				get providers(){ return this.keys.map((key)=>{ return firebase.auth[key]; }); },
				getKey(key){ return this.keys.filter((k)=>{ return k.includes(key); })[0]; },
				byId(id){ return this.providers.filter((p)=>{ return p.PROVIDER_ID === id; })[0]; },
				byName(name){ let key = this.getKey(name); return key ? firebase.auth[key]:null; }
			}
		}
		static get commonScope(){
			return ['email','photoURL','displayName','contact_email']
		}
		static get scopes(){
			return new Map([
				[ 'Facebook', ['user_friends','contact_email','user_email','first_name','last_name'] ],
				[ 'Email', null ],
				[ 'Google', Provider.commonScope ],
				[ 'Twitter', ['followers','email','contact_email','website'] ],
				[ 'Github', Provider.commonScope ]
			])
		}
		static get commons(){ return Array.from(this.scopes.keys()) }
		static get profiles(){return ['uid','emailVerified','isAnonymous','providerId' ]}
		static get Keys(){
			let keys = this.profiles;
			let scopes = this.scopes;
			Array.from(scopes.values()).forEach((scope)=>{
				if(Array.isArray(scope)){
					scope.forEach((key)=>{
						if(!keys.includes(key)) keys.push(key);
					});
				}
			});
			return keys;
		}
		static get Create(){
			return {
				name:'Create',
				providerId:'create',
				id:'create',
				needsLogin:true
			}
		}
		static getName(name){
			var id = null
			if(typeof name !== 'string') name = 'Create';
			name = name.toLowerCase().replace('authprovider','').replace('.com','').trim();
			id = this.commons.map((key)=>{
				if( key.toLowerCase() === name ) return key;
				return false;
			}).filter((key)=>{
				return key !== false;
			})[0];
			let Aliases = {
				'password':'Email',
				'create':'Create'
			};
			if(name in Aliases) id = Aliases[name]
			return id;
		}
		static getKey(id){ return this.getName(id); }
		static getProviderName(id){
			id = this.getKey(id)
			if(this.commons.includes(id)) return id+'AuthProvider'
			return id;
		}
		
		
		static getProviderValue(provs,key){
			var val = null;
			if(Array.isArray(provs) && typeof key === 'string'){
				provs.forEach((prov)=>{
					if(prov[key]) val = prov[key];
				})
			}
			return val;
		}
		
		static getDataValue(key,data){
			if(typeof data === 'object' && data && typeof key === 'string'){
				if(!data[key] || data[key] === 'firebase'){
					if(Array.isArray(data.providerData)){
						return this.getProviderValue(data.providerData,key)
					}
				}else return data[key]
			}
			return null;
		}
		
		
		static Profile( data ){
			let keys = this.Keys;
			let profile = {}
			keys.forEach((key)=>{
				if(!profile[key]) profile[key] = this.getDataValue(key,data)
			})
			return profile;
		}
		
		static Id(id){
			let prov = this.Provider(this.getProviderName(id))
			if(prov && prov.PROVIDER_ID) return prov.PROVIDER_ID
			return id;
		}
		static Provider(id){
			let name = this.getProviderName(id);
			var provider = null
			if(name in firebase.auth) provider = firebase.auth[name]
			if(!provider || name === 'Create' || provider === null) provider = this.Create;
			let scopes = this.scopes;
			let key = this.getKey(name)
			let scope = scopes.has(key) ? scopes.get(key):(scopes.has(id) ? scopes.get(id):this.commonScope);
			if(Array.isArray(scope) && provider.addScope){
				scope.forEach((key)=>{
					provider.addScope(key);
				})
			}
			if(name !== 'Create' && typeof provider === 'function') return new provider();
			return provider;
		}
		
		
		
		constructor(){}
		
		get data(){return this.has('data') ? this.get('data'):{}; }
		set data(data){
			let lastData = this.get('data');
			if(data === null || typeof data !== 'object') {
				this.delete('data');
			}
			else{
				this.set('data',data);
			}
			if(lastData === this.get('data')) return lastData;
			else if(this.updateData) this.updateData(data,lastData)
			return this.has('data');
		}
		get auth(){ return window.firebase ? window.firebase.auth():null }
		get uid(){ return this.profile.uid; }
		
		get providerId(){ return this.profile ? this.profile.providerId:null; }
		get provider(){ return this.constructor.Provider(this.providerId); }
		get profile(){ return this.constructor.Profile(this.data); }
		get photoURL(){ return this.profile.photoURL; }
		get providers(){
			let promise = new Promise((resolve)=>{return resolve([])})
			if(!this.email) return promise;
			let auth = this.auth;
			if(auth) return auth.fetchProvidersForEmail(this.email);
			return promise;
			return this.constructor.list;
		}
		get provider_list(){
			return new Proxy(this.constructor.list,{
				get(o,name){
					if(name in o) return o[name]
					let names = Array.from(o.map.values())
					switch(name){
						case 'names':
							return names
							break
						default:
							if(names.includes(fxy.id.proper(name))) return o.byName(fxy.id.proper(name))
							if(o.map.has(name)) return o.byName(o.get(name))
							break
					}
					return null
				}
			})
		}
		
	}
	
	class Account extends Provider {
		
		get name() {return this.displayName; }
		
		get displayName() { return this.profile.displayName; }
		
		set displayName(v) { return this.input('displayName', v); }
		
		get email() { return this.profile.email || null; }
		
		set email(v) { return this.input('email', v) }
		
		get emailVerified() { return this.profile.emailVerified; }
		
		get isAnonymous() { return this.profile.isAnonymous; }
		
		get loggedIn() {return typeof this.data.uid === 'string'}
		
		get sessionId() {return this.Context.get('session-id')}
		
		constructor(data) {
			super(data)
			this.set('session-id', Date.now())
		}
		
		Delete() {return this.data && this.data.delete ? this.data.delete() : new Promise((resolve) => {return resolve({needsLogin: true})})}
		
		Reload() {return this.data && this.data.reload ? this.data.reload() : new Promise((resolve) => {return resolve({needsLogin: true})})}
		
		SendVerification() { return this.data && this.data.sendEmailVerification ? this.data.sendEmailVerification() : new Promise((resolve) => {return resolve({needsLogin: true})}) }
		
		ReAuthorize(credential) { return this.data && this.data.reauthenticate ? this.data.reauthenticate(credential) : new Promise((resolve) => {return resolve({needsLogin: true})}) }
		
		Link(credential) { return this.data && this.data.link ? this.data.link(credential) : new Promise((resolve) => {return resolve({needsLogin: true})}) }
		
		Unlink(providerId) { return this.data && this.data.unlink ? this.data.unlink(providerId) : new Promise((resolve) => {return resolve({needsLogin: true})}) }
		
		getProfileChanges(state, changes) {
			var changed = {};
			for (var key in state) {
				if (typeof changes[key] === 'string') {
					if (changes[key] !== state[key]) {
						changed[key] = changes[key]
					}
				}
			}
			return changed;
		}
		
		updateEmail(email) {
			if (this.data && this.data.updateEmail) {
				return this.data.updateEmail(email)
			}
			return new Promise((resolve) => {return resolve()})
		}
		
		updateProfile(profile) {
			if (this.data && this.data.updateProfile) return this.data.updateProfile(profile);
			return new Promise((resolve) => {return resolve()})
		}
		
		get session() {
			let data = this.data && this.data.toJSON ? this.data.toJSON() : {};
			if (data.stsTokenManager) {
				let out = data.stsTokenManager;
				out.sessionId = this.sessionId;
				return out;
			}
			return {token: false, date: new Date(), expires: Date.now()};
		}
		
		json() {
			if (!this.loggedIn) return {needsLogin: true}
			var profile = this.profile;
			profile.uid = this.uid;
			return profile;
		}
	}
	
	

	
	_user.Account = Account
	
	
})