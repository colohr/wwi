wwi.exports('kpi',(kpi,fxy)=>{
	
	const item_api = Symbol('item api')

	const Versions = Base => class extends fxy.require('type/Loader')(Base){
		
		get api(){ return this[item_api] }
		set api(value){
			if(!fxy.is.data(value)) return null
			value.item = (bank,ditl)=>{
				let query = this.api.control.queries.item(bank,ditl)
				return this.api.graph.get(query).then(res => res.item_versions_by_ditl)
			}
			return this[item_api] = value
		}
		
		changed(name,old,value){
			switch(name){
				case 'opened':
					if(value) this.aria.expanded = "true"
					else this.aria.expanded = "false"
					break
				case 'ditl':
					if(this.bank) this.load()
					break
			}
		}
		
		close(){
			this.opened = false
			return this
		}
		
		connected(){
			this.setAttribute('tabindex','-1')
			this.setAttribute('role','combobox')
		}
		
		load(){
			this.error.hide()
			this.loading = `${this.bank} - ${this.ditl}`
			return new Promise((success,error)=>{
				if(this.ditl && this.bank) {
					return this.api.item(this.bank,this.ditl)
					           .then(data=>this.update(data))
					           .catch(e=>this.error.show(e))
				}
				else error(new Error('Item is missing the bank or ditl value.'))
			})
		}
		
		open(){
			this.load().then(_=>this.opened = true).then(_=>this)
			return this
		}
		
		update(data){
			let tabs = this.tabs
			let promises = []
			for(let tab of tabs) {
				if(tab.type in data) {
					let template = get_template(data[tab.type])
					promises.push(tab.update(template))
				}
			}
			
			fxy.all(promises).then(_=>this.loading=false)
			return this
		}
		
	}
	
	const Item = Base => class extends Base{
		
		get graphics(){ return this.query('[item-graphics]') }
		
		graphics_update(){
			this.all('img').forEach(img=>{
				//					if(!img.hidden && !img.classList.contains('hidden') && !img.classList.contains('unused')){
				//						if(img.width >= this.view.clientWidth - 20){
				//							img.style.width = `${this.view.clientWidth - 20}px`
				//							img.style.height = 'auto'
				//						}
				//						else{
				//							img.style.width = img.width+'px'
				//							img.style.height = img.height +'px'
				//						}
				//					}
			})
			return this
		}
		
		hide(){
			this.aria.disabled=true
			return this
		}
		
		update(data){
			return new Promise((success,error)=>{
				if(data){
					this.view.innerHTML = data.html
					if(has_graphics(data) !== true) this.graphics.style.display="none"
					if('data_timeout' in this && fxy.is.number(this.data_timeout)){
						window.clearTimeout(this.data_timeout)
						delete this.data_timeout
					}
					window.requestAnimationFrame(()=>{
						this.data_timeout = window.setTimeout(()=>{
							success(this.graphics_update().show())
						},50)
					})
				}
				else success(this.hide())
			})
		}
		
		show(){
			this.aria.disabled=false
			return this
		}
	}
	
	//exports
	kpi.Item = Item
	kpi.Versions = Versions
	
	//shared actions
	function get_template(data){
		if(fxy.is.data(data)) return fxy.require('kpi/template').item(data)
		return null
	}
	
	function has_graphics(data){
		if(!fxy.is.data(data)) return false
		else if(!('graphics' in data)) return false
		return fxy.is.array(data.graphics) && data.graphics.length > 0
	}
	
	
})



//show_error(e){
//	let error = this.query('[error]')
//	let html = ''
//	if(!this.ditl) html += 'Invalid item ditl.'
//	if(!this.bank) html += 'Invalid item bank.'
//	if(e instanceof Error) html = e.message
//	error.innerHTML = html
//	error.style.display = 'block'
//	this.remove_loading()
//}
//function get_loading_element(name){
//	let container = document.createElement('div')
//	container.setAttribute('gui','')
//	container.setAttribute('fit','')
//	container.setAttribute('vertical','')
//	container.setAttribute('center-center','')
//	container.style.transition = 'opacity 300ms ease'
//	container.style.willChange = 'opacity'
//	container.style.background = 'rgb(201,200,202)'
//	container.style.zIndex = '100'
//	container.style.cursor = 'wait'
//
//	let loading = document.createElement('div')
//	loading.innerHTML = `Loading ${name}...`
//	loading.style.textTransform = 'capitalize'
//	loading.style.display = 'block'
//	loading.style.position = 'relative'
//	loading.style.fontSize = '16px'
//	loading.style.color = 'rgb(101,100,102)'
//
//	container.appendChild(loading)
//	return container
//
//}
//remove_loading(){
//
//	if(!this.loading) return
//	this.loading.style.opacity = 0
//	window.requestAnimationFrame(()=>{
//		setTimeout(()=>{
//			if(this.loading) this.loading.remove()
//			delete this.loading
//		},200)
//	},100)
//}