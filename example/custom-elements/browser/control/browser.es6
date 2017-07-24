wwi.exports('browser',(browser,fxy)=>{

	browser.Mix = Base => class extends fxy.uid.Mix(Base){
		get sections(){ return  browser.types.sections(this) }
		connectedCallback(){
			
			let called = false
			try{
				super.connectedCallback()
				called = true
			}catch(e){
				console.error(e)
			}
			if(!called){
				try{
					if('connectedCallback' in this.constructor){
						this.constructor.connectedCallback()
						called = true
					}
				}
				catch(e){
					console.error(e)
				}
			}
			if('browser_connected' in this) this.browser_connected()
			if(!called) this.dispatch('connected')
		}
		get items(){ return this.all('browser-item') }
		add_item(...x){ return this.sections.add_item(...x) }
		add_items(...x){ return this.sections.add_items(...x) }
		add_section(...x){ return this.sections.add_section(...x) }
		add_sections(...x){ return this.sections.add_sections(...x) }
		get uid_prefix(){ return 'browser' }
		disconnected(){
			this.items.forEach(item=>{
				item.style.opacity=0
			})
		}
		
	}
	
	
	
	
})