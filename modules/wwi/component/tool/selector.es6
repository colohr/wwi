window.fxy.exports('tool',(tool,fxy)=>{
	const selector_data = { skips:new Set(['style', 'class', 'id', 'tabindex' ]) }
	//exports
	tool.selector = selector_tool()
	tool.contains_element = contains_element
	
	//shared actions
	function selector_tool(){
		return new Proxy(get_element_selector,{
			get(o,name){
				switch(name){
					case 'classes':
						return get_element_selector_classes
					case 'attributes':
						return get_element_selector_attributes
					case 'skips':
						return selector_data.skips
				}
				return null
			}
		})
	}
	
	function contains_element(container,element){
		if(contains_child_element(container,element)) return true
		let selector = fxy.selector(element)
		if(selector) return container.query(selector) !== null
		return false
	}
	
	function contains_child_element(container,element){
		if(fxy.is.element(element)){
			if('shadowRoot' in container && element.parentNode === container.shadowRoot) return true
			else if(element.parentNode === container) return true
			else if(get_children(container).includes(element)) return true
		}
		return false
	}
	
	function get_children(element){
		return Array.from(element.children)
	}
	
	function get_element_selector(element,skip){
		if(!is_text(skip)) skip = ''
		else if(skip === 'element') skip = 'classes attributes'
		if(is_text(element)) return element
		else if(is_element(element)){
			let tag = element.localName
			let id = element.hasAttribute('id') ? `#${element.getAttribute('id')}`:''
			let classes = ''
			if(skip && !skip.includes('classes')) classes = get_element_selector_classes(element)
			let attributes = ''
			if(skip && !skip.includes('attributes')) attributes = get_element_selector_attributes(element)
			return `${tag}${id}${attributes}${classes}`
		}
		return null
	}
	
	function get_element_selector_attributes(element){
		let a = element.attributes
		let count = a.length
		if(count){
			let list = []
			for(let i=0;i<count;i++){
				let item = a.item(i)
				if(item.value.length < 30 && get_element_selector_valid_attribute(item.name)){
					if(item.value === '') list.push(`[${item.name}]`)
					else list.push(`[${item.name}="${item.value}"]`)
				}
			}
			return list.join('')
		}
		return ''
	}
	
	function get_element_selector_classes(element){
		let list = element.hasAttribute('class') ? element.getAttribute('class').split(' '):null
		if(list) return list.map(name=>name.trim()).filter(name=>!name.length).map(name=>`.${name}`).join('')
		return ''
	}
	
	function get_element_selector_valid_attribute(name){
		if(!selector_data.skips.has(name)) return false
		return name.indexOf('data-') !== 0
	}
	
})