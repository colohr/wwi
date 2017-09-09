window.fxy.exports('element',(element_module,fxy)=>{
	const getting_attribute = Symbol('get attribute')
	
	const Symbols = fxy.symbols
	
	element_module.attributes = Base => class extends Base {
		get aria() { return fxy.require('element/aria')(this) }
		get at(){ return element_at(this) }
	}
	
	//----------shared actions---------
	function element_at(element){
		return element_attribute_proxy(element,get_set_at_names)
	}
	
	function element_attributes(element){
		return element_attribute_proxy(element,get_set_attribute)
	}
	
	function element_attribute_proxy(element,func){
		let a = new Proxy(func.bind(element),{
			deleteProperty(o,name){
				if(typeof name === 'string') { element.removeAttribute(name) }
				return true
			},
			get(o,name){
				if(name === '$') return element
				else if(name === 'add') return add_attribute
				else if(name === 'get') return get_attribute
				else if(name === 'set') return set_attribute
				else if(name === 'remove' || name === 'del' || name === 'delete' || name === 'unset') return remove_attribute
				else if(name === 'is' || name === 'prop') return is_attribute
				else if(name === 'has') return has_attribute
				else if(name === 'map') return map_attribute
				else if(name === 'parse' || name === 'number') return parse_attribute
				else if(name === 'data') return get_attribute_object(element)
				else if(name === 'of') return element_attributes
				if(name in element){
					if(typeof element[name] === 'function') return element[name].bind(element)
					else return element[name]
				}
				return typeof name === 'string' ? element.getAttribute(name):null
			},
			set(o,name,value){
				if(typeof name === 'string') {
					element_attributes(element)(name, value)
					//return true
				}
				return true
			},
			has(o,name){
				return typeof name === 'string' ? element.hasAttribute(name):false
			}
		})
		
		//value
		return a
		
		//	shared actions
		function add_attribute(...x){
			for(var attribute_name of x) {
				element.setAttribute(attribute_name,'')
			}
			return a
		}
		
		function get_attribute(name,...x){
			if(x.length === 0) return element.getAttribute(name)
			let gets = {}
			gets[name] = element.getAttribute(name)
			for(var attribute_name of x) {
				gets[attribute_name] = element.getAttribute(attribute_name)
			}
			return gets
			
		}
		
		function has_attribute(name,...x){
			if(x.length === 0) return element.hasAttribute(name)
			let has = []
			if(name === '*') x = Object.keys(get_attribute_object(element))
			if(element.hasAttribute(name)) has.push(name,element)
			for(var attribute_name of x) {
				if(element.hasAttribute(attribute_name)) {
					has.push(attribute_name)
				}
			}
			return has
		}
		
		function is_attribute(name,new_value){
			if(typeof new_value === 'undefined'){
				let value = element.getAttribute(name)
				if(value === '' || value === 'true') return true
				else if(name in element) return element[name] === true
				return false
			}
			else if(typeof new_value === 'boolean') element[name] = new_value
			else if(new_value === null){
				delete element[name]
				if(element.hasAttribute(name)) element.removeAttribute(name)
			}
			return a
		}
		
		function map_attribute(name,...x){
			let has = new Map()
			if(name === '*') x = Object.keys(get_attribute_object(element))
			else if(element.hasAttribute(name)) has.set(name,element.getAttribute(name))
			for(var attribute_name of x) {
				if(element.hasAttribute(attribute_name)){
					has.set(attribute_name,element.getAttribute(attribute_name))
				}
			}
			return has
		}
		
		function parse_attribute(name,value){
			if(typeof value !== 'undefined') {
				element_attributes(element)(name,value)
				return a
			}
			if(!element.hasAttribute(name)) return -1
			let number = parseFloat(element.getAttribute(name))
			if(isNaN(number)) return -1
			return number
		}
		
		function remove_attribute(...x){
			for(var attribute_name of x) {
				element.removeAttribute(attribute_name)
			}
			return a
		}
		
		function set_attribute(...x){
			element_attributes(element)(...x)
			return a
		}
		
	}
	
	function get_attribute_object(element){
		let attributes = element.attributes
		let data = {}
		for(let i=0;i<attributes.length;i++){
			let item = attributes.item(i)
			data[item.name] = item.value
		}
		return data
	}
	
	function get_set_attribute(...x){
		let data = get_attribute_input(...x)
		for(let name in data){
			let value = data[name]
			if(value === getting_attribute) return this.getAttribute(name)
			else if(value === null) this.removeAttribute(name)
			else this.setAttribute(name,value)
		}
		return this
		//shared actions
		function get_attribute_input(...x){
			let value = {}
			if(x.length === 1){
				if(fxy.is.text(x[0])) value[x[0]] = getting_attribute
				else if(fxy.is.data(x[0])) value = x[0]
			}
			else if(x.length === 2) value[x[0]] = x[1]
			return value
		}
	}
	
	function get_set_at_names(...x){
		let at = get_at_names(...x)
		let symbol = at.symbol || Symbols.true
		for(let name of at.names){
			if(symbol === Symbols.true) this.setAttribute(name,'')
			else if(symbol === Symbols.false) this.removeAttribute(name)
		}
		return this
		//	shared actions
		function get_at_names(...x){
			let names = x.filter(value=>{ return fxy.is.text(value) })
			let symbol = x.filter(value=>{ return fxy.is.symbol(value) })[0]
			return {names,symbol}
		}
	}
	
})



