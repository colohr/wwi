wwi.exports('dom',(dom,fxy)=>{
	
	const is = fxy.is
	const Symbols = fxy.symbols
	const Basic = {
		get A11y(){
			return fxy.require('element/a11y')
		},
		//get Aria() {
		//	return fxy.require('element/aria')
		//},
		get Actions() {
			return fxy.require('element/actions')
		},
		get Attributes() {
			return fxy.require('element/attributes')
		},
		get Callback() {
			return this.Actions.Callback
		},
		//get Classes() {
		//	return fxy.require('element/classes')
		//},
		get Changed() {
			return this.Routes.Changed
		},
		get Connected() {
			return this.Routes.Connected
		},
		get Define() {
			return fxy.require('element/define')
		},
		get Design() {
			return fxy.require('element/design')
		},
		//get Detector(){
		//	return fxy.require('element/detector')
		//},
		get Disconnected() {
			return this.Routes.Disconnected
		},
		get Element(){ return get_element() },
		get Events() {
			return fxy.require('element/memory').Events
		},
		get Focus(){
			return fxy.require('element/focus')
		},
		get Memorize(){
			return fxy.require('element/memorize')
		},
		//get Mixins(){
		//	return fxy.require('element/mixins')
		//},
		get Pointer() {
			return Symbols.Pointer
		},
		get Slots(){
			return fxy.require('element/slots')
		},
		get Symbols(){
			return Symbols
		},
		get Routes(){
			return this.Tricycle.Routes
		},
		get Template(){
			return fxy.require('element/template')
		},
		get Tricycle() {
			return fxy.require('element/tricycle')
		},
		get Types(){
			return fxy.require('element/memory').Types
		}
	}
	
	//----------------dom exports---------------
	const basics = new Proxy({
			get keys(){ return Object.keys(Basic)},
			get names(){ return this.keys.map(key=>key.toLowerCase()) },
			get items(){ return this.keys.map(key=>{ return { key,name:key.toLowerCase() }})},
			get(name_or_key){
				let match = this.items.filter(key_name=>{ return key_name.key === name_or_key || key_name.name === name_or_key })[0]
				return match ? Basic[match.key] : null
			},
			has(name_or_key){ return this.keys.includes(name_or_key) || this.names.includes(name_or_key) }
		},{
		get(o,name){
			if(typeof name !== 'string' && name in o) return o[name]
			return o.get(name)
		},
		has(o,name){
			if(typeof name !== 'string') return name in o
			return o.has(name)
		},
		set(o,name,value){
			if(name in Basic) console.warn(`dom.basics already has a ${name} value. did not set`)
			else Basic[name] = value
			return true
		}
	})
	dom.basics = basics
	
	//----------------wwi elements------------
	wwi.app = wwi_app_export
	
	wwi.button = wwi_button_export
	
	wwi.container = wwi_container_export
	
	wwi.element = wwi_element_export
	
	wwi.listener = wwi_listener_export
	
	wwi.page = wwi_page_export
	
	//----------shared actions---------
	
	//export actions
	function wwi_app_export(doc, ...mixes){
		const wwi_app = wwi_element_export(doc, ...mixes)
		wwi_app.Element =  fxy.require('dom/app')(wwi_app.Element)
		return wwi_app
	}
	
	function wwi_button_export( doc, ...mixes ){
		const template = generate_template(doc)
		mixes.push(basics.Button)
		const creator = generate_element_creator(...mixes)
		creator.Element = Basic.Memorize(Basic.A11y(creator.Element))
		return generate_construction(template,creator)
	}
	
	function wwi_container_export(...x){
		let CustomElement = get_element(...x)
		function wwi_create(...definitions){
			if(definitions.length === 1) definitions.push(CustomElement)
			return wwi.define(...definitions)
		}
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	function wwi_element_export( doc, ...mixes ){
		const template = generate_template(doc)
		const creator = generate_element_creator(...mixes)
		return generate_construction(template,creator)
	}
	
	function wwi_listener_export(name, ...observed){
		let CustomElement = Basic.Actions(class extends HTMLElement{
			static get observedAttributes(){return observed}
		})
		function wwi_create(mixin){
			if(typeof mixin === 'function') CustomElement = mixin(CustomElement)
			return wwi.define(name,CustomElement)
		}
		return wwi_create
	}
	
	function wwi_page_export( doc, ...mixes ){
		const page = wwi_element_export(doc, ...mixes)
		page.Element = dom.Page(page.Element)
		return page
	}
	
	function generate_element_creator(...mixes){
		const mixins = generate_mixins(...mixes)
		const creator = get_element_with_basic_mixes(mixins.base,mixins.properties)
		creator.Element = get_element_with_require_mixes(creator.Element, ...mixins.names)
		return creator
	}
	
	function generate_mixins(...names){
		const list = []
		names = names.filter(value=>{
			let is_mix = value && typeof value === 'string'
			if(!is_mix) list.push(value)
			return is_mix
		})
		const base = get_mixed_base_element(...list)
		const properties = list.filter(x=>Array.isArray(x))[0] || null
		return { base, names, properties }
	}
	
	function generate_construction(template,creator){
		const element_name = get_element_identity({template}).element_name
		const construction = function wwi_construction(base,extension,...observed){
			generate_base_observed(base,observed).template = template
			return wwi.define(...generate_base_definitions(element_name,base,extension))
		}
		if(creator){
			construction.creator = creator
			Object.defineProperty(construction,'Element',{ get(){ return this.creator.Element },set(value){ return this.creator.Element = value } })
		}
		return new Proxy(construction,{
			get(o,name){
				if(name in o) return o[name]
				if(name === 'extension') return generate_element_extension(o)
				return null
			}
		})
	}
	
	function generate_element_extension(construction){
		return function element_extension_mixin(...x){
			let extensions = get_extensions(...x)
			return new Proxy(function extension_of_base(Base,...options){
				Promise.all(extensions).then(results=>{
					let mixins = results.filter(result=>fxy.is.function(result)).filter(mixin=>!(fxy.symbols.dont_mix in mixin))
					for(let mixin of mixins) Base = mixin(Base)
					return construction(Base,...options)
				})
				return construction
			},{
				get(o,name){
					if(name in construction) return construction[name]
					return null
				},
				has(o,name){
					if(name in construction) return true
					else if(name in o) return true
					return false
				},
				set(o,name,value){
					construction[name] = value
					return true
				}
			})
		}
		
		//shared actions
		function get_extensions(...x){
			let paths = filter_paths(...x)
			let evals = filter_evals(paths,...x)
			let extensions = []
			if(paths.length > 1){
				let folder = paths.length === 3 ? paths[0]:'component'
				let module = paths.length === 3 ? paths[1]:paths[0]
				let name = paths.length === 3 ? paths[2]:paths[1]
				extensions.push(wwi.external[folder](module,name))
			}
			return extensions.concat(evals.map(value=>{
				if(fxy.is.data(value)) return get_data_extension(value)
				return get_url_extension(value)
			}).filter(e=>e !== null))
			//shared actions
			function filter_evals(paths,...x){ return x.filter(path=>!paths.includes(path)) }
			function filter_paths(...x){ return x.filter(path=>fxy.is.text(path)).filter(path=>(!path.includes('.') && !path.includes('/') && path.indexOf('http') === -1)) }
			function get_data_extension(value){
				let folder = 'folder' in value ? value.folder:'component'
				if('module' in value) return wwi.external[folder](value.module,value.name)
				if('url' in value) return get_extension_from_url(value.url)
				if('path' in value) return get_extension_from_url(value.path)
				return null
			}
			function get_extension_from_url(value){
				if(!fxy.is.text(value)) return null
				let path_url = value.indexOf('http') === 0 ? value:window.url.site(value)
				return window.app.port.eval(path_url)
			}
			function get_url_extension(value){
				if(fxy.is.text(value) && (value.includes('.es6') || value.includes('.js'))) return get_extension_from_url(value)
				return null
			}
		}
	}
	
	function generate_base_definitions(element_name,base,extension){
		const args = [element_name,base]
		if(extension) args.push(extension)
		return args
	}
	
	function generate_base_observed(base,observed){
		if(observed.length && Symbols.Properties in base){
			let base_properties = base[Symbols.Properties]
			observed = observed.filter(observed_name=>!base_properties.includes(observed_name))
			base[Symbols.Properties] = base[Symbols.Properties].concat(observed)
		}
		return base
	}
	
	function generate_template(doc){
		const template_query = get_template_selector(doc)
		return doc.currentScript.ownerDocument.querySelector(template_query)
	}
	
	//element mixins & identity
	function get_element(Base, properties){
		if (is.nothing(Base)) Base = HTMLElement
		Base = Basic.Actions(Base)
		Base = Basic.Attributes(Base)
		Base = Basic.Define(Base)
		Base = Basic.Design(Base)
		Base = Basic.Focus(Base)
		Base = Basic.Slots(Base)
		Base = Basic.Template(Base)
		return get_element_class(Base, properties)
		//shared actions
		function get_element_class(Base, properties){
			properties = observed_attributes(properties)
			class ElementClassDefinition extends Basic.Tricycle(Base) {
				static get observedAttributes() { return this[Symbols.Properties] }
				constructor(...x) {
					super()
					element_construction(this,...x)
				}
			}
			ElementClassDefinition[Symbols.Properties] = properties || []
			return ElementClassDefinition
			//shared actions
			function element_construction(element,...x){
				let definitions = []
				let template
				if(is.text(x[0]) && x[0] === 'routes' && is.object(x[1])) definitions = [x[0],x[1]]
				else if(!is.nothing(x[1])) template = x[1]
				if(!definitions.length && is.object(x[0])) definitions.push(x[0])
				element.attach_template(template).define(...definitions)
			}
			function observed_attributes(properties){
				if(!Array.isArray(properties)) properties = []
				if('observedAttributes' in Base) properties = properties.concat(Base.observedAttributes.filter(prop =>!properties.includes(prop)))
				return properties
			}
		}
	}
	
	function get_element_identity({name,template}){
		let template_id = get_element_template_id({name,template})
		let element_name = get_element_name({name,template_id})
		return {element_name,template_id}
	}
	
	function get_element_name({name,template_id}){
		let element_name =  is.text(name) ? name : null
		if(!element_name && is.text(template_id)) element_name =  template_id.replace('-template','')
		return element_name
	}
	
	function get_element_template_id({name,template}){
		let template_id = is.element(template,  HTMLTemplateElement) ? template.id : null
		if( !template_id && is.text(name) ) template_id = `${name || ''}-template`
		return  template_id
	}
	
	function get_element_with_basic_mixes(...x){
		let CustomElement = get_element(...x)
		function wwi_create(...definitions){
			if(definitions.length === 1) definitions.push(CustomElement)
			return wwi.define(...definitions)
		}
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	function get_element_with_require_mixes(Base, ...names){
		if(names.length === 0) return Base
		let mixes = get_named_mixes(...names)
		for(let mix of mixes) Base = mix(Base)
		return Base
		//shared actions
		function get_named_mixes(...names){ return new Set(names.map(name=>fxy.require(`element/${name}`))) }
	}
	
	
	function get_mixed_base_element(...x){ return x.filter(value=>typeof value === 'function' && 'ELEMENT_NODE' in value)[0] || null }
	
	function get_template_selector(doc){
		let current_script = doc.currentScript
		let current_script_id = current_script.id ? `#${current_script.id}` : ''
		if(current_script_id && !current_script_id.includes('-template') && doc.currentScript.ownerDocument.querySelector(`template${current_script_id}`)===null) current_script_id = current_script_id+'-template'
		return !current_script_id ? 'template':`template${current_script_id}`
	}
	
	
})

