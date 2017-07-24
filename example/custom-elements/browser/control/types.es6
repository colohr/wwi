wwi.exports('browser',(browser,fxy)=>{
	
	const sections = Symbol('browser sections')
	const section = Symbol('browser section')
	const section_element = Symbol('browser section element')
	const item_element = Symbol('browser item element')
	
	
	class Section extends fxy.uid.Mix(Map){
		static element(section){
			let element = document.createElement('div')
			element.setAttribute('browser-section','')
			element.style.display="none"
			element.section = section.uid
			element.id = section.uid
			element.setAttribute('tabindex','-1')
			element.sublist = document.createElement('browser-list')
			element.sublist.setAttribute('sublist',section.uid)
			element.appendChild(element.sublist)
			return element
		}
		static item(section){
			let item = document.createElement('browser-item')
			if(section.is_item_only) item.item = true
			item.section = section.uid
			item.style.opacity=0
			return item
		}
		constructor(data,browser_uid){
			super()
			this.browser_uid = browser_uid
			if(fxy.is.text(data) || fxy.is.number(data)) data = {title:data}
			if(!fxy.is.data(data)) data = {title:'Section Title'}
			this.set('data',data)
			browser.memory.set(this.uid,this)
		}
		get data(){ return this.get('data') }
		get element(){
			if('is_item_only' in this) return null
			if(section_element in this) return this[section_element]
			return this[section_element] = this.constructor.element(this)
		}
		get item(){
			if(item_element in this) return this[item_element]
			return this[item_element] = this.constructor.item(this)
		}
		get list(){
			let element = this.element
			return element !== null ? element.sublist:null
		}
		get opened(){
			if(this.is_item_only) return this.item.getAttribute('aria-selected') === "true"
			return this.element.style.display === "block"
		}
		set opened(value){
			if(value) {
				
				let before = this.item.nextElementSibling
				if(!before){
					this.item.parentElement.appendChild(this.element)
				}else{
					this.item.parentElement.insertBefore(this.element,before)
				}
				if(!this.list.parentElement){
					this.element.appendChild(this.list)
				}
				
				this.item.expanded=true
				this.element.style.display = "block"
			}
			else {
				this.item.expanded=false
				this.element.style.display = "none"
				this.element.remove()
				
				
			}
		}
		get title(){ return this.data.title }
		
		toggle(){
			if(!('is_item_only' in this)){
				if(this.opened) this.opened = false
				else this.opened = true
			}
			return this
		}
		get add_item(){
			return this.list.add_item.bind(this.list)
		}
		get add_items(){
			return this.list.add_items.bind(this.list)
		}
		get uid_prefix(){ return 'section' }
		
	}
	
	class Sections{
		constructor(browser){
			this.uid = browser.uid
			this.add_item = add_item(browser)
			this.add_items = add_items(browser)
			this.add_section = add_section(browser)
			this.add_sections = add_sections(browser)
		}
	}

	browser.types = {
		get section(){ return create_section },
		get sections(){ return get_sections }
	}
	
	function add_section(browser){
		return function(data){
			let section = create_section(data,browser.uid)
			section.add_section = function(data){
				return this.list.add_section(data)
			}
			section.add_sections = function(...data){
				return this.list.add_sections(...data)
			}
			browser.view.appendChild(section.item)
			//browser.appendChild(section.element)
			return section
		}
	}
	function add_sections(browser){
		return function(...data){
			return data.map(data=>browser.add_section(data))
		}
	}
	function add_item(browser){
		return function(data){
			let section = create_section(data,browser.uid)
			section.is_item_only = true
			browser.view.appendChild(section.item)
			return section
		}
	}
	function add_items(browser){
		return function(...data){
			return data.map(data=>browser.add_item(data))
		}
	}
	
	
	
	function create_section(...x){
		return new Section(...x)
	}
	function get_sections(browser){
		if(sections in browser) return browser[sections]
		return browser[sections] = new Sections(browser)
	}
	
})