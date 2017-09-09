(function(root, init){return init(root)}(this, function(window){return (function (root, factory, bootstrap, factories){return factory(root, bootstrap, factories)})(window,
	function appkit(window, bootstrap, factories){return bootstrap(window, factories)},
	function bootstrap(window, Factories) {
		class Application extends Map {
			constructor() {
				super()
				var Factory = Factories(window)
				this.help = Factory.CreateHelper()
				this.Route = Factory.CreateRoute(this.help)
				if (!window.HashChangeEvent) {
					this.set('last_url', document.URL);
					window.addEventListener("hashchange", function (event) {
						Object.defineProperty(event, "oldURL", { enumerable: true,  configurable: true,  value: this.get('last_url') })
						Object.defineProperty(event, "newURL", { enumerable: true,  configurable: true,  value: document.URL })
						this.set( 'last_url', document.URL )
						this.Route.hash_changed(event)
					}.bind(this))
				}
				else window.addEventListener("hashchange", this.Route.hash_changed)
				window.addEventListener('resize', function (e) {
					this.boundry = get_app_size()
					return this.resize({size: this.boundry, event: e})
				}.bind(this))
				this.boundry = get_app_size()
				Factory = null
			}
			get body(){return window.document.body}
			get boundry(){return this.get('size')}
			set boundry(size){return this.set('size', size)}
			get doc(){return window.document}
			get element(){ return window.document.body.querySelector('#app') }
			get goto(){return this.Route.goto}
			get hash(){return this.Route.hashes()[0]}
			set hash(hash){return this.Route.hash(hash)}
			get hash_changed(){return this.Route.hash_changed}
			get kit(){return 'kit' in window ? window.kit:null}
			get listeners(){return this.has('listeners') ? this.get('listeners'):this.set('listeners',new Map()).get('listeners')}
			get opened(){return get_opened_page(this.element)}
			params(x){return this.Route.Params.create(x)}
			get title(){return this.doc.title}
			set title(title){return this.doc.title=title}
			//get port(){return window.fxy.port}
			//get source(){return window.fxy.file}
			fire(name, detail) {
				let event = new CustomEvent(name, {bubbles: true, detail: detail})
				let listeners = this.listeners.get(name)
				if (listeners instanceof Set) {
					for (let action of listeners) if(typeof action === 'function') action(event)
					window.dispatchEvent(event)
				}
				else if (typeof listeners === 'object') {
					if (listeners.func) listeners.func(event)
					if (listeners.window) window.dispatchEvent(event)
					if (listeners.once) this.off(name)
				}
				return this
			}
			off(name){
				let on = this.listeners.get(name)
				if (typeof on === 'object' && on.window) window.removeEventListener(name, on.func)
				this.listeners.delete(name)
				return this
			}
			on(name,action){
				if (typeof action === 'function') {
					if (!this.listeners.has(name)) this.listeners.set(name, new Set())
					this.listeners.get(name).add(action)
				}
				return this.listeners.get(name)
			}
			once(name, action, target_window) {
				this.listeners.set(name,{once:true,func:action,window:target_window})
				return this
			}
			resize(detail){return this.fire('resized', detail)}
		}
		
		//exports
		window.application = new Application()
		return window.app = new Proxy(window.application,{
			deleteProperty(o,name){
				if(name in o) delete o[name]
				else if(o.has(name)) o.delete(name)
				return true
			},
			get(o,name){
				let value = null
				if(o.has(name)) return o.get(name)
				else if(name in o) {
					value = o[name]
					if(typeof value === "function") value = value.bind(o)
				}
				if(value === null) {
					let element = o.element
					if(element && name in element){
						value = element[name]
						if(typeof value === 'function') value = value.bind(element)
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
			set(o,name,value){
				o.set(name,value)
				return true
			}
		})
		
		//shared actions
		function get_app_size(){
			let element = document.documentElement
			return {
				height: window.innerHeight,
				width: window.innerWidth,
				body: window.document.body.getBoundingClientRect(),
				scroll: {top: window.pageYOffset || element.scrollTop || window.document.body.scrollTop, left: window.pageXOffset || element.scrollLeft || window.document.body.scrollLeft},
				client: {top: element.clientTop || window.document.body.clientTop || 0, left: element.clientLeft || window.document.body.clientLeft || 0}
			}
		}
		function get_opened_page(element){return element !== null && 'router' in element && 'opened' in element.router ? element.router.opened:element}
	},
	function factories(window){
		return {
				CreateHelper(){
					const numbers = {
						rand(min, max){return Math.random() * (max - min) + min},
						random(min, max){return Math.floor(Math.random() * (max - min + 1)) + min}
					}
					const filters = {str:{length(x){return x.length > 0}}}
					const maps = {str:{trim(x){return x.trim()}}}
					const str = {array(x, splitter){ return x.split(splitter).map(maps.str.trim).filter(filters.str.length)}}
					//exports
					return new Proxy({filters,maps,str,style,numbers,query},{
						get(o, p){
							if(p in o) return o[p]
							return x=>x
						}
					})
					//shared actions
					function query(text){
						let qs = {}
						if(text.includes('?')) text = text.replace('?', '')
						str.array(text,'&').map(x=>text.array(x, '=')).map(function(x){return this[x[0]]=x[1]},qs)
						return qs
					}
					function style(text){
						let css = {}
						str.array(text,';').map(x=>str.array(x, ':')).map(function(x){return this[x[0]]=x[1]},css)
						return css
					}
				},
				CreateRoute(Helpers){
					class Params{
						constructor(value){
							if (typeof value === 'undefined') value = window.location.search
							Object.assign(this,get_text(value))
						}
						get data() { return get_query_data(this) }
						get decoded(){return decodeURIComponent(this.encoded)}
						get encoded(){return encodeURIComponent(this.text)}
						get text(){
							if (this.kind === 'string') return decodeURIComponent(this.origin)
							return this.value
						}
						get uri(){return get_uri(this)}
						//prototype actions
						toString(){return this.encoded}
					}
					class State {constructor(route){this.route = route;this.url = new URL(window.location.href);}}
					class Route {
						static get hash(){return get_route_hash}
						static get hash_changed(){return hash_changed}
						static get hashes(){return get_route_hashes}
						static query(x){return new Params(x)}
						static get goto(){return goto}
						static state(){return new State( this.last_route || new Route(null) )}
						static get Params(){ return Params }
						static get State() { return State }
						constructor(event) {
							this.event = event || null
							if (event instanceof Event) Route['last_route'] = this
						}
						get hashes() { return this.constructor.hashes() }
						get paths() { return 'hash' in this && typeof this.hash === 'string' ? this.hash.split('/'):[] }
						get page() { return this.hashes[0] }
					}
					
					//return value
					return Route
					
					//shared actions
					function get_hash_parts(hash){return hash.replace('#', '').split('/').map(a=>a.trim()).filter(p=>p.length > 0)}
					function get_query_data(params){
						let data = null
						if (params.kind === 'json') data = params.origin
						else if (params.kind !== 'invalid') {
							if (params.kind === 'string') {
								try{ data = JSON.parse(params.origin) }catch(e){}
								if(data === null) data = Helpers.query(params.origin)
							}
						}
						if(data === null) data = {}
						let query = {}
						for(let key in data){
							let value = data[key]
							if (typeof value === 'string'){
								try{value = JSON.parse(value)}catch(e){}
								query[key] = value
							}
							else query[key] = value
						}
						return query
					}
					function get_route_hash(hash){return Route.hashes()[0] !== hash ? window.location.hash=hash:Route.hashes()}
					function get_route_hashes(hash){return get_hash_parts(typeof hash!=='string'?window.location.hash:hash)}
					function get_text(value){
						let origin = value
						let type = typeof value
						let kind
						switch (type) {
							case 'object':
								let object = get_object_type(value)
								kind = object.kind
								value = object.text
								break
							case 'function':
								value = value.name || ''
								kind = 'invalid'
								break
							case 'undefined':
								value = ''
								kind = 'invalid'
								break
							default:
								value = value + ''
								kind = type
								break
						}
						return {kind, type, value, origin}
						//shared actions
						function get_object_type(object){
							let output = {}
							if(object === null) output.kind = 'invalid'
							else if(object instanceof HTMLElement) {
								output.text = object.outerHTML
								output.kind = 'html'
							}
							else{
								try{
									output.text = JSON.stringify(v)
									output.kind = 'json'
								}
								catch(e){
									output.text = ''
									output.kind = 'invalid'
								}
							}
							return output
						}
					}
					function get_uri(query){
						let uri = []
						let data = query.data
						for (let key in data) {
							let value = data[key]
							if (typeof data[key] === 'object') value = JSON.stringify(data[key])
							else value = data[key]
							uri.push(key + '=' + value)
						}
						return encodeURI('?' + uri.join('&'))
					}
					function goto(page,data){
						let route = new Route()
						route.data = data
						if (route.page !== page) window.location.hash = page
						else window.dispatchEvent(new CustomEvent('route', { bubbles: false, detail: route }))
						return route
					}
					function hash_changed(event){
						let detail = new Route(event)
						window.dispatchEvent(new CustomEvent('route',{bubbles: false,detail}))
					}
					
				}
			}})
}))

//the document

//action to go to a page of the site. pass in data. will trigger window.route event.

//current window location hash

//hash change event to get notified of the hash value

//the head of the document
//get head(){return this.doc.head}

//listeners for the event triggers/actions

//get port(){return window.fxy.port}
//the current router / hash / url value of the site
//get state(){return this.Route.state()}
//get source(){return window.fxy.file}
//title of the document

//the window
//get window(){return window}

//create(type){return this.doc.createElement(type)}

//select(selector){return this.doc.querySelector(selector)}

//get auth(){return this.has('auth') ? this.get('auth') : ( 'firebase' in window ? window.firebase.auth() : null ) }
//set auth(v){return this.set('auth', v)}
//get current_user(){return this.has('current_user') ? this.get('current_user'):(this.firebase ? this.auth.currentUser:null)}
//set current_user(v){return this.set('current_user', v)}
//get el(){return this.element}
//set el(v){return this.element=v}

//set element(element){return this.set('ApplicationElement', element)}
//get loaded() { return this.body.hasAttribute('apploaded') }
//event triggers & setters