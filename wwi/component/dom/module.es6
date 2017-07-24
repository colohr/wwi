wwi.exports('dom',(dom,fxy)=>{
	
	class Module {
		static get application() { return 'app' in window && window.app.el instanceof HTMLElement ? window.app.el : document.querySelector('#app') }
		static data(module, data) {
			if (data instanceof Map) this.memory.set(module, data)
			return this.memory.get(module)
		}
		static element(module) {
			let application = this.application
			let element = 'pages' in application ? application.pages[module.name]:null
			if (!element && application && 'get_module_element' in application) return application.get_module_element(module)
			return element ? element:document.querySelector(`${module.data.tag}`)
		}
		static get memory() {
			if (!this[Symbol.for('Io Module Memory')]) this[Symbol.for('Io Module Memory')] = new WeakMap()
			return this[Symbol.for('Io Module Memory')]
		}
		constructor(name, type, extension) {
			const data = new Map([['name', name], ['type', type || 'io'], ['extension', extension || 'html']])
			this.constructor.data(this, data)
		}
		get active() {return this[Symbol.for('active')]}
		set active(x) {
			let el = this.element
			let active =  x !== true ? false : true
			if ( el instanceof HTMLElement ) el.active = active
			if(el.hasAttribute('active') && !active) el.removeAttribute('active')
			else if(!el.hasAttribute('active') && active) el.setAttribute('active','')
			this[Symbol.for('active')] = active
			return this[Symbol.for('active')]
		}
		blur() {
			if (this.element) this.element.blur()
			return this
		}
		close() {
			this.active = false
			this.element.setAttribute('tabindex','-1')
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
		get name() { return this.data.name }
		open() {
			this.style.display = ''
			this.element.setAttribute('tabindex','0')
			this.active = true
			return this
		}
		get style(){ return this.element.style }
	}
	
	class Router extends Map {
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
			let el = this.has('element') ? this.get('element') : window.app.el
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
			let module = new Module(named, this.type)
			return this.set(named, module).get(named)
		}
		get_name(data){ return get_name(data,this.type) }
		
		get_url(path) { return window.app.source.url(this.folder, path || '') }
		
		goto(hash){
			if(!fxy.is.text(hash)) hash = window.location.hash
			if(fxy.is.text(hash)) hash = hash.trim().replace('#','')
			if(!hash) {
				let first = this.element.pages[0]
				if(first) hash = first.getAttribute('name')
			}
			if(hash && hash.length) return this.on_route(hash)
			return new Promise((success,error)=>{ return error(new Error(`invalid hash to open Router Module`))})
		}
		
		load(name) {
			return new Promise((success, error) => {
				if(!fxy.is.text(name)) {
					this.loading = false
					return error(new Error(`invalid name for Router Module`))
				}
				let module = this.get_module(name)
				if ('loaded' in module) return module.loaded === true ? success(module) : error(module)
				let page_url = this.get_url(module.data.file)
				this.loading = true
				return window.app.port(page_url).then(e=>{
					if(e === window.app.port.loading) return success(e)
					return ensure(module).then(()=>{
						module.loaded = true
						return success(module)
					}).catch(error)
				}).catch(e=>{
					console.error(e)
					module.loaded = e
					return error(module)
				})
			})
		}
		get loading(){ return this.element.loading }
		set loading(value){ this.element.loading = value }
		load_module(module){
			if (module instanceof Module) {
				if (module.loaded instanceof Error) this.error(module.loaded)
				else this.open(module)
			}
		}
		on_error(e){
			console.groupCollapsed('ModuleRouter Error')
			console.error(`route type: "${this.type}" is not in route event detail`)
			console.error(e)
			console.dir(this)
			console.groupEnd()
		}
		on_route(e) {
			return this.load(this.get_name(e)).then(module => this.load_module(module)).catch(error=>this.on_error(error))
		}
		open(module) {
			if(this.opened && this.opened !== module) this.close(this.opened)
			this.opened = module.open()
			this.element.dispatch('module opened',this.opened)
		}
	}
	
	dom.Router = Router
	
	//shared actions
	function ensure(module){ return get_load(module).then(()=>get_wait(module)) }
	
	function get_list(value){ return value.replace(/ /g,',').split(',').map(part=>part.trim()).filter(part=>part.length > 0) }
	
	function get_load(module){ return fxy.all(get_loads(module.element)) }
	
	function get_loads(element){
		if('getAttribute' in element){
			let load = element.getAttribute('load')
			if(fxy.is.text(load)) {
				return get_list(load).map(source=>{
					if(source.includes('http')) return source
					return window.url(source)
				}).map(source=>window.app.port(source))
			}
		}
		return []
	}
	
	function get_name(data,type){
		if(fxy.is.text(data)) return data
		if(fxy.is.data(data) && 'detail' in data) data = data.detail
		if(fxy.is.data(data) && type in data) return data[type]
		return null
	}
	
	function get_wait(module){ return window.wwi.when(...get_waits(module.element)) }
	
	function get_waits(element){
		if('getAttribute' in element){
			let wait = element.getAttribute('wait')
			if(fxy.is.text(wait)) return get_list(wait)
		}
		return []
	}
	
	
	
})

