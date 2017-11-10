window.fxy.exports('element', (element_exports, fxy) => {
	
	const not_aria_name = ['role','tabindex','outline','state']
	const Aria = (element) => {
		return new Proxy(element, {
			get(o, name){
				if(name === 'set') return get_aria_set(o)
				name = get_name(name)
				if(!name) return null
				return o.getAttribute(name)
			},
			has(o, name){
				name = get_name(name)
				return o.hasAttribute(name)
			},
			set(o, name, value){
				name = get_name(name)
				if(!name) return true
				value = get_value(name,value)
				o.setAttribute(name, value)
				return true
			}
		})
	}
	
	//exports
	element_exports.aria = Aria
	element_exports.label = label
	element_exports.button = button
	
	//exports
	function button(element){
		let at = get_attributes(element)
		if(!at.has('type')) at.set('type','button')
		if(at.name !== 'button' && !at.has('role')) at.set('role','button')
		if(!at.has('tabindex')) at.set('tabindex','0')
		if(!at.has('aria-pressed')) at.set('aria-pressed','false')
		if(!at.has('aria-disabled')) at.set('aria-disabled','false')
		
		return set_actions()
		//shared actions
		function set_actions(){
			if(at.has('toggles') || at.has('clicks')) element.addEventListener('click',on_click,false)
			Object.defineProperty(element,'pressed',{
				get(){ return this.getAttribute('aria-pressed') === 'true' },
				set(value){ this.setAttribute('aria-pressed',value) }
			})
			return label(element)
			//shared actions
			function on_click(event){
				if(at.has('toggles')) element.pressed = !element.pressed
				let data = event_data(element)
				data.detail.event = event
				data.detail.type = event.type
				dispatch(element,data)
			}
		}
	}
	
	function event_data(element){
		return {
			bubbles:true,
			composed:true,
			detail:{
				get id(){ return element.getAttribute('id') },
				get name(){ return element.getAttribute('name') },
				get role(){ return element.getAttribute('role') }
			}
		}
	}
	
	function dispatch(element,data){
		if(!fxy.is.data(data)) data = event_data(element)
		element.dispatchEvent(new CustomEvent('aria',data))
		return element
	}
	
	function get_aria_set(element){
		return {
			elements(selectors){
				if(!fxy.is.text(selectors)) selectors = 'button'
				let items = element.all(selectors)
				for(let item of items){
					if(item.localName === 'button') button(item)
				}
				return items
			}
		}
	}
	
	function get_attributes(element){
		return {
			get(name){ return element.getAttribute(name) },
			has(name){ return element.hasAttribute(name) },
			name:element.localName,
			remove(name){ return element.removeAttribute(name) },
			set(name,value){ return element.setAttribute(name,value) }
		}
	}
	
	function get_name(name) {
		if (fxy.is.string(name)) {
			if(name.includes('aria')) return name
			else if(not_aria_name.includes(name)) return name
			else return `aria-${name}`
		}
		return null
	}
	
	function get_value(name,value) {
		if(fxy.is.nothing(value)) return null
		switch(name){
			case 'role':
				break
			case 'tabindex':
				if(fxy.is.numeric(value)) return value+''
				break
			default:
				if(fxy.is.bool(value) || fxy.is.text(value)) return value+''
				break
		}
		return value
	}
	
	function label(element){
		let at = get_attributes(element)
		if(at.has('aria-label') || at.has('aria-labeledby')) return element
		let value = ''
		if(at.has('title')) value = at.get('title')
		else value = element.textContent.trim()
		if(!value && at.has('name')) value = fxy.id.proper(at.get('name'))
		if(value) at.set('aria-label',value)
		return element
	}
	
})
