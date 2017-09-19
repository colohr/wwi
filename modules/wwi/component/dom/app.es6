window.fxy.exports('dom',(dom,fxy)=>{
	
	const App = Base => class extends Base{
		constructor(){
			//load
			load_wwi_content()
			super('routes',{ loading(value){ this.query('[app-pages]').loading = value === null ? false:true } })
			this.options = new AppOptions(this)
		}
		connected(){
			fxy.when('content-library').then(()=>set_elements(this))
			   .then(()=>this.show())
			   .catch(console.error)
		}
		get drawer(){ return this.site.drawer }
		get menu(){ return this.query('content-menu') }
		get pages() { return get_pages(this) }
		show(){ /*app is showing*/ }
		
	}
	
	class AppOptions{
		constructor(element){
			this.has = (name)=>element.hasAttribute(name)
			this.get = (name)=>element.getAttribute(name)
		}
		get folder(){ return fxy.file.join(this.route_path,this.route_folder) }
		get route_folder(){ return this.has('route-folder') ? this.get('route-folder'):'pages' }
		get route_path(){ return this.has('route-path') ? this.get('route-path'):window.kit.path }
		get route_type(){ return this.has('route-type') ? this.get('route-type'):'page' }
		get routes(){ return { type:this.route_type, folder:this.route_folder } }
	}
	
	class Site{
		constructor(element){
			this.element = element
			let drawer_button = this.drawer_button
			element.setAttribute('role','application')
			if(drawer_button){
				drawer_button.setAttribute('opens','')
				drawer_button.define('routes',{
					opened(opened){
						if(opened === null) element.site.drawer.opened = false
						else element.site.drawer.opened = true
					}
				})
			}
			let drawer = this.drawer
			if(drawer && drawer_button){
				drawer.on('transition',e=>{
					let detail = e.detail
					if(detail.closed && drawer_button.opened) drawer_button.opened=false
					else if(detail.opened && !drawer_button.opened) drawer_button.opened=true
				})
			}
			this.app_title = window.app.title
		}
		get bar(){ return this.query('[app-bar]') }
		get drawer(){ return this.element.query('[app-drawer]') }
		get drawer_button(){ return this.element.query('[app-drawer-button]') }
		query(name){ return this.element.query(`${name}`) }
		get_title(){
			let element = this.query('[app-title]')
			let title = this.app_title
			if(element) {
				let text = element.innerText.trim()
				if(text.length) title += `: ${text}`
			}
			return title
		}
		get title(){ return this.get_title() }
		set title(value){
			let element = this.query('[app-title]')
			if(element) element.innerText = value
			window.app.title = this.get_title()
		}
	}
	
	
	
	
	//exports
	dom.app = App
	
	//shared actions
	function get_pages(e){
		return new Proxy(e.query('[app-pages]'),{
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
	
	function load_wwi_content(){
		if(!fxy.is.defined('content-library')){
			get_wwi_components_code().then(_=>fxy.port(window.components.content.index_url).then(_=>{})).catch(console.error)
			//shared actions
			function get_wwi_components_code(){
				return new Promise((success,error)=>{
					if(fxy.is.defined('components-code')) return success()
					return fxy.port(window.url('components.js'))
					          .then(_=>fxy.when('components-code'))
					          .then(success)
					          .catch(error)
				})
			}
		}
	}
	
	function set_elements(e){
		return new Promise((success,error)=>{
			e.site = new Site(e)
			if(e.menu) e.menu.item_selector_options = {role:'option'}
			if(e.drawer) e.drawer.app = true
			e.router = new dom.Router(e,e.options.routes)
			return window.requestAnimationFrame(()=>{
				let pages = e.query('[app-pages]')
				if(pages) pages.connect_menu(e)
				return e.router
				        .goto()
				        .then(x=>e.drawer.set_tabindex(false))
				        .then(_=>e.setAttribute('id','app'))
				        .then(success)
				        .catch(error)
			})
		})
	}
	
})