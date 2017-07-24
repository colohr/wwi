(function (root, init) { return  init(root) }
(this, function (window) {
	return (function (root, factory, bootstrap, factories) { return factory(root, bootstrap, factories) })(
		window,
		function appkit(window, bootstrap, factories) { return bootstrap(window, factories) },
		function bootstrap(window, Factories) {
			
			
			
			//application router
			//const Route = Factory.CreateRoute( QueryParams )
			
			class ApplicationMap extends Map {
				//cache of stuff
				//get Cache() { return Cache }
				//stored classes
				//get Class() { return !Cache.has('ApplicationClasses') ? Cache.set('ApplicationClasses', {}).get('ApplicationClasses'):Cache.get('ApplicationClasses') }
				//the body of the document
				get body() {return window.document.body}
				//the document
				get doc() {return window.document}
				//action to go to a page of the site. pass in data. will trigger window.route event.
				get goto() { return this.Route.goto }
				//current window location hash
				get hash() {return this.Route.hashish()[0]}
				set hash(hash) {return this.Route.hash(hash)}
				//hash change event to get notified of the hash value
				get hash_changed() {return this.Route.hash_changed}
				//the head of the document
				get head() {return this.doc.head}
				//the launching element or main menu of the site
				get launcher() {return this.body.querySelector('[app-launcher]')}
				//listeners for the event triggers/actions
				get listeners() { return this.has('listeners') ? this.get('listeners') : this.set('listeners', new Map()).get('listeners'); }
				//app is loaded when the main application of the site has been add via the 'ready' action
				get loader() {return window.document.querySelector('[app-loader]')}
				//the user of the site
				get user() { return window.user || this.currentUser; }
				//the current router / hash / url value of the site
				get state() {return this.Route.state()}
				//title of the document
				get title() {return this.doc.title}
				set title(v) { return v && typeof v === 'string' ? this.doc.title = v : this.doc.title}
				//the window
				get window(){return window}
				
				
				get last_route() {return this.Route.last_route}
				set last_route(e) {return this.Route.last_route = e}
				
				constructor() {
					super()
					var Factory = Factories(window)
					this.help = Factory.CreateHelper()
					this.QueryParams =  Factory.CreateSupers( this.help ).QueryParams
					this.Route = Factory.CreateRoute( this.QueryParams )
					if (!window.HashChangeEvent) {
						this.set('last_url', document.URL);
						window.addEventListener("hashchange", function (event) {
							Object.defineProperty(event, "oldURL", { enumerable: true,  configurable: true,  value: this.get('last_url') })
							Object.defineProperty(event, "newURL", { enumerable: true,  configurable: true,  value: document.URL })
							this.set( 'last_url', document.URL )
							this.Route.hash_changed(event)
						}.bind(this));
					}
					else window.addEventListener("hashchange", this.Route.hash_changed)
					
					//window.addEventListener('blur', function (e) { window.is_invisible = true })
					//
					//window.addEventListener('focus', function () {
					//	delete window.is_invisible;
					//	window.dispatchEvent(new CustomEvent('view is visible',{bubbles:true,composed:true}));
					//})
					
					window.addEventListener('resize', function (e) {
						this.boundry = get_app_size()
						return this.resize({size: this.boundry, event: e})
					}.bind(this))
					
					
					//const Helpers = Factory.CreateHelper()
					
					//helper classes
					//const Supers = Factory.CreateSupers( Helpers )
					//const QueryParams = Supers.QueryParams
					Factory = null
					
					
					
				}
				
				create(type) {return this.doc.createElement(type);}
				
				params(x) { return this.QueryParams.create(x); }
				
				select(selector) { return this.doc.querySelector(selector) }
				
				//is(key, v) {return this.get(key).has(v)}
				
				//mixin(key, value) { return typeof value !== 'function' ? this.Mixins[key]:this.Mixins[key] = value }
				
				
			}
			
			class Application extends ApplicationMap {
				
				get auth() { return this.has('auth') ? this.get('auth') : ( 'firebase' in window ? window.firebase.auth() : null ) }
				set auth(v) { return this.set('auth', v); }
				
				get boundry() { return this.get('size') }
				set boundry(size) { return this.set('size', size) }
				
				get current_user() { return this.has('current_user') ? this.get('current_user') : ( this.firebase ? this.auth.currentUser : null ) }
				set current_user(v) { return this.set('current_user', v); }
				
				get el() { return this.element }
				set el(v) { return this.element = v }
				
				get element(){ return !this.has('ApplicationElement') ? this.body.querySelector('#app') : this.get('ApplicationElement') }
				set element(element){ return this.set('ApplicationElement', element) }
				
				get loaded() { return this.body.hasAttribute('apploaded') }
				
				//event triggers & setters
				fire(key, detail) {
					let event = new CustomEvent(key, {bubbles: true, detail: detail});
					let listeners = this.listeners.get(key);
					if (listeners instanceof Set) {
						for (let action of listeners) {
							if (typeof action === 'function') action(event)
						}
						window.dispatchEvent(event)
					} else if (typeof listeners === 'object') {
						if (listeners.func) listeners.func(event)
						if (listeners.window) window.dispatchEvent(event)
						if (listeners.once) this.off(key)
					}
					return this
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
				get opened(){ return get_opened_page(this.element) }
				
				resize(detail) { return this.fire('resized', detail) }
				
				constructor() {
					super()
					this.boundry = get_app_size()
				}
			}
			//query element from document
			//ready(...x){ return this.broadcaster.ready(...x) }
			//get router(){ return this.el && 'router' in this.el ? this.el.router:null }
			
			//exports
			window.application = new Application()
			
			return window.app = new Proxy(window.application,{
				deleteProperty(o,name){
					if(name in o) delete o[name]
					else if(o.has(name)) delete o.delete(name)
					else if(o.el && name in o.el) delete o.el[name]
					return true
				},
				get(o,name){
					let value = null
					if(name in o) {
						value = o[name]
						if(typeof value === "function") value.bind(o)
					}
					else if(o.has(name)) value = o.get(name)
					else{
						let element = o.element
						if(element && name in element) {
							value = element[name]
							if(typeof value === "function") value.bind(element)
						}
					}
					return value
				},
				
				has(o,name){
					if(name in o) return true
					else if(o.has(name)) return true
					let element = o.element
					return element && name in element
				},
				ownKeys(o) {
					return Object.keys(o)
				},
				set(o,name,value){
					o[name] = value
					return true
				}
			})
			
			//------------------shared actions--------------
			function get_app_size(){
				let element = document.documentElement
				return {
					height: window.innerHeight,
					width: window.innerWidth,
					body: window.document.body.getBoundingClientRect(),
					scroll: {
						top: window.pageYOffset || element.scrollTop || window.document.body.scrollTop,
						left: window.pageXOffset || element.scrollLeft || window.document.body.scrollLeft
					},
					client: {
						top: element.clientTop || window.document.body.clientTop || 0,
						left: element.clientLeft || window.document.body.clientLeft || 0
					}
				}
			}
			function get_opened_page(element){
				return element !== null && 'router' in element && 'opened' in element.router ? element.router.opened:element
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
						
						static hash_changed(e) { window.dispatchEvent(new CustomEvent( 'route', { bubbles: false,  detail: new Route(e) }) ) }
						
						static state() { return new State( this.last_route || new Route(null) ) }
						
						static get State() { return State }
						
						constructor(event) {
							this.event = event || null
							if (event instanceof Event) Route['last_route'] = this
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
					
				}
				
			}
			
		})
}))