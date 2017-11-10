window.fxy.exports('dom',(dom,fxy)=>{
	
	class Module{
		constructor(element, {extension, name, type}) {
			this.name = name
			this.type = type || 'page'
			this.extension = extension || 'html'
			if(fxy.is.element(element)){
				this.element = element
				let loads = this.element.hasAttribute('load') ? this.element.getAttribute('load'):null
				this.loads = loads ? get_list(loads).map(source=>source.includes('http')?source:window.url(source)):[]
				let wait = this.element.hasAttribute('wait') ? this.element.getAttribute('wait'):null
				this.waits = wait ? get_list(wait):[]
			}
			else this.not_found = true
		}
		get active() { return this.element.hasAttribute('active') }
		set active(active) { return active !== true ? this.element.removeAttribute('active'):this.element.setAttribute('active','') }
		close(container,...x) { return will_page(this,'close',container,...x) }
		get data() { return get_data(this) }
		open(container,...x) { return will_page(this,'open',container,...x) }
		get title(){ return this.element.hasAttribute('page-title') ? this.element.getAttribute('page-title'):fxy.id.proper(module.name) }
		preload(router){ return load_module(router,this.name,true) }
	}
	
	class Router extends Map {
		constructor(element,{type, folder}) {
			super()
			this.element = element
			this.folder = folder
			this.type = type
			window.addEventListener('route', this.on_route.bind(this))
		}
		close(module,opening) {
			this.last = module.close(this.element,opening)
			return this
		}
		error(module) { return 'on_module_error' in this.element ? this.element.on_module_error(module) : module }
		get_module(name) {
			if (this.has(name)) return this.get(name)
			return this.set(name,new Module(this.element.pages[name],{name,type:this.type})).get(name)
		}
		get_name(data){ return get_name(data,this.type) }
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
		load(name) { return load_module(this,name) }
		load_module(module){
			if (module instanceof Module) {
				if (module.loaded instanceof Error) this.error(module.loaded)
				else this.open(module)
			}
		}
		get loading(){ return this.element.loading }
		set loading(value){ this.element.loading = value }
		on_error(e,reason){
			console.groupCollapsed('Router Error')
			console.log('Reason -> ',reason || 'Loading module.')
			console.error(e)
			console.groupEnd()
		}
		on_route(e) { return on_route(this,e) }
		open(module) {
			this.loading = null
			let opened = this.opened
			if(opened && opened !== module) this.close(this.opened,module)
			this.element.page = module.name
			this.opened = module.open(this.element,opened)
			this.element.site.title = module.title
			return this
		}
	}
	
	//exports
	dom.Router = Router
	
	//shared actions
	function get_data(module){
		return new Proxy(module, {
			get(o, name){
				if (name in o) return o[name]
				switch (name) {
					case 'tag': return `${o.name}-${o.type}`
					case 'file': return `${o.name}.${ o.extension }`
				}
				return null
			}
		})
	}
	
	function get_list(value){ return value.replace(/ /g,',').split(',').map(part=>part.trim()).filter(part=>part.length > 0) }
	
	function get_name(data,type){
		if(fxy.is.text(data)) return data
		if(fxy.is.data(data) && 'detail' in data) data = data.detail
		if(fxy.is.data(data) && type in data) return data[type]
		return null
	}
	
	function load_module(element,name,preloading){
		if(!fxy.is.text(name)) element.loading = false
		let module = element.get_module(name)
		//return value
		return new Promise((success, error) => {
			if(module.not_found) return error(module,'Page not found')
			if ('loaded' in module) return module.loaded === true ? success(module) : error(module)
			return get_element().then(_=>success(module)).catch(_=>error(module))
		})
		//shared actions
		function get_element(){
			if(preloading !== true) element.loading = true
			let page_url = fxy.file.url(element.folder, module.data.file || '')
			return fxy.port(page_url).then(on_port).then(e=>module.loaded=true).catch(e=>module.loaded=e)
		}
		function get_loads(ports){ return fxy.all(ports).then(_=>fxy.when(...module.waits)).then(_=>fxy.when(module.element.localName)) }
		function on_port(e){ return e === fxy.port.loading ? e:get_loads(module.loads.map(source=>fxy.port(source,{async:'',defer:''}))) }
	}
	
	function on_route(element,e){
		return element.load(element.get_name(e))
		              .then(module=>element.load_module(module))
		              .catch(error=>element.on_error(error))
	}
	
	function set_active(module,active,preloaded){
		let element = module.element
		let set = element.setAttribute.bind(element)
		let remove = element.removeAttribute.bind(element)
		switch(active){
			case true:
				set('aria-hidden','false')
				set('aria-expanded','true')
				remove('tabindex')
				if(preloaded !== true) element.dispatch('active')
				break
			default:
				set('aria-hidden','true')
				set('aria-expanded','false')
				set('tabindex','-1')
				if(preloaded !== true) element.dispatch('inactive')
				break
		}
		window.requestAnimationFrame(_=>{
			module.element.style.display = active ? '':'none'
			module.active = active
		})
		return element
	}
	
	function will_page(page,type,container,last,preloaded){
		let promised = false
		let action = `will_${type}_page`
		let activate = type === 'open'
		if(action in container) {
			let notifier = container[action](page,last)
			promised=fxy.is.instance(notifier,Promise)
			if(promised) notifier.then(_=>set_active(page,activate,preloaded)).catch(console.error)
		}
		if(!promised) set_active(page,activate,preloaded)
		return page
	}
	
	
})

