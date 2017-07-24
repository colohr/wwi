wwi.exports('element',(element)=>{
	
	const DesignMix = Base => class extends Base {
		
		get design(){ return get_design(this) }
		
		get height() { return get_height(this) }
		set height(x) { return set_height(this,x) }
		
		get size() { return get_size(this) }
		set size(size) { return set_size(this,size) }
		
		get ui() { return get_ui(this) }
		
		get offset(){ return get_offset(this) }
		
		get width() { return get_width(this) }
		set width(x) { return set_width(this,x) }
		
	}
	
	element.design = DesignMix
	
	function get_design(e){
		return new Proxy(e,{
			get(o,name){
				if(name in o) return o[name]
				switch(name){
					case 'of':
						return get_design_of
				}
				return null
			}
		})
	}
	
	function get_design_of(e){
		return new Proxy(e,{
			get(o,name){
				switch(name){
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
		var x = null
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
	
	function get_ui(e){
		return function(name, value){
			if (typeof name === 'object' && name !== null) {
				Object.assign(e.style, name)
				return e.style
			}
			if (name && typeof name === 'string') {
				if (typeof value !== 'undefined') e.style[name] = value
				return e.style[name]
			}
			return e.style
		}
	}
	
	function get_width(e){
		var x = null
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
			var h = parseFloat(x)
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
			var h = parseFloat(x)
			if (isNaN(x)) h = x;
			else if (typeof x === 'string') h = x
			else h = h + 'px'
			e.setAttribute('width', h)
			e.style.width = h
		}
		return e.style.width
	}
	
})