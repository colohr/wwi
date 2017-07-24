const fxy = ((window)=>{
	
	const added_symbols = Symbol.for('user added symbols')
	const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const broadcaster = Symbol('fxy broadcaster')
	const element_selector_data = Symbol('fxy element selector data')
	const email_regular_expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	const modules = Symbol('fxy modules')
	const numbers = '0123456789'
	
	const Externals = new Map()
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
		disable:Symbol('disabled state'),
		dont_mix:Symbol('function is not a mixin'),
		enable:Symbol('enabled state'),
		'false':Symbol('false value'),
		nil:Symbol('nil value or null'),
		routes:Symbol.for('element routes'),
		'true':Symbol('true value'),
		uid:Symbol('uid value'),
		Listener: Symbol(' element listener '),
		Callbacks: Symbol(' element callbacks '),
		Properties: Symbol(' element properties '),
		Canvas: Symbol(' element canvas '),
		AttributeData: Symbol(' element attributes '),
		
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
					if (has) {
						let css = client ? this.clientType(client, T) : T.css;
						Object.assign(element.style, css);
					}
				});
				return element;
			}
		}
	}
	const Watchers = new Map()
	const Cache = new Map()
	
	class Broadcast extends Map{
		
		constructor(){
			super()
			window.Define = (callback, requires) => {
				if(!is_array(requires)) requires = [requires]
				return this.create({ callback, is_define:true, requires });
			}
			window.on = on_broad(this)
		}
		
		check(block) {
			let count = block.requires.length
			if (count === 0) return { loaded: true }
			let mods = this.require( block.requires ).filter( filter_nothingness )
			if (mods.length < count) return { waiting: true }
			return { loaded: true, mods }
		}
		
		create( block ) {
			
			let status = this.check( block )
			if ( status.loaded ) return this.fire( block , block.mods )
			else block.watcherId = 'watcher-' + Watchers.size
			if ( !this.has('definites') ) this.set( 'definites', new Set() )
			this.get('definites').add( block )
			if ( block.watcherId ) this.set_watcher( block.watcherId )
			return true
			
		}
		
		fire( block , mods ) {
			let has_mods = Array.isArray(mods) ? true:false
			mods = has_mods ? mods : this.require( block.requires )
			if( block.is_define ) mods.unshift( window.app )
			if('wwi' in window) mods.push( window.wwi )
			return block.callback(...mods)
		}
		
		get_watcher(key) {
			if (!this.has('definites')) return undefined
			let defs = this.get('definites')
			for(let def of defs){
				if( def.watcherId === key ) return def
			}
			return undefined
		}
		
		is_required(name){ return 'app' in window && this.requirements.includes(name) && !(name in window) }
		
		ready( key, value ) {
			if ( typeof value !== 'undefined' &&
				value !== null &&
				!(key in window) ) {
				window[key] = value
			}
			Cache.get('ready').add(key)
			this.recheck()
			return window[key]
		}
		
		recheck() {
			if ( this.has('definites') && App.complete ) {
				let defs = this.get('definites')
				for (let def of defs) {
					if ( waiting_dependents( def.requires ) ) {
						console.log(def.requires)
					}
					else this.check( def )
				}
				if ( defs.size === 0 ) this.delete('definites')
			}
		}
		
		//check to see if stuff in cache & window has been set
		require(list) {
			let targets = []
			if (is_array(list)) {
				for(let name of list){
					if(this.is_required(name)) this.ready( name, window.app[name] )
					targets.push(name)
				}
			}
			else return []
			return targets.map( name => {
				if(typeof name !== 'string') return null
				else if ( name.includes('app.')  ) return get_deep_value( {app:window.app}, name )
				else if ( name in window ) return window[name]
				else if ( name in document ) return document[name]
				else return get_deeper_value( window, name )
				return null
			})
		}
		
		get requirements(){ return get_app_requirements() }
		
		set_watcher(key){ return set_watcher(this,key) }
		//set_watcher(key) {
		//
		//	let watcher = { key, count: 0 }
		//	const caster = this
		//
		//	watcher.clear = function () {
		//		if (typeof this.timer === 'number') {
		//			window.clearInterval(this.timer);
		//			delete this.timer;
		//		}
		//		return Watchers.delete( this.key )
		//	}
		//
		//	watcher.func = function () {
		//		if ( this.count >= 5000 ) {
		//			console.group('WATCHER TIMEOUT: '+this.key)
		//			console.error(new Error('watcher timeout for : ' + this.key));
		//			console.warn(this);
		//			console.warn( caster.get_watcher(this.key) )
		//			console.groupEnd()
		//			return this.clear();
		//		}
		//		let block = caster.get_watcher( this.key )
		//		if (!block) return this.clear()
		//		let status = caster.check( block )
		//		if ( status.waiting ) return this.count++;
		//		this.clear()
		//		caster.get('definites').delete(block)
		//		return caster.fire( block , status.mods )
		//	}
		//
		//	watcher.start = function () {
		//		this.timer = window.setInterval( this.func.bind(this), 300 )
		//		return this
		//	}
		//
		//	return Watchers.set( key, watcher.start() );
		//}
		
		
	}
	
	class ID extends String{
		static generate(count = 5) {
			let id = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
			let all = numbers+alphabet
			for (let i = 0; i < count-1; i++) {
				id += all.charAt(Math.floor(Math.random() * all.length))
			}
			return id
		}
		static generate_uid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				           .toString(16)
				           .substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}
		static get_uid(object){
			if(!is_object(object)) return null
			if(is_object(object) && Symbols.uid in object) return object[Symbols.uid]
			let prefix
			let index
			if('uid_prefix' in object) prefix = object.uid_prefix
			else if('uid-prefix' in object) prefix = object['uid-prefix']
			else if(is_element(object) && object.hasAttribute('uid-prefix')) prefix = object.getAttribute('uid-prefix')
			if('uid_index' in object) index = object.uid_index
			else if('uid-index' in object) index = object['uid-index']
			else if(is_element(object) && object.hasAttribute('uid-index')) index = object.getAttribute('uid-index')
			return object[Symbols.uid] = new ID(prefix,index).attribute(object)
		}
		static get Mix(){
			return Base => class extends Base{
				get fxy_uid(){ return ID.get_uid(this) }
				get uid(){ return ID.get_uid(this).valueOf() }
				set uid(value){
					if(value instanceof ID) this[Symbols.uid] = value.attribute(this)
					else if(is_numeric(value)) this[Symbols.uid] = new ID(null,value).attribute(this)
					else if(fxy.is.text(value)) this[Symbols.uid] = new ID(value).attribute(this)
					return this[Symbols.uid]
				}
			}
		}
		constructor(prefix,index){
			let id = ID.generate()
			super(id)
			prefix = is_text(prefix) ? prefix:null
			index = is_numeric(index) ? get_numeral(index).value:null
			this.context = {
				id,
				index,
				prefix
			}
		}
		attribute(element){
			if(is_element(element)){
				let prefix = this.prefix
				let index = this.index
				if(prefix) element.setAttribute('uid-prefix',prefix)
				else element.removeAttribute('uid-prefix')
				if(index) element.setAttribute('uid-index',index)
				else element.removeAttribute('uid-index')
				element.setAttribute('uid',this.valueOf())
			}
			return this
		}
		get id(){ return this.context.id }
		get index(){ return this.context.index !== null ? this.context.index:''}
		set index(value){
			value = is_numeric(value) ? get_numeral(value).value:null
			if(value) return this.context.index = value
			return this.context.index
		}
		get prefix(){ return this.context.prefix !== null ? this.context.prefix+'':'' }
		set prefix(value){
			value = is_text(value) ? value:null
			if(value) return this.context.prefix = value
			return this.context.prefix
		}
		get values(){
			let index = this.index
			let prefix = this.prefix
			let values = []
			if(prefix) values.push(prefix)
			values.push(this.context.id)
			if(index) values.push(index)
			return values
		}
		valueOf(){ return this.values.join('-') }
		toString(){ return this.valueOf() }
	}
	
	class Fxy extends Map{
		static get element_selector_data(){
			if(element_selector_data in this) return [element_selector_data]
			return this[element_selector_data] = { skips:new Set(['style', 'class', 'id', 'tabindex' ]), }
		}
		constructor(){
			super()
			this[modules] = new Map()
			this[broadcaster] = new Broadcast()
		}
		get all(){ return all_promises }
		get define(){ return define_element }
		get deep(){ return get_deep_value }
		get deeper(){ return get_deeper_value }
		get dot(){ return get_dot_notation }
		exports(folder,action){
			if(!is_string(folder)){
				return module_exports_proxy()
			}
			if(!is_function(action)){
				return module_exports(folder)
			}
			return action(module_exports(folder),this)
		}
		get external(){ return get_external() }
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
				count:is_count,
				data:is_data,
				element:is_element,
				element_data:is_element_data,
				email:is_email,
				empty:is_empty,
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
		get in(){ return get_in }
		module(paths){
			let folder
			if(!is_data(paths)) return null
			else if('path' in paths && 'name' in paths){
				folder = this.has(paths.path) ? this.folder(paths.path) : null
				return is_map(folder) && folder.has(paths.name) ? folder.get(paths.name) : null
			}
			return null
		}
		get modules(){ return get_modules() }
		get numeral(){return get_numeral }
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
		get selector(){
			return new Proxy(get_element_selector,{
				get(o,name){
					switch(name){
						case 'classes':
							return get_element_selector_classes
						case 'attributes':
							return get_element_selector_attributes
						case 'skips':
							return Fxy.element_selector_data.skips
					}
					return null
				}
			})
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
		get uid(){ return get_uid() }
		get when(){ return when_element_is_defined }
	}
	
	
	
	
	//exports
	return window.fxy = new Fxy()

	//----------shared actions-----------
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
		function get_result(promise){
			promises.splice(0,1)
			if(promise instanceof Promise) return promise
			return new Promise((success)=>{ return success(promise) })
		}
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
	
	function filter_nothingness(v){ return v !== null && v !== undefined }
	function filter_cached(name){ return Cache.get('ready').has(name) }
	
	function get_app_requirements(){
		return []
	}
	
	function get_array( array, map ){
		if(is_array(array)) {
			if(is_function(map)) array = array.map(map)
			else if(is_text(map) && map in get_array) array = array.map(get_array[map].map).filter(get_array[map].filter)
		}
		return array || []
	}
	get_array.empty_text = {
		filter:function filter_empty_text(text){ return is_text(text) },
		map:function map_empty_text(text){ return is_text(text) ? text.trim():null}
	}
	
	
	function get_deep_value(object, query){
		try {
			return window._.get(object, query)
		} catch (e) {
			return null
		}
	}
	function get_deeper_value(object, selector){
		try {
			return selector.split('.').reduce((o, i) => o[i], object)
		} catch (e) {
			return null
		}
	}
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
			get parts(){ return 'particles' in this ? this.particles : this.particles = get_array( this.origin.split('.'), 'empty_text' ) },
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
		if(element.hasAttributes()){
			let list = []
			let a = element.attributes
			let count = a.length
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
		if(!Fxy.element_selector_data.skips.has(name)) return false
		return name.indexOf('data-') !== 0
	}
	
	function get_external(){ return new Proxy({},{ get(o,name){ return get_external_module_loader(name) } }) }
	function get_external_module_loader(folder){
		return function module_loader(module,name){
			
			let path = `${folder}/${module}/${name}`
			let loading_module = is_loading(path)
			let promise = new Promise(function(success,error) {
				if (!is_text(folder) || !is_text(module) || !is_text(name)) return error(new Error(`Invalid module path: ${path}`))
				Define((app,module_exports)=>{
					if(module_exports instanceof Error) return error(module_exports)
					//console.log({module_exports,name})
					return success(module_exports)
				},`wwi.modules.${module}.${name}`)
				
			})
			
			let has_module = !fxy.is.nothing(fxy.require(`${module}/${name}`))
			if(has_module || loading_module) return promise
			Externals.set(path,true)
			load_module(folder, module, name).then(result => set_module(path,module,name,result)).catch(e=>set_module(path,module,name,e))
			return promise
			
		}
		//shared actions
		function set_module(path,module,name,module_result){
			if(module_result instanceof Error) console.error(module_result)
			return fxy.exports(module,(module_block,fxy)=>{
				let exports
				if(is_function(module_result) && module_result.name === 'external_module') exports = module_result(module_block,fxy)
				else exports = module_result
				//console.log({name,exports})
				if(fxy.is.nothing(exports) === false) module_block[name] = exports
				
				Externals.delete(path)
			})
			
		}
		function load_module(folder,module,name){
			let module_url = window.url[folder](module,`${name}.es6`)
			console.log('loading module from: ',module_url)
			return window.fetch(module_url)
			             .then(response=>response.text())
			             .then(module_text=>eval(module_text))
		}
		function is_loading(path){ return Externals.has(path) }
	}
	
	function get_in(value){
		let array = []
		if(is_text(value)){
			value = value.replace(/ /g,',')
			             .replace(/\+/g,',')
			             .replace(/\&/g,',')
			             .replace(/\|/g,',')
			array = value.split(',')
			             .map(item=>item.trim())
			             .filter(item=>item.length>0)
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
			toString(){ return this.valueOf() },
			valueOf(){ return `${this.value}${this.unit || ''}` }
		}
	}
	
	function get_uid(){
		return new Proxy(ID,{
			get(o,name){
				if(name in o) return o[name]
				if(name === 'UID' || name === 'ID') return ID
				if(is_numeric(name)) return new ID(null,name)
				if(fxy.is.text(name)) return new ID(name)
				return null
			}
		})
	}
	
	function is_array(value){ return is_object(value) && Array.isArray(value) }
	function is_bool(value){return is_TF(value)}
	function is_count(value,count = 1){
		if(is_nothing(value)) return false
		if(is_text(value)) value = value.trim()
		if(is_text(value) || is_array(value)) return value.length >= count
		if(is_map(value) || is_set(value)) return value.size >= count
		if(is_object(value)) return Object.keys(value).length >= count
		return false
	}
	function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
	function is_element(value,type){ return is_instance( value, type || HTMLElement) } //for the site side of code
	function is_element_data(value){ return is_object(value) || is_json(value) }
	function is_email(value){ return is_text(value) && email_regular_expression.test(value) }
	function is_empty(value){ return !is_count(value) }
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
	
	function module_exports(module_folder_path){
		const folder_path = module_folder_path
		const folder = fxy.folder(folder_path)
	
		//fxy.save(this.path,name,value)
		return new Proxy({
			//get folder(){ return fxy.folder(this.path) },
			//path:folder_path,
			//save(name,value){ return fxy.save(this.path,name,value) },
		},{
			get(o,name){
				let value = fxy.has(folder_path) ? fxy.get(folder_path).get(name):null
				if(name in o) return o[name]
				return value
			},
			set(o,path,value){
				if(typeof path === 'symbol') return false
				return fxy.save(folder_path,path,value)
				//return o.save(path,value)
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
	
	function on_broad(caster){
		//let block = { callback:on_broad_callback, requires:waits }
		const uid = ID.generate()
		
		const proxy = new Proxy(broadband_waiter,{
			get(o,name){
				if(name === 'then'){
					return function then(callback){
						o.created = true
						//caster.create({callback, requires:waits})
						return Promise.resolve(new Promise(function(success,error){
							console.log('called resolve:',uid,o.waits)
							return this
						}))
					}
				}
				return o
			},
			set(o,name,value){
				console.log(name)
				if(is_text(name) && is_function(value)){
					let waits = name.replace(/ /g,',')
					                .replace(/\|/g,',')
					                .replace(/\+/g,',')
					                .replace(/\&/g,',')
					                .split(',').map(wait=>wait.trim()).filter(wait=>wait.length > 0)
					broadband_waiter(value,...waits)
				}
				return true
			}
		})
		
		return proxy
		
		function broadband_waiter(value,...waits){
			caster.create({callback:value, requires:waits})
			return proxy
		}
		//const Watchers = new Map()
		
		
		
		//return the broadcaster into the app object
		//return new Broadcaster()
		
		//--------------shared actions--------------
		//function filter_nothingness(v){ return v !== null && v !== undefined }
		//function filter_cached(name){ return Dependents.includes(name) && Cache.get('ready').has(name) }
		//function waiting_dependents(list){
		//	if (!list) return false
		//	return list.filter(filter_cached).length > 0
		//}
	}
	
	function set_watcher(caster,key){
		let watcher = { key, count: 0 }
		watcher.clear = function () {
			if (typeof this.timer === 'number') {
				window.clearInterval(this.timer);
				delete this.timer;
			}
			return Watchers.delete( this.key )
		}
		
		watcher.func = function () {
			if ( this.count >= 5000 ) {
				console.group('WATCHER TIMEOUT: '+this.key)
				console.error(new Error('watcher timeout for : ' + this.key));
				console.warn(this);
				console.warn( caster.get_watcher(this.key) )
				console.groupEnd()
				return this.clear();
			}
			let block = caster.get_watcher( this.key )
			if (!block) return this.clear()
			let status = caster.check( block )
			if ( status.waiting ) return this.count++;
			this.clear()
			caster.get('definites').delete(block)
			return caster.fire( block , status.mods )
		}
		
		watcher.start = function () {
			this.timer = window.setInterval( this.func.bind(this), 300 )
			return this
		}
		
		return Watchers.set( key, watcher.start() )
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
	
	function waiting_dependents(list){
		if (!list) return false
		return list.filter(filter_cached).length > 0
	}
	function when_element_is_defined(...names){
		let whens = names.map(name=>window.customElements.whenDefined(name))
		return all_promises(...whens)
	}
	
})(window)






