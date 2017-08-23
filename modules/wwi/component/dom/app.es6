window.fxy.exports('dom',(dom)=>{
	
	
	class Site{
		constructor(element){
			window.app.site = this
			this.element = element
			let drawer_button = this.drawer_button
			this.element.setAttribute('role','application')
			if(drawer_button){
				drawer_button.setAttribute('opens','')
				drawer_button.define('routes',{
					opened(opened){
						if(opened === null) window.app.site.drawer.opened = false
						else window.app.site.drawer.opened = true
					}
				})
				this.element.onfocus = e => drawer_button.focus()
				window.document.body.onfocus = e => drawer_button.focus()
				window.onfocus = e => drawer_button.focus()
			}
			let drawer = this.drawer
			if(drawer && drawer_button){
				this.drawer.on('transition',e=>{
					let detail = e.detail
					if(detail.closed && this.drawer_button.opened) this.drawer_button.opened=false
					else if(detail.opened && !this.drawer_button.opened) this.drawer_button.opened=true
				})
			}
		}
		get bar(){ return this.query('[app-bar]') }
		get drawer(){ return this.element.query('[app-drawer]') }
		get drawer_button(){ return this.bar ? this.bar.drawer_button:null }
		query(name){ return this.element.query(`${name}`) }
	}
	
	get_wwi_content().then(_=>{
	
	})
	
	dom.app = Base => class extends Base{
		constructor(){
			super('routes',{
				loading(value){
					this.query('[app-pages]').loading = value === null ? false:true
				}
			})
		}
		
		connected(){
			this.setAttribute('id','app')
			this.on('module opened',e=>set_active_module(this,e.detail))
				fxy.when('content-library').then(()=>set_app_elements(this))
				.then(()=>this.show())
				.catch(console.error)
		}
		
		get drawer(){ return this.site.drawer }
		get module_routes(){ return {type:'page',folder:window.app.kit.path+'/pages'}}
		get menu(){ return this.query('content-menu') }
		get pages() { return get_pages(this) }
		show(){ /*app is showing*/ }
	}
	
	function set_active_module(element,module){
		element.page = module.name
		wwi.when(module.element.localName).then(()=>{
			module.element.dispatch('active')
			element.router.loading = null
			if(!element.pages.animates && 'transitioned' in module.element) {
				window.requestAnimationFrame(()=>{
					window.setTimeout(()=>module.element.transitioned(null),200)
				})
			}
			if('will_show_page' in element) element.will_show_page(element.page)
		})
	}
	
	function set_app_elements(e){
		return new Promise((success,error)=>{
			e.site = new Site(e)
			if(e.menu) e.menu.item_selector_options = {item:'content-button',role:'option'}
			if(e.drawer) e.drawer.app = true
			e.router = new dom.Router(e.module_routes)
			return window.requestAnimationFrame(()=>{
				let pages = e.query('[app-pages]')
				if(!pages) return success()
				pages.connect_menu(e).router.goto().then(x=>e.drawer.set_tabindex(false)).then(success).catch(error)
			})
		})
	}
	
	function get_pages(e){
		let pages = e.query('[app-pages]')
		return new Proxy(pages,{
			get(o,name){
				let value = null
				if(name in o) {
					value = o[name]
					if(value && typeof value === 'function') value.bind(o)
				}
				else{
					let items = o.items
					let target = items.filter(item=>item.getAttribute('name') === name)
					if(target.length) return target[0]
					else if(name in items) return items[name]
				}
				return value
			}
		})
	}
	
	function get_wwi_content(){
		return new Promise((success,error)=>{
			if(fxy.is.defined('content-library')) return success()
			return get_wwi_components_code().then(_=>{
				return fxy.port(components.content.index_url)
				          .then(_=>fxy.when('content-library'))
				          .then(success)
				          .catch(error)
			})
		})
		
	}
	//shared actions
	function get_wwi_components_code(){
		return new Promise((success,error)=>{
			if(fxy.is.defined('components-code')) return success()
			return fxy.port(url('components.js'))
			          .then(_=>fxy.when('components-code'))
			          .then(success)
			          .catch(error)
		})
	}
	
})