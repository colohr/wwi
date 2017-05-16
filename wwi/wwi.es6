
const wwi = ((window)=>{

	const modules = Symbol('world wide internet modules')
	const added_symbols = Symbol.for('user added symbols')
	const Symbols = {
		a11y:{
			connected:Symbol.for('a11y connected element'),
			element:Symbol.for('a11y element'),
			is:Symbol.for('state: is a11y element'),
			type:Symbol.for('state: has a11y type value'),
			kind:Symbol.for('state: has a11y kind value')
		},
		[added_symbols]:{},
		get ally(){return this.a11y},
		Listener: Symbol(' element listener '),
		Callbacks: Symbol(' element callbacks '),
		Properties: Symbol(' element properties '),
		Canvas: Symbol(' element canvas '),
		AttributeData: Symbol(' element attributes '),
		'true':Symbol('true value'),
		'false':Symbol('false value'),
		nil:Symbol('nil value or null'),
		Pointable: {'click': true, 'down': true, 'up': true, tap: true},
		Methods: {
			dragover(e){
				e.preventDefault()
			}
		},
		Restyle: {
			types: [
				{
					keys: 'drag start',
					pointable: true,
					css: {
						userSelect: 'none'
					}
				}
			],
			clientType(client, type){
				let css = type.css;
				let o = {}
				for (let key in css) {
					let v = client.vendor(window.document.body.style, key);
					if ('value' in v) {
						o[v.key] = css[key]
					} else {
						o[key] = css[key]
					}
				}
				return o;
			},
			event(type, element){
				if (typeof type !== 'string' || !(element instanceof HTMLElement)) return element;
				let types = this.types;
				let client = window.app && window.app.client ? window.app.client : null;
				let isPointer = type in Symbols.Pointable
				types.forEach((T) => {
					let has = (isPointer && T.pointable) || T.keys.includes(type)
					//console.log('isPointer ' + isPointer, 'pointable ' + T.pointable)
					if (has) {
					//	console.log('RESTYLE', T, type, element)
						let css = client ? this.clientType(client, T) : T.css;
						Object.assign(element.style, css);
					}
				});
				return element;
			}
		}
	}
	
	class Fxy extends Map{
		constructor(){
			super()
			this[modules] = new Map()
		}
		get dot(){ return get_dot_notation }
		folder(path){
			if(!this.has(path)) this.set(path,new Map())
			return this.get(path)
		}
		join(...paths){
			return paths.map(path=>{
				if(typeof path !== 'string') return null
				path = path.trim()
				if(path.length <= 0) return null
				return path
			}).filter(path=>{
				return path !== null
			}).join('/')
		}
		get is(){
			return {
				array:is_array,
				bool:is_bool,
				data:is_data,
				element:is_element,
				element_data:is_element_data,
				error:is_error,
				function:is_function,
				instance:is_instance,
				json:is_json,
				map:is_map,
				nothing:is_nothing,
				number:is_number,
				numeric:is_numeric,
				object:is_object,
				set:is_set,
				string:is_string,
				symbol:is_symbol,
				text:is_text,
				TF:is_TF
			}
		}
		get id(){
			const lodash = window._
			return {
				get camel(){ return this.code },
				capital(){ throw new Error(`Capital changed to capitalize. Use fxy.ks.capitalize.`) },
				capitalize(value){ return is_text(value) ? lodash.capitalize(value):'' },
				code(value){ return is_text(value) ? lodash.camelCase(value):'' },
				dash(value){ return is_text(value) ? lodash.kebabCase(value):'' },
				dot_notation(value){ return this.words(value).join('.') },
				get dots(){ return this.dot_notation },
				get kebab(){return this.dash},
				path(value){ return this.words(value).join('/') },
				proper(value){ return this.words(value).map(word=>this.capitalize(word)).join(' ') },
				readable(value){ return this.words(value).join(' ') },
				get snake(){return this.underscore},
				underscore(value){ return is_text(value) ? lodash.snakeCase(value):'' },
				words(value){ return is_text(value) ? lodash.words(value):[] },
				get _(){ return this.underscore }
			}
		}
		get ks(){ return this.id }
		module(paths){
			let folder
			if(!is_data(paths)) return null
			else if( 'path' in paths && 'name' in paths ){
				
				folder = this.has(paths.path) ?
					     this.folder(paths.path) : null
				
				return is_map(folder) &&
				       folder.has(paths.name) ?
					   folder.get(paths.name) : null
				
			}
			return null
		}
		get numeral(){return get_numeral}
		paths(pathname){ return this[modules].get(pathname) }
		require(...paths){
			let pathname = this.join(...paths)
			return this.module( this.paths(pathname) )
		}
		save(path,name,value){
			let pathname = this.join(path,name)
			this[modules].set(pathname,{ path, name })
			return this.folder(path).set(name,value).get(name)
		}
		get symbols(){
			return new Proxy(Object.keys(Symbols),{
				get(o,name){
					if(name in Symbols) return Symbols[name]
					else if(name in Symbols[added_symbols]) return Symbols[added_symbols][name]
					else if(typeof name === 'string') return Symbol.for(name)
					return null
				},
				has(o,name){
					return name in Symbols || name in Symbols[added_symbols]
				},
				set(o,name,value){
					if(is_text(value)) {
						if(!is_symbol(value)) console.warn(`New Symbol ${name} = ${value} is not a symbol. It will change to the Symbol.for(${value})`)
						Symbols[added_symbols][name] = Symbol.for(value)
					}
					return true
				},
				deleteProperty(o,name){
					if(name in Symbols[added_symbols]) delete Symbols[added_symbols][name]
					return name
				}
			})
		}
		get tag(){ return tag_closure }
	}
	
	const fxy = new Fxy()

	class WorldWideInternet{
		constructor(){}
		get define(){ return define_custom_element }
		exports(folder,action){ return action(module_exports(folder),fxy) }
		get fxy(){return fxy}
		require(...x){return fxy.require(...x)}
		get symbols(){return fxy.symbols}
		when(name){ return window.customElements.whenDefined(name) }
		get vally(){ return this.va11y }
	}
	
	
	
	//----------shared actions-----------
	
	//custom elements v1 unification
	
	function old_define_custom_element(tag_name,custom_element){
		return new Promise((resolve,reject)=>{
			let custom_elements = 'customElements' in window ? window.customElements:null
			if(custom_elements === null) return reject(new Error(`Custom Elements is not supported in this browser so wwi cannot define ${tag_name}.`))
			let defined_element = custom_elements.get(tag_name)
			if( is_nothing(defined_element) ){
				custom_elements.define(tag_name,custom_element)
				return custom_elements.whenDefined(tag_name).then(()=>{
					return resolve(custom_element)
				}).catch(reject)
			}
			return resolve(defined_element)
		})
	}
	
	function define_custom_element(tag_name,custom_element){
		return define_custom_element.action( tag_name, define_custom_element.define( tag_name, custom_element ) )
	}
	
	define_custom_element.ability = function(tag_name){
		if(define_custom_element.able) return window.customElements
		return new Error(`Custom Elements is not supported in this browser so wwi cannot define ${tag_name || ''}.`)
	}
	
	define_custom_element.able = 'customElements' in window
	
	define_custom_element.action =  function(tag_name,defined){
		return {
			tag_name,
			error:defined instanceof Error,
			get then(){ return define_custom_element.then(this.tag_name) }
		}
	}
	
	define_custom_element.then = function(tag_name){
		return function define_then(callback){
			return define_custom_element.when(tag_name).then(callback)
		}
	}
	
	
	define_custom_element.define = function(tag_name,custom_element){
		const custom_elements = define_custom_element.ability(tag_name)
		if(custom_elements instanceof Error) return custom_elements
		return define_custom_element.set(custom_elements,tag_name,custom_element)
	}
	define_custom_element.has = function(custom_elements,tag_name){
		let defined_element = custom_elements.get(tag_name)
		if( is_nothing(defined_element) ) return false
		return defined_element
	}
	define_custom_element.set = function(custom_elements,tag_name,custom_element){
		let defined_element = define_custom_element.has(custom_elements,tag_name)
		if(!defined_element) {
			custom_elements.define(tag_name,custom_element)
			return custom_element
		}
		return defined_element
	}
	define_custom_element.when = function(tag_name,custom_element){
		return new Promise((success,error)=>{
			const defined = define_custom_element.define(tag_name,custom_element)
			if(defined instanceof Error) return error(defined)
			return window.customElements
			             .whenDefined(tag_name)
			             .then(()=>{ return success(defined) })
			             .catch(error)
		})
	}
	
	
	function get_array( array, map ){
		if(is_array(array)) {
			if(is_function(map)) array = array.map(map)
			else if( is_text(map) && map in get_array ) {
				array = array.map(get_array[map].map)
				             .filter(get_array[map].filter)
			}
		}
		else array = []
		return array
	}
	get_array.empty_text = {
		filter:function filter_empty_text(text){
			if(!is_text(text)) return false
			return true
		},
		map:function map_empty_text(text){
			if(is_text(text)) return text.trim()
			return null
		}
	}
	
	
	//add more difference types
	function get_difference(original,value){
		if(is_string(original)){
			let difference = original.replace(`${value}`,'').trim()
			if(difference.length) return difference
		}
		return null
	}
	
	function get_dot_notation(x){
		return  {
			get container(){ return this.parts.slice( 0, this.count-1 ).join('.') },
			get count(){ return this.parts.length },
			origin:is_text(x) ? x:'',
			get parts(){
				return 'particles' in this ?
					this.particles :
					this.particles = get_array( this.origin.split('.'), 'empty_text' )
			},
			get selector(){ return this.parts.join('.') },
			get target(){ return this.parts[ this.count-1 ] },
			value(data){
				if(is_data(data)) {
					try {
						return this.parts.reduce((o, i) => o[i], data)
					} catch (e) {
						return null
					}
				}
				return null
			},
			toString(){ return this.origin },
			valueOf(){ return this.parts.join('.') }
		}
	}
	
	function get_numeral(x){
		let value
		let type = typeof x
		if(is_string(x)) value = parseFloat(x)
		else if(is_number(x)) value = x
		else value = NaN
		let unit = get_difference(x,value)
		return {
			unit,
			type,
			get valuable(){return is_number(this.value)},
			value,
			toString(){
				return JSON.stringify(this)
			},
			valueOf(){
				return `${this.value}${this.unit || ''}`
			}
		}
	}
	
	
	function is_array(value){ return is_object(value) && Array.isArray(value) }
	function is_bool(value){return is_TF(value)}
	function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
	function is_element(value,type){ return is_instance( value, type || HTMLElement) } //for the site side of code
	function is_element_data(value){ return is_object(value) || is_json(value) }
	function is_error(value){ return is_object(value) && value instanceof Error }
	function is_function(value){ return typeof value === 'function' }
	function is_instance(value,type){ return is_object(value) && is_function(type) && value instanceof type }
	function is_json(value){ return is_text(value) && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) }
	function is_map(value){ return is_object(value) && value instanceof Map }
	function is_nothing(value){ return typeof value === 'undefined' || value === null || (typeof value === 'number' && isNaN(value)) }
	function is_number(value){ return typeof value === 'number' && !isNaN(value) && isFinite(value) }
	function is_numeric(value){ return get_numeral(value).valuable }
	function is_object(value){ return typeof value === 'object' && value !== null }
	function is_set(value){ return is_object(value) && value instanceof Set }
	function is_string(value){ return is_text(value)}
	function is_symbol(value){ return typeof value === 'symbol'}
	function is_text(value){ return typeof value === 'string' || (is_object(value) && value instanceof String)}
	function is_TF(value){return typeof value === 'boolean'}
	
	
	function module_exports(folder_path){
		return new Proxy({
			get folder(){ return fxy.folder(this.path) },
			path:folder_path,
			save(name,value){
				//console.log({path:this.path,name,value,FROM:'save'})
				return fxy.save(this.path,name,value)
			},
		},{
			get(o,n){
				if(n in o) return o[n]
				return null
			},
			set(o,path,value){
				if(typeof path === 'symbol') return false
				//console.log({path,value,FROM:'trap.set'})
				return o.save(path,value)
			}
		})
	}
	
	function tag_closure_value(key,data){
		let dot = get_dot_notation(key)
		var x = dot.value(data)
		if(!x){
			let container_dot = get_dot_notation(dot.container)
			if(container_dot){
				let container_value = container_dot.value(data)
				if(is_array(container_value)){
					let container_list = container_value.map(item=>{ return item[dot.target] })
					x = container_list.join('')
				}
			}
		}
		return x
	}
	function tag_closure(strings, ...keys) {
		return (function(...values) {
			var dict = values[values.length - 1] || {}
			var result = [strings[0]]
			keys.forEach(function(key, i) {
				var value = Number.isInteger(key) ? values[key] : tag_closure_value(key,dict)
				result.push(value, strings[i + 1])
			});
			return result.join('')
		});
	}
	
	window.fxy = fxy
	
	
	
	
	return new WorldWideInternet()

})(window)

window.wwi = wwi
