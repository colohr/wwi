(function(get_fxy,window){ return get_fxy(window) })
(function(window){
	return (function export_fxy(){
		const alphabet = 'abcdefghijklmnopqrstuvwxyz'
		const email_regular_expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		const externals = new Map()
		const modules = Symbol('fxy modules')
		const numbers = '0123456789'
		
		class Fxy extends Map{
			constructor(){
				super()
				this[modules] = new Map()
				this.aria = new Proxy(aria,{
					get(o,name){
						switch(name){
							case 'at': return aria_attributes
							case 'element': return aria_element
							case 'name': return aria_name
							case 'set': return aria_attributes
							case 'value': return aria_value
						}
						return null
					},
					has(o,name){ return name in o }
				})
			}
			get Authority(){ return get_authority() }
			get all(){ return all_promises }
			get characters(){
				return new Proxy({},{
					get(o,name){
						switch(name){
							case 'alphabet':
							case 'abc': return alphabet
							case 'ABC': return alphabet.toUpperCase()
							case 'numbers': return numbers
						}
						return null
					}
				})
			}
			get define(){ return define_element }
			get deep(){ return get_deep_value }
			get deeper(){ return get_deeper_value }
			get doc(){ return load_doc() }
			get dot(){ return get_dot_notation }
			exports(folder,action){
				if(!is_text(folder)) return module_exports_proxy()
				if(!is_function(action)) return module_exports(folder)
				return action(module_exports(folder),this)
			}
			get external(){ return get_external() }
			get is(){
				return {
					array:is_array,
					get bool(){ return this.TF },
					count:is_count,
					data:is_data,
					defined:is_defined,
					element:is_element,
					element_data:is_element_data,
					email:is_email,
					empty:is_empty,
					error:is_error,
					function:is_function,
					instance:is_instance,
					json:is_json,
					map:is_map,
					module:is_module,
					nothing:is_nothing,
					number:is_number,
					numeric:is_numeric,
					object:is_object,
					set:is_set,
					get string(){ return this.text },
					symbol:is_symbol,
					text:is_text,
					TF:is_TF
				}
			}
			get id(){
				const lodash = window._
				return {
					get camel(){ return this.code },
					get capital(){ return this.capitalize },
					capitalize(value){ return is_text(value) ? lodash.capitalize(value):'' },
					class(value){ return lodash.words(value).map(word=>this.capitalize(word)).join('') },
					code(value){ return is_text(value) ? lodash.camelCase(value):'' },
					dash(value){ return is_text(value) ? lodash.kebabCase(value):'' },
					dot_notation(value){ return this.words(value).join('.') },
					get dots(){ return this.dot_notation },
					get kebab(){return this.dash},
					get medial(){ return this.code },
					path(value){ return this.words(value).join('/') },
					proper(value){ return this.words(value).map(word=>this.capitalize(word)).join(' ') },
					readable(value){ return this.words(value).join(' ') },
					get snake(){return this.underscore},
					underscore(value){ return is_text(value) ? lodash.snakeCase(value):'' },
					words(value){ return is_text(value) ? lodash.words(value):[] },
					get _(){ return this.underscore }
				}
			}
			get in(){ return this.inputs }
			get inputs(){ return get_inputs }
			get load(){ return load_files }
			get modules(){ return get_modules() }
			get not(){ return get_not() }
			get numeral(){return get_numeral }
			get random(){ return get_random() }
			get require(){ return fxy_require }
			get service_worker(){ return get_service_worker }
			get tag(){ return tag_closure }
			get timeline(){ return timeline }
			get uid(){ return get_uid }
			get when(){ return when_element_is_defined }
			get wrap(){ return get_wrap() }
		}
		
		//exports
		let fxy = new Fxy()
		return window.fxy = fxy
		
		//shared actions
		function all_promises(...promises){
			let results = []
			return new Promise(success=> {
				return load(()=>{
					let errors = results.filter(result=>result instanceof Error)
					if(errors.length) errors.map(e=>console.error(e))
					return success(results)
				})
			})
			//shared actions
			function load(done) {
				for (let promise of promises) {
					if(promise instanceof Promise){
						return promise.then(result=>{
							promises.splice(0,1)
							results.push(result)
							return load(done)
						}).catch(result=>{
							promises.splice(0,1)
							results.push(result)
							return load(done)
						})
					}
					else {
						promises.splice(0,1)
						return load(done)
					}
				}
				return done()
			}
		}
		function aria(...elements){
			let items = elements.map(element=>aria_element(element))
			return new Proxy(items,{
				set(o,name,value){
					o.forEach(element=>element[name]=value)
					return true
				},
				get(o,name){ return o.filter(element=>name in element) },
				has(o,name){ return o.includes(name) }
			})
		}
		function aria_attributes(element,...x){
			let value = aria_value(...x)
			for(let name in value) element.setAttribute(name,value[name])
			return element
		}
		function aria_element(element){
			return new Proxy(element,{
				deleteProperty(o,name){
					name = aria_name(name)
					if(name) o.setAttribute(name,false)
					return true
				},
				get(o,name){
					name = aria_name(name)
					if(name && o.hasAttribute(name)) return o.getAttribute(name) === 'true'
					return null
				},
				has(o,name){
					name = aria_name(name)
					if(name) return o.getAttribute(name) === 'true'
					return false
				},
				set(o,name,value){
					aria_attributes(o,name,value)
					return true
				}
			})
		}
		function aria_name(name){
			if(is_text(name)){
				if(name === 'role' || name === 'tabindex') return name
				if(name.indexOf('aria') !== 0) name = `aria-${name}`
				if(name.indexOf('-') <= -1) name = fxy.id.dash(name)
				return name
			}
			return null
		}
		function aria_value(...x){
			let values = {}
			if(is_data(x[0])) values = x[0]
			else values[x[0]] = x[1]
			let output = {}
			for(let i in values){
				let name = aria_name(i)
				let value = values[i]
				if(!is_bool(value)) value = value === 'true'
				if(name) output[name] = value
			}
			return output
		}
		
		function define_element(tag_name,custom_element,extension){ return define_element_action( tag_name, define_element_class( tag_name, custom_element, extension ) ) }
		function define_element_ability(tag_name){
			if('customElements' in window) return window.customElements
			return new Error(`Custom Elements is not supported in this browser so wwi cannot define ${tag_name || ''}.`)
		}
		function define_element_action(tag_name,defined){
			return {
				tag_name,
				error:defined instanceof Error,
				get then(){ return define_element_then(this.tag_name) }
			}
		}
		function define_element_then(tag_name){return function define_then(callback){
			return define_element_when(tag_name).then(callback)
		}}
		function define_element_class(tag_name,custom_element,extension){
			const custom_elements = define_element_ability(tag_name)
			if(custom_elements instanceof Error) return custom_elements
			return define_element_set(custom_elements,tag_name,custom_element,extension)
		}
		function define_element_has(custom_elements,tag_name){
			let defined_element = custom_elements.get(tag_name)
			if( is_nothing(defined_element) ) return false
			return defined_element
		}
		function define_element_set(custom_elements,tag_name,custom_element,extension){
			let defined_element = define_element_has(custom_elements,tag_name)
			if(!defined_element) {
				custom_elements.define(tag_name,custom_element,extension)
				return custom_element
			}
			return defined_element
		}
		function define_element_when(tag_name,custom_element){
			return new Promise((success,error)=>{
				const defined = define_element_class(tag_name,custom_element)
				if(defined instanceof Error) return error(defined)
				return window.customElements.whenDefined(tag_name).then(()=>{ return success(defined) }).catch(error)
			})
		}
		
		function fxy_folder(path){
			return fxy.has(path) ? fxy.get(path):fxy.set(path,new Map()).get(path)
		}
		function fxy_module(paths){
			let folder
			if(!is_data(paths)) return null
			else if('path' in paths && 'name' in paths){
				folder = fxy.has(paths.path) ? fxy_folder(paths.path) : null
				return is_map(folder) && folder.has(paths.name) ? folder.get(paths.name) : null
			}
			return null
		}
		function fxy_paths(pathname){
			return fxy[modules].get(pathname)
		}
		function fxy_join(...paths){
			return paths.map(path=>{
				if(typeof path !== 'string') return null
				path = path.trim()
				if(path.length <= 0) return null
				return path
			}).filter(path=>path !== null).join('/')
		}
		function fxy_require(...paths){
			let pathname = fxy_join(...paths)
			return fxy_module(fxy_paths(pathname))
		}
		function fxy_save(path,name,value){
			let pathname = fxy_join(path,name)
			fxy[modules].set(pathname,{path,name})
			return fxy_folder(path).set(name,value).get(name)
		}
		
		function get_authority(){
			const prefix = 'authority-'
			return new Proxy(function authority_mixin(Base){
				if(is_nothing(Base)) Base = Map
				if(!('prototype' in Base) || !Base.prototype[Symbol.toStringTag]) throw new Error('Authority Mixin must mix into a Map class')
				return class extends Base{
					authority_token(){
						let inputs = this.get_token_input()
						if(!is_array(inputs)) inputs = [inputs]
						return this.get_token(...inputs)
						           .then(token=>this.set('token',token))
						           .catch(console.error)
					}
					authority_headers(){
						let headers = {}
						if(!this.has('token')) return headers
						headers.Authorization=`Basic: ${this.get('token')}`
						return headers
					}
				}
			},{
				get(o,name){
					switch(name){
						case 'options': return authority_options
						case 'prefix': return prefix
						default: if(name in o) return o[name]
					}
					return null
				}
			})
			
			//shared actions
			function authority_options(data){
				let map = null
				if(is_map(data)) map = Array.from(data)
				else if(is_array(data)) map = data
				else if(is_data(data)) map = Object.keys(data).map(name=>[name,data[name]])
				else map = []
				return map.map(item=>{
					let name = item[0]
					if(name.includes(prefix)) name = name.replace(prefix,'')
					return [name,item[1]]
				})
			}
		}
		function get_deep_value(object, query){
			try{return window._.get(object, query)}
			catch(e){return null}
		}
		function get_deeper_value(object, selector){
			try{return selector.split('.').reduce((o, i) => o[i], object)}
			catch(e){return null}
		}
		function get_difference(original,value){
			if(is_text(original)){
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
				get parts(){ return 'particles' in this ? this.particles : this.particles = this.origin.split('.').filter(filter_empty_text).map(map_empty_text) },
				get selector(){ return this.parts.join('.') },
				get target(){ return this.parts[ this.count-1 ] },
				value(data){
					if(!is_data(data)) null
					try { return this.parts.reduce((o, i) => o[i], data) }
					catch (e) { return null }
				},
				toString(){ return this.origin },
				valueOf(){ return this.parts.join('.') }
			}
			//shared actions
			function filter_empty_text(text){ return is_text(text) }
			function map_empty_text(text){ return is_text(text) ? text.trim():null}
		}
		function get_external(){ return new Proxy({},{ get(o,name){ return get_external_module_loader(name) } }) }
		function get_external_module_loader(folder){
			return function module_loader( module_value, name_value, target_value){
				let options = is_data(module_value) ? module_value:{ module:module_value , name:name_value , target:target_value }
				let module = options.module
				let name = options.name
				let target = options.target || null
				let path = `${folder}/${module}/${name}`
				let loading_module = is_loading(path)
				let promise = new Promise(function(success,error) {
					if (!is_text(folder) || !is_text(module) || !is_text(name)) return error(new Error(`Invalid module path: ${path}`))
					fxy.on((module_exports)=>{
						//console.log({module_exports,target,folder,module,name})
						if(module_exports instanceof Error) return error(module_exports)
						return success(module_exports)
					},is_text(target) === false ? `fxy.modules.${module}.${name}`:`fxy.modules.${module}.${name}.${target}`)
				})
				
				let has_module = has_external(module,name,target)
				if(has_module || loading_module) return promise
				externals.set(path,true)
				load_module(folder, module, name, 'path' in options ? options.path:null).then(result => set_module(path,module,name,result)).catch(e=>set_module(path,module,name,e))
				return promise
			}
			//shared actions
			function has_external(module,name,target){
				let fxy_module_value = fxy.require(`${module}/${name}`)
				if(is_nothing(fxy_module_value)) return false
				else if(target && !(target in fxy_module_value)) return false
				return true
			}
			function is_loading(path){ return externals.has(path) }
			function is_module_exports(module_result){
				if(is_function(module_result)){
					let name = module_result.name
					switch(name){
						case 'external_module':
						case 'module_exports':
						case 'external':
						case 'module':
						case 'exports':
							return true
					}
					if(name.includes('export')) return true
				}
				return false
			}
			function load_module(folder,module,name,path){
				let module_url = null
				if(path !== null) module_url = path.includes('http') ? path+'/'+name+'.es6':window.url(path,`${name}.es6`)
				else {
					if(folder === 'component' && module === 'behavior' && 'external_files' in fxy && name in fxy.external_files) module_url = fxy.external_files[name].url
					else module_url = window.url[folder](module,`${name}.es6`)
				}
				console.log('Loading external: ',module_url)
				return window.fetch(module_url)
				             .then(response=>response.text())
				             .then(module_text=>eval(module_text))
			}
			function set_module(path,module,name,module_result){
				if(module_result instanceof Error) console.error(module_result)
				return fxy.exports(module,(module_block,fxy)=>{
					let exports
					if(is_module_exports(module_result)) exports = module_result(module_block,fxy)
					else exports = module_result
					if(fxy.is.nothing(exports) === false) module_block[name] = exports
					externals.delete(path)
				})
			}
		}
		function get_inputs(value){
			let array = []
			if(is_text(value)){
				value = value.replace(/ /g,',').replace(/\+/g,',').replace(/\&/g,',').replace(/\|/g,',')
				array = value.split(',').map(item=>item.trim()).filter(item=>item.length>0)
			}
			else if(is_array(value)) array = value
			return array
		}
		function get_modules(){
			return new Proxy({modules:fxy.keys()},{
				get(o,name){
					if(fxy.has(name)){
						return new Proxy({module:fxy.get(name)},{
							get(o,name){
								if(o.module.has(name)) return o.module.get(name)
								return null
							},
							has(o,name){ return o.module.has(name) }
						})
					}
					return null
				},
				has(o,name){ return fxy.has(name) }
			})
		}
		function get_not(...names){
			return new Proxy((target)=>{
				return fxy.is.nothing(get_deeper_value(target,names.join('.')))
			},{get(o,name){
				names.push(name)
				return get_not(...names)
			}})
		}
		function get_numeral(x){
			let value
			let type = typeof x
			if(is_text(x)) value = parseFloat(x)
			else if(is_number(x)) value = x
			else value = NaN
			let unit = get_difference(x,value)
			return {
				unit,
				type,
				get valuable(){return is_number(this.value)},
				value,
				toString(){ return this.valueOf() },
				valueOf(){ return `${this.value}${this.unit || ''}` }
			}
		}
		function get_random(){
			//return value
			return new Proxy(get_random_number,{
				get(o, name){
					let value = null
					if(name === 'decimal') value = get_random_decimal
					else if(name === 'item') value = get_random_item
					if(name in o) value = o[name]
					return value
				}
			})
			//shared actions
			function get_random_decimal(from,to){return Math.random() * (to - from) + from}
			function get_random_number(from,to){
				if(is_nothing(from) && is_nothing(to)) return Math.random()
				return  Math.floor(Math.random() * (to - from + 1)) + from
			}
			function get_random_item(array,...items){
				let list = []
				if(is_array(array)) list = array
				else{
					list.push(array)
					list = list.concat(items)
				}
				return list.length ? list[get_random_number(0,list.length-1)]:-1
			}
		}
		function get_service_worker(){
			if(!('serviceWorker' in window.navigator)) return null
			let kit = 'kit' in window ? window.kit:null
			if(kit && kit.has('service-worker')) return  window.navigator.serviceWorker.register(kit.get('service-worker'))
			return null
		}
		function get_uid(count = 5){
			let abc = alphabet+alphabet.toUpperCase()
			let id = abc.charAt(Math.floor(Math.random() * abc.length))
			let all = numbers+abc
			for (let i = 0; i < count-1; i++) id += all.charAt(Math.floor(Math.random() * all.length))
			return id
		}
		function get_wrap(options){
			return new Proxy(wrap_array,{
				get(o,name){
					if(is_data(options)){
						switch(name){
							case 'html':
							case 'text':
								return 'wrapped' in options ? options.wrapped:options.list.join('')
							case 'attributes':
								return x=>{
									options.elements = wrap_attributes(options,x)
									options.wrapped = options.elements.map(item=>item.outerHTML).join('')
									return get_wrap(options)
								}
							case 'elements':
								if('elements' in options) return options.elements
								return wrap_elements(options)
						}
						return get_wrap(options)
					}
					
					if(!is_data(options)) options = {tag:name}
					return (...x)=>wrap_array(options,...x)
				}
			})
			
			function wrap_array(data,...x){
				data.list = x.map(item=>`<${options.tag}>${item}</${options.tag}>`)
				return get_wrap(data)
			}
			function wrap_element(...x){
				let div = document.createElement('div')
				div.innerHTML = x.join('')
				return div
			}
			function wrap_attributes(data,attributes){
				let all = null
				if('all' in data) all = data.all
				else all = wrap_elements(data)
				return all.map(element=>{
					for(let name in attributes) element.setAttribute(name,attributes[name])
					return element
				})
			}
			function wrap_elements(data,attributes){
				let wrap = wrap_element(...data.list)
				let all = Array.from(wrap.querySelectorAll(data.tag))
				if(is_data(attributes)) {
					data.all = all
					return wrap_attributes(data,attributes)
				}
				return all
			}
		}
		
		function is_array(value){ return is_object(value) && Array.isArray(value) }
		function is_count(value,count = 1){
			if(is_nothing(value)) return false
			if(is_text(value)) value = value.trim()
			if(is_text(value) || is_array(value)) return value.length >= count
			if(is_map(value) || is_set(value)) return value.size >= count
			if(is_object(value)) return Object.keys(value).length >= count
			return false
		}
		function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
		function is_defined(value){ return 'customElements' in window && !is_nothing(window.customElements.get(value)) }
		function is_element(value,type){ return is_instance( value, type || HTMLElement) }
		function is_element_data(value){ return is_object(value) || is_json(value) }
		function is_email(value){ return is_text(value) && email_regular_expression.test(value) }
		function is_empty(value){ return !is_count(value) }
		function is_error(value){ return is_object(value) && value instanceof Error }
		function is_function(value){ return typeof value === 'function' }
		function is_instance(value,type){ return is_object(value) && is_function(type) && value instanceof type }
		function is_json(value){ return is_text(value) && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) }
		function is_map(value){ return is_object(value) && value instanceof Map }
		function is_module(value){ return !is_nothing(fxy.require(value)) }
		function is_nothing(value){ return typeof value === 'undefined' || value === null || (typeof value === 'number' && isNaN(value)) }
		function is_number(value){ return typeof value === 'number' && !isNaN(value) && isFinite(value) }
		function is_numeric(value){ return get_numeral(value).valuable }
		function is_object(value){ return typeof value === 'object' && value !== null }
		function is_set(value){ return is_object(value) && value instanceof Set }
		function is_symbol(value){ return typeof value === 'symbol'}
		function is_text(value){ return typeof value === 'string' || (is_object(value) && value instanceof String)}
		function is_TF(value){return typeof value === 'boolean'}
		
		function load_doc(){
			let func = {name:'doc'}
			return new Proxy((file,...options)=>load_func(func,{file,type:'fetch',options}),{ get(o,type){ return (file,...options)=>load_func(func,{file,type,options}) } })
		}
		function load_func(func,item){
			let id = Symbol.for(func.name)
			if(id in Fxy) return Fxy[id](item)
			return fxy.port.eval(window.url.modules('fxy',`funcs/${func.name}.es6`)).then(x=>Fxy[id]=x).then(x=>x(item))
		}
		function load_files(...files){
			let promise = get_promise()
			return new Proxy(promise,{
				get(o,name){
					let value = null
					switch(name){
						case 'wait':
							return (...wait)=>fxy.when(...wait).then(_=>o.then())
							break
						default:
							if(name in o) {
								value = o[name]
								if(typeof value === 'function') value = o[name].bind(o)
							}
							break
					}
					return value
				}
			})
			//shared actions
			function get_promise() {
				let items = files.map(item=>item.includes('http')?item:window.url(item))
				let count = items.length
				let loaded = 0
				return get_files()
				//shared actions
				function get_files(){
					let results = []
					return new Promise(success=>{
						function get_file_items(){
							for(let i = loaded; i < count; i++){
								return get_file_load(items[i]).then(result=>{
									//console.log(result)
									results[i] = result
									loaded++
									return get_file_items()
								}).catch(e=>{
									console.error(e)
									results[i] = e
									loaded++
									return get_file_items()
								})
							}
							return success(results)
						}
						return get_file_items()
					})
				}
				
				function get_file_load(item) {
					let type = fxy.file.type(item).replace('.','')
					switch(type){
						case 'js':
						case 'es6':
							return fxy.port.eval(item)
						case 'json':
							return window.fetch(item).then(x=>x.json())
						default:
							return fxy.port(item)
					}
				}
			}
		}
		
		function module_exports(module_folder_path){
			const folder_path = module_folder_path
			return new Proxy({},{
				get(o,name){
					let value = fxy.has(folder_path) ? fxy.get(folder_path).get(name):null
					if(name in o) return o[name]
					return value
				},
				set(o,path,value){
					if(typeof path === 'symbol') return false
					return fxy_save(folder_path,path,value)
				},
				has(o,name){
					return fxy.has(folder_path) && fxy.get(folder_path).has(name)
				}
			})
		}
		function module_exports_proxy(){
			return new Proxy(module_exports,{
				get(o,name){
					if(!is_text(name)){
						if(name in o) return o[name]
					}
					return o(name)
				}
			})
		}
		
		function tag_closure_value(key,data){
			let dot = get_dot_notation(key)
			let x = dot.value(data)
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
				let dict = values[values.length - 1] || {}
				let result = [strings[0]]
				keys.forEach(function(key, i) {
					var value = Number.isInteger(key) ? values[key] : tag_closure_value(key,dict)
					result.push(value, strings[i + 1])
				});
				return result.join('')
			});
		}
		function timeline(...x){
			let action = x.filter(input=>is_function(input))[0]
			let time = x.filter(input=>is_number(input))[0]
			if(!is_number(time)) time = 1
			let promise = new Promise(function(success){
				window.requestAnimationFrame(on_animation_frame)
				//shared actions
				function on_animation_frame(){ return window.setTimeout(on_timeout,time) }
				function on_timeout(){ return success(is_function(action) ? action():null) }
			})
			//return value
			return promise.then(x=>x)
		}
		
		function when_element_is_defined(...names){
			let whens = names.map(name=>window.customElements.whenDefined(name))
			return all_promises(...whens)
		}
		
	})()
},window)