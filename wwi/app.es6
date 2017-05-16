
(function (root, init) { return  init(root) }
(this, function (window) {
	const baseURL = window.baseURL || (['//' + window.location.host].join(''))
	const getSource = window.getSource || function getSource(filepath) {
			if (filepath.includes('https://') || filepath.includes('http://')) return filepath;
			return `${baseURL}/${filepath}`;
		}
		
	const loadScript = function loadScript(src, defer, async) {
		return new Promise(function (resolve, reject) {
			var type = src.includes('.js') ? 'script' : 'link';
			var script = document.createElement(type);
			if (defer !== false) script.setAttribute('defer', '');
			if (async !== false) script.setAttribute('async', '');
			if (src.includes('.js')) script.src = src;
			else script.href = src;
			if (src.includes('.html') || src.includes('.css')) script.rel = src.includes('.html') ? 'import' : 'stylesheet';
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}
	const promise = function (files, defer, async) {
		console.log(files)
		if (!Array.isArray(files) || files.length === 0) return new Promise((resolve) => {return resolve(files)})
		return Promise.all(files.map((source) => {return loadScript(getSource(source), defer, async); }));
	}
	
	return (function (root, factory, bootstrap, factories) { return factory(root, bootstrap, factories) })(
		window,
		function appkit(window, bootstrap, factories) { return bootstrap(window, factories) },
		function bootstrap(window, Factories) {
			
			const document = window.document
			const body = document.body
			var Factory = Factories(window)
			
			//top level application stuff
			const Cache = new Map([
				['ready', new Set()],
				['ApplicationRequirements', []]
			])
			const Dependents = []
			const Mixins = {}
			const Selectors = new Map([
				['user.account', '[is-user-account]'],
				['user.popover', '[is-user-popover]']
			])
			
			//helper actions
			const Helpers = Factory.CreateHelper()
			
			//helper classes
			const Supers = Factory.CreateSupers( Helpers )
			const SuperString = Supers.SuperString
			const QueryParams = Supers.QueryParams
			
			//application router
			const Route = Factory.CreateRoute( QueryParams )
			const State = Route.State
			
			
			
			class ApplicationMap extends Map {
				//cache of stuff
				get Cache() { return Cache }
				//stored classes
				get Class() { return !Cache.has('ApplicationClasses') ? Cache.set('ApplicationClasses', {}).get('ApplicationClasses'):Cache.get('ApplicationClasses') }
				//stored mixins
				get Mixins() {return Mixins; }
				//the body of the document
				get body() {return document.body}
				//the document
				get doc() {return document}
				//action to go to a page of the site. pass in data. will trigger window.route event.
				get goto() { return Route.goto }
				//hash change event to get notified of the hash value
				get hashChange() {return Route.hashChange}
				//the head of the document
				get head() {return this.doc.head}
				//helper actions
				get help() {return Helpers;}
				//the launching element or main menu of the site
				get launcher() {return this.body.querySelector('#launcher[app-launcher]')}
				//listeners for the event triggers/actions
				get listeners() { return Cache.has('listeners') ? Cache.get('listeners') : Cache.set('listeners', new Map()).get('listeners'); }
				//app is loaded when the main application of the site has been add via the 'ready' action
				get loaded() {return Cache.get('ready').has('application') && !this.loading; }
				//the loading element
				get loader() {return window.document.querySelector('#loader[app-loader]')}
				//lodash - custom build
				get lodash() {return window._; }
				// fireblunt()
				get firebase() {return window.firebase}
				//the user of the site
				get user() { return window.user || this.currentUser; }
				//requirements for the app - use laters to check fully loaded status
				get requirements() {return Cache.get('ApplicationRequirements')}
				//the current router / hash / url value of the site
				get state() {return Route.state()}
				//the window
				get window(){return window}
				
				constructor() {
					super()
					if (!window.HashChangeEvent) {
						Cache.set('lastURL', document.URL);
						window.addEventListener("hashchange", function (event) {
							Object.defineProperty(event, "oldURL", { enumerable: true,  configurable: true,  value: Cache.get('lastURL') })
							Object.defineProperty(event, "newURL", { enumerable: true,  configurable: true,  value: document.URL })
							Cache.set( 'lastURL', document.URL )
							Route.hashChange(event)
						});
					}
					else window.addEventListener("hashchange", Route.hashChange)
					
					window.addEventListener('blur', function (e) { window.isInvisible = true })
					
					window.addEventListener('focus', function () {
						delete window.isInvisible;
						if (typeof window.updateInvisibility === 'function') window.updateInvisibility();
					})
					
					window.addEventListener('resize', function (e) {
						this.boundry = get_app_size()
						return this.resize({size: this.boundry, event: e})
					}.bind(this))
				}
				
				create(type) {return this.doc.createElement(type);}
				
				define(x, y, z) {return window.customElements ? window.customElements.define(x, y, z) : () => {console.log(arguments)}; }
				
				//hasElement(name){
				//	if('customElements' in window && typeof name === 'string'){
				//		name = name.trim().toLowerCase()
				//		if(!name.length) return false;
				//		if(!name.includes('-')) return false;
				//		return typeof window.customElements.get(name) !== 'undefined'
				//	}
				//	return false;
				//}
				
				//['import'](url, b, c) {return loadScript(url, b, c);}
				
				is(key, v) {return Cache.get(key).has(v)}
				
				mixin(key, value) { return typeof value !== 'function' ? this.Mixins[key]:this.Mixins[key] = value }
				
				params(x) { return QueryParams.create(x); }
				
				promise(a, b, c) {return promise(a, b, c);}
				
				url(url) {return new URL(getSource(url))}
				
			}
			
			class Application extends ApplicationMap {
				
				
				get auth() { return this.has('auth') ? this.get('auth') : ( this.firebase ? this.firebase.auth() : null ) }
				set auth(v) { return this.set('auth', v); }
				
				get boundry() { return this.get('size') }
				set boundry(size) { return this.set('size', size) }
				
				get currentUser() { return this.has('currentUser') ? this.get('currentUser') : ( this.firebase ? this.auth.currentUser : null ) }
				set currentUser(v) { return this.set('currentUser', v); }
				
				get database() { return this.has('database') ? this.get('database'):( this.firebase ? this.firebase.database() : null ) }
				set database(value) {return this.set('database', value)}
				
				get el() { return !this.has('ApplicationElement') ? this.body.querySelector('#app') : this.get('ApplicationElement'); }
				set el(v) { return this.set('ApplicationElement', v); }
				
				get hash() {return Route.hashish()[0]}
				set hash(hash) {return Route.hash(hash)}
				
				get lastRoute() {return Route.lastRoute}
				set lastRoute(e) {return Route.lastRoute = e}
				
				get loading() { return (this.body.hasAttribute('unresolved') || !this.body.hasAttribute('apploaded')); }
				set loading(v) {return this.loader ? this.loader.loading = v : v}
				
				
				get title() {return this.doc.title}
				set title(v) { return (v && typeof v === 'string') ? this.doc.title = v : this.doc.title}
				
				//get object values via a string in dot notation format
				deep(obj, query) { try { return this.lodash.get(obj, query) } catch (e) { return null }  }
				dotted(obj, selector) { try { return selector.split('.').reduce((o, i) => o[i], obj) } catch (e) { return null } }
				
				//event triggers & setters
				fire(key, detail) {
					let evt = new CustomEvent(key, {bubbles: true, detail: detail});
					let ers = this.listeners.get(key);
					var winDispatched = false;
					if (ers instanceof Set) {
						for (var l of ers) {
							if (typeof l === 'function') l(evt);
						}
						window.dispatchEvent(evt);
					} else if (typeof ers === 'object') {
						if (ers.func) ers.func(evt);
						if (ers.window) window.dispatchEvent(evt);
						if (ers.once) this.off(key);
					}
				}
				
				off(key) {
					let on = this.listeners.get(key)
					if (typeof on === 'object' && on.window) window.removeEventListener(key, on.func);
					this.listeners.delete(key);
					return this;
				}
				on(key, cb) {
					if (typeof cb === 'function') {
						if (!this.listeners.has(key)) this.listeners.set(key, new Set());
						this.listeners.get(key).add(cb);
					}
					return this.listeners.get(key);
				}
				once(key, value, w) {
					this.listeners.set(key, {once: true, func: value, window: w});
					return this;
				}
				
				//query element from document
				query(selector, key) {
					if (typeof key === 'string') {
						Selectors.set(key, selector);
					}
					let sel = Selectors.has(selector) ? Selectors.get(selector) : selector;
					return this.doc.querySelector(sel)
				}
				
				
				ready(...x){ return this.broadcaster.ready(...x) }
				resize(detail) {
					console.log(detail)
					return this.fire('resized', detail);
				}
				
				constructor() {
					super()
					this.boundry = get_app_size()
					this.broadcaster = Factory.Broadcaster(this, Cache, Dependents)
					Factory = null
				}
			}
			
			return window.app = new Application()
			
			//------------------shared actions--------------
			function get_app_size(){
				let docEl = document.documentElement
				return {
					height: window.innerHeight,
					width: window.innerWidth,
					body: window.document.body.getBoundingClientRect(),
					scroll: {
						top: window.pageYOffset || docEl.scrollTop || body.scrollTop,
						left: window.pageXOffset || docEl.scrollLeft || body.scrollLeft
					},
					client: {
						top: docEl.clientTop || body.clientTop || 0,
						left: docEl.clientLeft || body.clientLeft || 0
					}
				};
			}
			
		},
		function factories(window) {
			
			return {
				
				CreateSupers( Helpers ){
					
					class SuperString extends String {
						static context(v) {
							let origin = v;
							let type = typeof v;
							var kind;
							switch (type) {
								case 'object':
									let otype = get_object_string_kind(v)
									kind = otype.kind
									v = otype.string
									break;
								case 'function':
									v = v.name || '';
									kind = 'invalid';
									break;
								case 'undefined':
									v = '';
									kind = 'invalid';
									break;
								default:
									v = v + '';
									kind = type;
									break;
							}
							return {kind, type, value: v, origin};
						}
						
						constructor(value) {
							let context = SuperString.context(value)
							super(context.value)
							this.context = context
						}
					}
					
					class QueryParams extends SuperString {
						static create(v) {
							if (typeof v === 'undefined') v = window.location.search;
							return new QueryParams(v);
						}
						
						static parse(v) {
							if (typeof v !== 'string') return v;
							try {
								let qdata = JSON.parse(v);
								if (typeof qdata === 'object') return qdata;
							} catch (e) {}
							return v;
						}
						
						constructor(value) {
							super(value)
						}
						
						get kind() {return this.context.kind}
						
						get data() {
							if (this.kind === 'json') this.QueryData = this.context.origin;
							else if (this.kind !== 'invalid') {
								if (typeof this.QueryData === 'undefined') {
									if (typeof this.kind === 'string') {
										let qdata = QueryParams.parse(this.queryString);
										if (typeof qdata === 'object') this.QueryData = qdata;
										if (typeof this.QueryData === 'undefined') {
											this.QueryData = Helpers.query(this.queryString);
										}
									}
								}
							}
							if (typeof this.QueryData === 'object') {
								for (let key in this.QueryData) {
									if (typeof this.QueryData[key] === 'string') {
										var o = QueryParams.parse(this.QueryData[key]);
										if (typeof o === 'object') {
											this.QueryData[key] = o;
										}
									}
								}
							}
							return this.QueryData;
						}
						
						get queryString() {
							if (typeof this.QueryString === 'undefined') {
								if (this.kind === 'string') {
									this.QueryString = decodeURIComponent(this);
								} else {
									this.QueryString = this;
								}
							}
							return this.QueryString;
						}
						
						get encoded() {
							return encodeURIComponent(this.queryString);
						}
						
						get decoded() {
							return decodeURIComponent(this.encoded);
						}
						
						get uri() {
							var uri = [];
							let data = this.data;
							for (let key in data) {
								var v = data[key];
								if (typeof data[key] === 'object') v = JSON.stringify(data[key]);
								else v = data[key]
								uri.push(key + '=' + v);
							}
							return encodeURI('?' + uri.join('&'));
						}
						
						valueOf() {return this.encoded}
					}
					
					return {
						SuperString,
						QueryParams
					}
					
					//--------shared actions---------
					function get_object_string_type(v){
						var kind, string = ''
						if( v === null ) kind = 'invalid'
						else if(v instanceof HTMLElement){
							string = v.innerHTML
							kind = 'html'
						}
						else{
							try{
								string = JSON.stringify(v)
								kind = 'json'
							}catch(e){
								string = ''
								kind = 'invalid'
							}
						}
						
						return {
							kind,
							string
						}
					}
					
				},
				CreateHelper(){
					
					const numbers = {
						rand(min, max) {
							return Math.random() * (max - min) + min;
						},
						random(min, max) {
							return Math.floor(Math.random() * (max - min + 1)) + min;
						}
					}
					
					const filters = {
						str: {
							length(x){return x.length > 0;}
						}
					}
					
					const maps = {
						str: {
							trim(x){return x.trim()}
						}
					}
					
					const str = {
						array(x, splitter){
							return x.split(splitter)
							        .map(maps.str.trim)
							        .filter(filters.str.length);
						}
					}
					
					const style = (string) => {
						let css = {};
						str.array(string, ';')
						   .map((x) => { return str.array(x, ':') })
						   .map(function (x) {return this[x[0]] = x[1];}, css);
						return css;
					}
					
					const query = (string) => {
						let qs = {};
						if (string.includes('?')) string = string.replace('?', '');
						str.array(string, '&')
						   .map((x) => { return str.array(x, '=') })
						   .map(function (x) {return this[x[0]] = x[1];}, qs);
						return qs;
					}
					
					return new Proxy({
						filters,
						maps,
						str,
						style,
						numbers,
						query
					}, {
						get(o, p){
							if (p in o) return o[p]
							return ( x ) => { return x }
						}
					})
				},
				CreateRoute( QueryString ){
					
					class State {
						constructor(route) {
							this.route = route;
							this.url = new URL(window.location.href);
						}
					}
					
					class Route {
						
						static hash(setHash) { return this.hashish()[0] !== setHash ? window.location.hash = setHash : this.hashish() }
						static hashish(hash) { return get_hash_parts( typeof hash !== 'string' ? window.location.hash : hash ) }
						
						static hashChange(e) { window.dispatchEvent(new CustomEvent( 'route', { bubbles: false,  detail: new Route(e) }) ) }
						
						static state() { return new State( this.lastRoute || new Route(null) ) }
						
						static get State() { return State }
						
						constructor(event) {
							this.event = event || null
							if (event instanceof Event) Route['lastRoute'] = this
						}
						
						get hashes() { return Route.hashish() }
						
						get paths() { return 'hash' in this && typeof this.hash === 'string' ? this.hash.split('/'):[] }
						
						get page() { return this.hashes[0] }
						
					}
					
					Route.query = function (x) { return QueryParams.create(x) }
					
					Route.goto = function (page, data) {
						
						let route = new Route()
						route.data = data
						if (route.page !== page) window.location.hash = page
						else window.dispatchEvent(new CustomEvent('route', { bubbles: false, detail: route }))
						return route
						
					}
					
					return Route
					
					//---------shared actions-----------
					function get_hash_parts(hash){
						return hash.replace('#', '')
						           .split('/')
						           .map( a => a.trim() )
						           .filter( p => { return p.length > 0 } )
					}
					
				},
				Broadcaster(App, Cache, Dependents){
					
					const Watchers = new Map()
					
					class Broadcaster extends Map{
						
						constructor(){
							super()
							window.Define = (callback, requires) => {
								if(typeof requires !== 'undefined'){
									if(!Array.isArray(requires)) requires = [requires]
								}
								return this.create({ callback, requires });
							}
						}
						
						check(block) {
							let count = block.requires.length
							if (count === 0) return { loaded: true }
							let mods = this.require( block.requires ).filter( filter_nothingness )
							if (mods.length < count) return { waiting: true }
							return { loaded: true, mods }
						}
						
						create( block ) {
							
							let status = this.check( block )
							if ( status.loaded ) return this.fire( block , block.mods )
							else block.watcherId = 'watcher-' + Watchers.size
							if ( !this.has('definites') ) this.set( 'definites', new Set() )
							this.get('definites').add( block )
							if ( block.watcherId ) this.set_watcher( block.watcherId )
							return true
							
						}
						
						fire( block , mods ) {
							let has_mods = Array.isArray(mods) ? true:false
							mods = has_mods ? mods : this.require( block.requires )
							mods.unshift( App )
							mods.push( App.window.wwi )
							return block.callback(...mods)
						}
						
						get_watcher(key) {
							if (!this.has('definites')) return undefined
							let defs = this.get('definites')
							for(let def of defs){
								if( def.watcherId === key ) return def
							}
							return undefined
						}
						
						recheck() {
							if ( this.has('definites') && App.complete ) {
								let defs = this.get('definites')
								for (let def of defs) {
									if ( waiting_dependents( def.requires ) ) {
										console.log(def.requires)
									}
									else this.check( def )
								}
								if ( defs.size === 0 ) this.delete('definites')
							}
						}
						
						ready( key, value ) {
							if ( typeof value !== 'undefined' &&
								value !== null &&
								!(key in window) ) {
								window[key] = value
							}
							Cache.get('ready').add(key)
							this.recheck()
							return window[key]
						}
						
						//check to see if stuff in cache & window has been set
						require(obj) {
							let o = []
							if ( Array.isArray(obj) ) {
								obj.forEach( key => {
									if ( this.requirements.includes(key) && !(key in window) ) {
										this.ready( key, App[key] )
									}
									o.push(key)
								})
							}
							else return []
							return o.map( name => {
								if(typeof name !== 'string') return null
								else if ( name.includes('app.')  ) return App.deep( App, name )
								else if ( name in window ) return window[name]
								else if ( name in document ) return document[name]
								else return App.dotted( window, name )
								return null
							})
						}
						
						get requirements(){ return App.requirements }
						
						set_watcher(key) {
							
							let watcher = { key, count: 0 }
							const caster = this
							
							watcher.clear = function () {
								if (typeof this.timer === 'number') {
									window.clearInterval(this.timer);
									delete this.timer;
								}
								return Watchers.delete( this.key )
							}
							
							watcher.func = function () {
								if ( this.count >= 5000 ) {
									console.group('WATCHER TIMEOUT: '+this.key)
									console.error(new Error('watcher timeout for : ' + this.key));
									console.warn(this);
									console.warn( caster.get_watcher(this.key) )
									console.groupEnd()
									return this.clear();
								}
								let block = caster.get_watcher( this.key )
								if (!block) return this.clear()
								let status = caster.check( block )
								if ( status.waiting ) return this.count++;
								this.clear()
								caster.get('definites').delete(block)
								return caster.fire( block , status.mods )
							}
							
							watcher.start = function () {
								this.timer = window.setInterval( this.func.bind(this), 300 )
								return this
							}
							
							return Watchers.set( key, watcher.start() );
						}
						
						
					}
					
					//return the broadcaster into the app object
					return new Broadcaster()
					
					//--------------shared actions--------------
					function filter_nothingness(v){ return v !== null && v !== undefined }
					function filter_cached(name){ return Dependents.includes(name) && Cache.get('ready').has(name) }
					function waiting_dependents(list){
						if (!list) return false
						return list.filter(filter_cached).length > 0
					}
					
				}
				
			}
			
		})
}))