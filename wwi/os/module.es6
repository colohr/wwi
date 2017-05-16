Define((app,IO)=>{
	
	const module_router = Symbol('IO Module Router of the site')
	
	class IoModule {
		static get app() { return document.querySelector('#app') }
		static get pages() {return this.app.pages}
		static get views() {
			var pages = this.pages
			if (pages) return pages.items
			return []
		}
		
		
		//-------------
		static get application() {
			return 'app' in window &&
			window.app.el instanceof HTMLElement ?
				window.app.el : null
		}
		static data(module, data) {
			if (data instanceof Map) this.memory.set(module, data)
			return this.memory.get(module)
		}
		static element(module) {
			let application = this.application
			if (application && 'get_module_element' in application) return application.get_module_element(module)
			return document.querySelector(`${module.data.tag}`)
		}
		static get memory() {
			if (!this[Symbol.for('Io Module Memory')]) this[Symbol.for('Io Module Memory')] = new WeakMap()
			return this[Symbol.for('Io Module Memory')]
		}
		constructor(name, type, extension) {
			const data = new Map([
				['name', name],
				['type', type || 'io'],
				['extension', extension || 'html']
			])
			this.constructor.data(this, data)
		}
		get active() {return this[Symbol.for('active')]}
		set active(x) {
			let el = this.element
			let active =  x !== true ? false : true
			if ( el instanceof HTMLElement ) el.active = active
			this[Symbol.for('active')] = active
			return this[Symbol.for('active')]
		}
		blur() {
			if (this.element) this.element.blur()
			return this
		}
		close() {
			this.opened = true
			this.active = false
			return this
		}
		get data() {
			const data = this.constructor.data(this)
			return new Proxy({}, {
				get(o, name){
					if (data.has(name)) return data.get(name)
					let x = data.has(name) ? data.get(name) : null
					switch (name) {
						case 'tag':
							return x ? x : `${data.get('name')}-${data.get('type')}`
							break
						case 'file':
							return x ? x : `${ data.get('name') }.${ data.get('extension') }`
							break
					}
					return null
				},
				has(o, name){
					return data.has(name)
				},
				set(o, name, value){
					console.log('set', {name, value})
					return true
				}
			})
		}
		get element() { return this.constructor.element(this) }
		focus() {
			if (this.element) this.element.focus()
			return this
		}
		hide() {
			if (this.element) this.element.classList.toggle('show', false)
			return this
		}
		get name() { return this.data.name }
		open() {
			this.opened = true
			return this
		}
		show() {
			if (this.element) this.element.classList.toggle('show', true)
			return this
		}
	}
	
	class IoModuleRouter extends Map {
		
		constructor({element, type, folder}) {
			super()
			this.element = element
			this.folder = folder
			this.type = type
			window.addEventListener('route', this.on_route.bind(this))
		}
		
		close(module) {
			this.last = module.close()
			return this
		}
		
		get element() {
			let el = this.has('element') ? this.get('element') : app.el
			if (el instanceof HTMLElement) return el
			return null
		}
		
		set element(element) {
			if (element instanceof HTMLElement) this.set('element', element)
			return this.get('element')
		}
		
		error(module) { return 'on_module_error' in this.element ? this.element.on_module_error(module) : module }
		
		get_module(named) {
			if (this.has(named)) return this.get(named)
			let module = new IoModule(named, this.type)
			return this.set(named, module).get(named)
		}
		
		get_url(path) { return app.source.url(this.folder, path || '') }
		
		load(name) {
			this.loading = true
			return new Promise((success, error) => {
				let module = this.get_module(name)
				if ('loaded' in module) return module.loaded === true ? success(module) : error(module)
				let url = this.get_url(module.data.file)
				return app.port(url).then(e=>{
					if(e === app.port.loading) return success(e)
					module.loaded = true
					return success(module)
				}).catch(e => {
					console.error(e)
					module.loaded = e
					return error(module)
				})
			})
		}
		
		on_route(e) {
			let route = e.detail
			if (this.type in route) {
				let name = route[this.type]
				if (typeof name !== 'string') return
				this.load(name).then(module => {
				    if (module instanceof IoModule) {
					    if (module.loaded instanceof Error) this.error(module)
					    else this.open(module)
				    }
			    })
			}
			else {
				console.groupCollapsed('ModuleRouter Error')
				console.error(`route type: "${this.type}" is not in route event detail`)
				console.dir({event: e, router: this})
				console.groupEnd()
			}
		}
		
		open(module) {
			if (this.opened && this.opened !== module) this.close(this.opened)
			this.opened = module.open() //console.log({open: module, from: this, el: this.element})
			return 'on_module_open' in this.element ? this.element.on_module_open(this.opened) : this.opened
		}
		
	}
	
	
	const IoModuleRoutes = Base => class extends Base{
	
	
	
	}
	
	
	IO.Module = IoModule
	
	IO.Router = Base => class extends Base{
		get router(){
			if(module_router in this) return this[module_router]
			return this[module_router] = new IoModuleRouter(this.module_routes || {type: 'page', folder: 'pages'})
		}
	}
	
	
	wwi.exports('element',(element)=>{
		
		element.routes = IoModuleRoutes
		
	})
	
},'IO')

