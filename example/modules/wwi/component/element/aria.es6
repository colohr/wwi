wwi.exports('element', (element, fxy) => {
	
	
	const not_aria_name = ['role','tabindex','outline','state']
	
	
	element.aria = (el) => {
		return new Proxy(el, {
			get(o, name){
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
	
})
