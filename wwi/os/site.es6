(()=>{
	class SiteApplication{
		constructor(element){
			this.element = element || window.document.body
			const bodydown = (e)=>{
				if(this.aside_opened) {
					if(e.stopPropagation) e.stopPropagation()
					if(e.preventDefault) e.preventDefault()
					this.aside_opened = false
				}
			}
			const asidedown = (e)=>{ if(e.stopPropagation) { e.stopPropagation() } if(e.preventDefault) { e.preventDefault() } }
			this.body.addEventListener('mousedown',bodydown,false)
			this.aside.addEventListener('mousedown',asidedown,false)
		}
		get aside(){ return this.query('aside') }
		get aside_button(){ return this.bar.aside_button }
		get aside_opened(){ return this.aside.hasAttribute('opened') }
		set aside_opened( opened ){
			if(opened){
				this.aside.opened = ''
				this.aside_button.setAttribute('opened','')
				this.aside.tabs = true
			}else{
				this.aside.opened = null
				this.aside_button.removeAttribute('opened')
				this.aside_button.blur()
				this.aside.tabs = false
			}
			return opened
		}
		get bar(){return this.query('bar')}
		get body(){return window.document.body}
		get footer(){return this.query('footer')}
		get main(){return this.query('main')}
		get name(){return this.body.hasAttribute('app') ? this.body.getAttribute('app'):'wwi'}
		get nav(){return this.query('nav')}
		
		query(name){return this.element.query(`app-${name}`)}
	}
	class Site extends SiteApplication{
		constructor(element){
			super(element)
			window.app.site = this
			if('router' in element) window.app.router = element.router
		}
	}
	return Site
})()



//wwi.exports( 'os', os => {
//
//
//
//
//	return os.site = Site
//
//})