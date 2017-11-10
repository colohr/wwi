window.fxy.exports('element',(element,fxy)=>{
	
	class ValueIdentity{
		constructor(x){
			x = fxy.id.dash(x)
			this.key = x.includes('--') ? x:`--${x}`
			this.name = x.includes('--') ? x.replace('--',''):x
		}
	}
	
	const Design = Base => class extends Base {
		get design(){ return get_design(this) }
		
		get height() { return get_height(this) }
		set height(x) { return set_height(this,x) }
		
		get size() { return get_size(this) }
		set size(size) { return set_size(this,size) }
		
		get offset(){ return get_offset(this) }
		
		get width() { return get_width(this) }
		set width(x) { return set_width(this,x) }
		
	}
	
	//exports
	element.design = Design
	element.design_of = get_design_of
	
	//shared actions
	function get_design(element){
		return new Proxy(element.style,{
			deleteProperty(o,name){
				name = fxy.id.dash(name)
				o.removeProperty(name)
				return true
			},
			get(o,name){
				if(name === 'value') return get_design_value(o)
				else if(name === 'of') return get_design_of
				name = fxy.id.dash(name)
				let value = o.getPropertyValue(name)
				if(value) return value
				return null
			},
			has(o,name){
				if(o[name] || o[fxy.id.dash(name)]) return true
				let design_value =  get_design_value(o.style)
				if(name in design_value) return true
				return false
			},
			set(o,name,value){
				
				name = fxy.id.dash(name)
				o.setProperty(name,value)
				return value
			}
		})
	}
	
	function get_design_value(style){
		return new Proxy(style,{
			deleteProperty:delete_value,
			get:get_value,
			has:has_value,
			set:set_value
		})
		//shared actions
		function delete_value(o,name){
			let id = value_identity(name)
			if(id) o.removeProperty(id.key)
			return true
		}
		
		function get_value(o,name){
			if(o.length){
				let id = value_identity(name)
				if(has_value(o,id)) return o.getPropertyValue(id.key)
			}
			return null
		}
		
		function has_value(o,name){
			if(o.length){
				let id = value_identity(name)
				if(id) return o.getPropertyValue(id.key).length
			}
			return false
		}
		
		function set_value(o,name,value){
			let id = value_identity(name)
			if(id) o.setProperty(id.key,value)
			return value
		}
		
		function value_identity(x){
			if(fxy.is.text(x)){
				x = x.trim()
				if(x) return new ValueIdentity(x)
			}
			else if(fxy.is.data(x) && x instanceof ValueIdentity) return x
			return null
		}
	}
	
	function get_design_of(e){
		return new Proxy(e,{
			get(o,name){
				switch(name){
					case 'design':
						return get_design(o)
					case 'of':
						return get_design_of
					case 'height':
						return get_height(o)
					case 'size':
						return get_size(o)
					case 'ui':
						return get_ui(o)
					case 'offset':
						return get_offset(o)
					case 'width':
						return get_width(o)
					
				}
				if(name in o) return o[name]
				return null
			}
		})
	}
	
	function get_height(e){
		let x = null
		if (e.hasAttribute('height')) {
			x = e.getAttribute('height')
			if (!x || x === 'auto') x = null
			else x = parseFloat(x)
		}
		if (!x) x = e.clientHeight
		return x
	}
	
	function get_offset(e){
		return function offset(){
			let el = e.getBoundingClientRect()
			let	scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
			let	scrollTop = window.pageYOffset || document.documentElement.scrollTop
			return {
				top: el.top + scrollTop,
				left: el.left + scrollLeft
			}
		}
	}
	
	function get_size(e){ return e.getBoundingClientRect() }
	
	function get_width(e){
		let x = null
		if (e.hasAttribute('width')) {
			x = e.getAttribute('width')
			if (!x || x === 'auto') x = null
			else x = parseFloat(x)
		}
		if (!x) x = e.clientWidth
		return x
	}
	
	function set_height(e,x){
		if (x === null) {
			e.removeAttribute('height')
			e.style.height = ''
		}
		else {
			let h = parseFloat(x)
			if (isNaN(x)) h = x
			else if (typeof x === 'string') h = x
			else h = h + 'px'
			e.setAttribute('height', h)
			e.style.height = h
		}
		return e.style.height
	}
	
	function set_size(e,size){
		if (typeof size === 'number' || typeof size === 'string') {
			e.height = size
			e.width = size
		} else if (typeof size === 'object' && size === null) {
			if (typeof size.height !== 'undefined') e.height = size.height
			if (typeof size.width !== 'undefined') e.width = size.width
		}
		return size;
	}
	
	function set_width(e,x){
		if (x === null) {
			e.removeAttribute('width')
			e.style.width = ''
		}
		else {
			let h = parseFloat(x)
			if (isNaN(x)) h = x;
			else if (typeof x === 'string') h = x
			else h = h + 'px'
			e.setAttribute('width', h)
			e.style.width = h
		}
		return e.style.width
	}
	
})