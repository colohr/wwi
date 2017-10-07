(function(root, init){return init(root)}(this, function(window){return (function (root, factory, bootstrap, factories){return factory(root, bootstrap, factories)})(window,
	function appkit(window, bootstrap, factories){return bootstrap(window, factories)},
	function bootstrap(window, Factories) {
		class Application extends Map {
			constructor() {
				super()
				var Factory = Factories(window)
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
			get help(){
				return {
					get numbers(){
						return {
							get rand(){ return window.fxy.random.decimal },
							get random(){ return window.fxy.random }
						}
					}
				}
			}
			get kit(){return 'kit' in window ? window.kit:null}
			get listeners(){return this.has('listeners') ? this.get('listeners'):this.set('listeners',new Map()).get('listeners')}
			get opened(){return get_opened_page(this.element)}
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
				if(name in o) o[name] = value
				else o.set(name,value)
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
				CreateRoute(){
					class State {constructor(route){this.route = route;this.url = new URL(window.location.href);}}
					class Route {
						static get hash(){return get_route_hash}
						static get hash_changed(){return hash_changed}
						static get hashes(){return get_route_hashes}
						static get goto(){return goto}
						static state(){return new State( this.last_route || new Route(null) )}
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
					
					function get_route_hash(hash){return Route.hashes()[0] !== hash ? window.location.hash=hash:Route.hashes()}
					function get_route_hashes(hash){return get_hash_parts(typeof hash!=='string'?window.location.hash:hash)}
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