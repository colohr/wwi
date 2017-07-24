wwi.exports('dom',(dom,fxy)=>{

	
	class Site{
		constructor(element){
			window.app.site = this
			this.element = element
			this.drawer_button.setAttribute('opens','')
			this.drawer_button.define('routes',{
				opened(opened){
					if(opened === null) window.app.site.drawer.opened = false
					else window.app.site.drawer.opened = true
				}
			})
			
			this.drawer.on('transition',e=>{
				let detail = e.detail
				if(detail.closed && this.drawer_button.opened) this.drawer_button.opened=false
				else if(detail.opened && !this.drawer_button.opened) this.drawer_button.opened=true
			})
			
			this.element.onfocus = e => this.bar.drawer_button.focus()
			this.element.setAttribute('tabindex','0')
			window.document.body.onfocus = e => this.bar.drawer_button.focus()
			window.onfocus = e => this.bar.drawer_button.focus()
		}
		get bar(){ return this.query('[app-bar]') }
		get drawer(){ return this.element.query('[app-drawer]') }
		get drawer_button(){ return this.bar.drawer_button }
		query(name){ return this.element.query(`${name}`) }
	}
	
	dom.app = Base => class extends Base{
		constructor(){
			super('routes',{
				loading(value){
					this.query('[app-pages]').loading = value === null ? false:true
				}
			})
			this.setAttribute('id','app')
		}
		
		connected(){
			this.on('module opened',e=>set_active_module(this,e.detail))
			wwi.when('content-library','content-bar','wwe-button','content-drawer','content-menu')
			   .then(()=>set_app_elements(this))
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
		})
	}
	
	function set_app_elements(e){
		return new Promise((success,error)=>{
			e.site = new Site(e)
			e.menu.item_selector_options = {item:'wwe-button',role:'option'}
			e.drawer.app = true
			e.router = new dom.Router(e.module_routes)
			return window.requestAnimationFrame(()=>{
				let pages = e.query('[app-pages]')
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

})

/*
 let pages = Array.from(pages_container.querySelectorAll('*')).map(page=>{
 if(!page.hasAttribute('name')) page.setAttribute('name',page.localName.replace('-page',''))
 if(!page.hasAttribute('page-title')) page.setAttribute('page-title',fxy.id.proper(page.getAttribute('name')))
 return page
 }).sort((x,y)=>{
 let a = x.getAttribute('page-title')
 let b = y.getAttribute('page-title')
 if(a > b) return 1
 else if(a < b) return -1
 return 0
 }).map((page,index)=>{
 page[app_page_index] = index
 return page
 })
 
 if( !('buttons' in pages_container) || pages.length !== pages_container.buttons.length){
 pages_container.buttons = pages.map(page=>{ return {
 name:page.getAttribute('name'),
 title:page.getAttribute('page-title')
 }}).map(({name,title})=>{
 if(!name) return null
 if(e.menu.has_item('hash',name)) return e.menu.get_item('hash',name)
 let button = document.createElement('wwe-button')
 button.setAttribute('hash',name)
 button.setAttribute('kind','item')
 button.setAttribute('tabindex','-1')
 button.setAttribute('role','option')
 button.innerHTML = title
 e.menu.appendChild(button)
 return button
 })
 }
 return e

*
* */