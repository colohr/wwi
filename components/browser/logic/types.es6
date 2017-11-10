window.fxy.exports('browser',(browser,fxy)=>{
	const sections = Symbol('browser sections')
	const section_element = Symbol('browser section element')
	const item_element = Symbol('browser item element')
	let Section = null
	
	class SectionData extends Map{
		constructor(data,browser_uid){
			super()
			this.browser_uid = browser_uid
			if(fxy.is.text(data) || fxy.is.number(data)) data = {title:data}
			if(!fxy.is.data(data)) data = {title:'Section Title'}
			this.set('data',data)
			browser.memory.set(this.uid,this)
		}
		get data(){ return this.get('data') }
		get element(){ return get_element(this) }
		get item(){ return get_item(this) }
		get list(){ return get_list(this) }
		get opened(){ return get_opened(this) }
		set opened(value){ return set_opened(this,value) }
		get title(){ return this.data.title }
		toggle(){ return toggle(this) }
		get add_item(){ return this.list.add_item.bind(this.list) }
		get add_items(){ return this.list.add_items.bind(this.list) }
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
	
	
	//load
	load()
	
	//exports
	browser.types = {
		get section(){ return create_section },
		get sections(){ return get_sections }
	}
	
	//shared actions
	function add_item(browser){
		return function(data){
			let section = create_section(data,browser.uid)
			section.is_item_only = true
			browser.view.appendChild(section.item)
			return section
		}
	}
	
	function add_items(browser){ return (...data) => data.map(data=>browser.add_item(data)) }
	
	function add_section(browser){
		return function(data){
			let section = create_section(data,browser.uid)
			section.add_section = function(data){ return this.list.add_section(data) }
			section.add_sections = function(...data){ return this.list.add_sections(...data) }
			browser.view.appendChild(section.item)
			return section
		}
	}
	
	function add_sections(browser){ return (...data) => data.map(data=>browser.add_section(data)) }
	
	function create_section(...x){ return new Section(...x) }
	
	function get_element(section){
		if('is_item_only' in section) return null
		if(section_element in section) return section[section_element]
		let element = document.createElement('div')
		element.setAttribute('browser-section','')
		element.style.display="none"
		element.section = section.uid
		element.id = section.uid
		element.setAttribute('tabindex','-1')
		element.sublist = document.createElement('browser-list')
		element.sublist.setAttribute('sublist',section.uid)
		element.appendChild(element.sublist)
		return section[section_element] = element
	}
	
	function get_item(section){
		if(item_element in section) return section[item_element]
		let item = document.createElement('browser-item')
		if(section.is_item_only) item.item = true
		item.section = section.uid
		item.style.opacity=0
		return section[item_element] = item
	}
	
	function get_list(section){
		let element = section.element
		return element !== null ? element.sublist:null
	}
	
	function get_opened(section){
		if(section.is_item_only) return section.item.getAttribute('aria-selected') === "true"
		return section.element.style.display === "block"
	}
	
	function get_sections(browser){
		if(sections in browser) return browser[sections]
		return browser[sections] = new Sections(browser)
	}
	
	function load(){ return fxy.on(UID=>Section = UID(SectionData),'fxy.modules.behavior.UID') }
	
	function set_opened(section,value){
		if(value) {
			let before = section.item.nextElementSibling
			if(!before) section.item.parentElement.appendChild(section.element)
			else section.item.parentElement.insertBefore(section.element,before)
			if(!section.list.parentElement) section.element.appendChild(section.list)
			section.item.expanded=true
			section.element.style.display = "block"
		}
		else {
			section.item.expanded=false
			section.element.style.display = "none"
			section.element.remove()
		}
		return value
	}
	
	function toggle(section){
		if(!('is_item_only' in section)) section.opened = !section.opened
		return section
	}
	
})