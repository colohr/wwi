window.fxy.exports('dom', (dom, fxy) => {
	const is = fxy.is
	const Symbols = fxy.symbols

	//exports
	dom.basic_element = get_element
	
	//wwi exports
	wwi.app = wwi_app_export
	wwi.button = wwi_button_export
	wwi.custom = wwi_custom_export
	wwi.container = wwi_container_export
	wwi.element = wwi_element_export
	wwi.listener = wwi_listener_export
	wwi.page = wwi_page_export
	
	//export actions
	function wwi_app_export(doc, ...mixes) {
		const wwi_app = wwi_element_export(doc, ...mixes)
		wwi_app.Element = fxy.require('dom/app')(wwi_app.Element)
		return wwi_app
	}
	
	function wwi_button_export(doc, ...mixes) {
		const template = generate_template(doc)
		mixes.push(fxy.require('dom/Button'))
		const creator = generate_element_creator(...mixes)
		creator.Element = fxy.require('element/memorize')(fxy.require('element/a11y')(creator.Element))
		return generate_construction(template, creator)
	}
	
	function wwi_custom_export(doc, ...mixes) {
		const template = generate_template(doc)
		mixes.push(Symbol.for('custom element'))
		const creator = generate_element_creator(...mixes)
		return generate_construction(template, creator)
	}
	
	function wwi_container_export(...x) {
		let CustomElement = get_element(...x)
		function wwi_create(...definitions) {
			if (definitions.length === 1) definitions.push(CustomElement)
			return fxy.define(...definitions)
		}
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	function wwi_element_export(doc, ...mixes) {
		const template = generate_template(doc)
		const creator = generate_element_creator(...mixes)
		return generate_construction(template, creator)
	}
	
	function wwi_listener_export(name, ...observed) {
		let CustomElement = fxy.require('element/actions')(class extends HTMLElement {
			static get observedAttributes() {return observed}
		})
		
		function wwi_create(mixin) {
			if (typeof mixin === 'function') CustomElement = mixin(CustomElement)
			return fxy.define(name, CustomElement)
		}
		
		return wwi_create
	}
	
	function wwi_page_export(doc, ...mixes) {
		const page = wwi_element_export(doc, ...mixes)
		page.Element = dom.Page(page.Element)
		return page
	}
	
	
	
	//shared actions
	function generate_element_creator(...mixes) {
		const mixins = generate_mixins(...mixes)
		const creator = get_element_with_basic_mixes(mixins.base, mixins.properties, mixins.type)
		creator.Element = get_element_with_require_mixes(creator.Element, ...mixins.names)
		return creator
	}
	
	function generate_mixins(...names) {
		const list = []
		let type = 'wwi'
		names = names.filter(value => {
			
			let is_mix = value && typeof value === 'string'
			if (!is_mix) list.push(value)
			else if(value === Symbol.for('custom element')){
				type = 'custom'
				return false
			}
			return is_mix
		})
		const base = get_mixed_base_element(...list)
		const properties = list.filter(x => Array.isArray(x))[0] || null
		return {base, names, properties,type}
	}
	
	function generate_construction(template, creator) {
		const element_name = get_element_identity({template}).element_name
		const construction = function wwi_construction(base, extension, ...observed) {
			generate_base_observed(base, observed).template = template
			return fxy.define(...generate_base_definitions(element_name, base, extension))
		}
		if (creator) {
			construction.creator = creator
			Object.defineProperty(construction, 'Element', {
				get () { return this.creator.Element },
				set (value) { return this.creator.Element = value }
			})
		}
		return new Proxy(construction, {
			get (o, name) {
				if (name in o) return o[name]
				if (name === 'extension') return generate_element_extension(o)
				return null
			}
		})
	}
	
	function generate_element_extension(construction) {
		return function element_extension_mixin(...x) {
			let extensions = get_extensions(...x)
			return new Proxy(function extension_of_base(Base, ...options) {
				Promise.all(extensions).then(results => {
					let mixins = results.filter(result => fxy.is.function(result)).filter(mixin => !(fxy.symbols.dont_mix in mixin))
					for (let mixin of mixins) Base = mixin(Base)
					return construction(Base, ...options)
				})
				return construction
			}, {
				get (o, name) {
					if (name in construction) return construction[name]
					return null
				},
				has(o, name) {
					if (name in construction) return true
					else if (name in o) return true
					return false
				},
				set (o, name, value) {
					construction[name] = value
					return true
				}
			})
		}
		
		//shared actions
		function get_extensions(...x) {
			let paths = filter_paths(...x)
			let evals = filter_evals(paths, ...x)
			let extensions = []
			if (paths.length > 1) {
				let folder = paths.length === 3 ? paths[0] : 'component'
				let module = paths.length === 3 ? paths[1] : paths[0]
				let name = paths.length === 3 ? paths[2] : paths[1]
				extensions.push(fxy.external[folder](module, name))
			}
			return extensions.concat(evals.map(value => {
				if (fxy.is.data(value)) return get_data_extension(value)
				return get_url_extension(value)
			}).filter(e => e !== null))
			
			//shared actions
			function filter_evals(paths, ...x) { return x.filter(path => !paths.includes(path)) }
			
			function filter_paths(...x) { return x.filter(path => fxy.is.text(path)).filter(path => (!path.includes('.') && !path.includes('/') && path.indexOf('http') === -1)) }
			
			function get_data_extension(value) {
				let folder = 'folder' in value ? value.folder : 'component'
				if ('module' in value) return fxy.external[folder](value)
				if ('url' in value) return get_extension_from_url(value.url)
				if ('path' in value) return get_extension_from_url(value.path)
				return null
			}
			
			function get_extension_from_url(value) {
				if (!fxy.is.text(value)) return null
				let path_url = value.indexOf('http') === 0 ? value : window.url.site(value)
				return fxy.port.eval(path_url)
			}
			
			function get_url_extension(value) {
				if (fxy.is.text(value) && (value.includes('.es6') || value.includes('.js'))) return get_extension_from_url(value)
				return null
			}
		}
	}
	
	function generate_base_definitions(element_name, base, extension) {
		const args = [element_name, base]
		if (extension) args.push(extension)
		return args
	}
	
	function generate_base_observed(base, observed) {
		if (observed.length && Symbols.Properties in base) {
			let base_properties = base[Symbols.Properties]
			observed = observed.filter(observed_name => !base_properties.includes(observed_name))
			base[Symbols.Properties] = base[Symbols.Properties].concat(observed)
		}
		return base
	}
	
	function generate_template(doc) {
		const template_query = get_template_selector(doc)
		return doc.currentScript.ownerDocument.querySelector(template_query)
	}
	
	//shared element actions
	function get_element(Base, properties, type) {
		Base = get_element_base(Base,type)
		return get_element_class(Base, properties)
		
		//shared actions
		function get_element_class(Base, properties) {
			properties = observed_attributes(properties)
			class ElementClassDefinition extends fxy.require('element/tricycle')(Base) {
				static get observedAttributes() { return this[Symbols.Properties] }
				constructor(...x) {
					super()
					element_construction(this, ...x)
				}
			}
			ElementClassDefinition[Symbols.Properties] = properties || []
			return ElementClassDefinition
			
			//shared actions
			function element_construction(element, ...x) {
				let definitions = []
				let template
				if (is.text(x[0]) && x[0] === 'routes' && is.object(x[1])) definitions = [x[0], x[1]]
				else if (!is.nothing(x[1])) template = x[1]
				if (!definitions.length && is.object(x[0])) definitions.push(x[0])
				element.attach_template(template).define(...definitions)
			}
			
			function observed_attributes(properties) {
				if (!Array.isArray(properties)) properties = []
				if ('observedAttributes' in Base) properties = properties.concat(Base.observedAttributes.filter(prop => !properties.includes(prop)))
				return properties
			}
		}
	}
	
	function get_element_base(Base,type='wwi'){
		if (is.nothing(Base)) Base = HTMLElement
		switch(type){
			case 'wwi':
				Base = fxy.require('element/actions')(Base)
				Base = fxy.require('element/attributes')(Base)
				Base = fxy.require('element/define')(Base)
				Base = fxy.require('element/design')(Base)
				Base = fxy.require('element/focus')(Base)
				break
		}
		Base = fxy.require('element/slots')(Base)
		Base = fxy.require('element/template')(Base)
		return Base
	}
	function get_element_identity({name, template}) {
		let template_id = get_element_template_id({name, template})
		let element_name = get_element_name({name, template_id})
		return {element_name, template_id}
	}
	
	function get_element_name({name, template_id}) {
		let element_name = is.text(name) ? name : null
		if (!element_name && is.text(template_id)) element_name = template_id.replace('-template', '')
		return element_name
	}
	
	function get_element_template_id({name, template}) {
		let template_id = is.element(template, HTMLTemplateElement) ? template.id : null
		if (!template_id && is.text(name)) template_id = `${name || ''}-template`
		return template_id
	}
	
	function get_element_with_basic_mixes(...x) {
		let CustomElement = get_element(...x)
		
		function wwi_create(...definitions) {
			if (definitions.length === 1) definitions.push(CustomElement)
			return fxy.define(...definitions)
		}
		
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	function get_element_with_require_mixes(Base, ...names) {
		if (names.length === 0) return Base
		let mixes = get_named_mixes(...names)
		for (let mix of mixes) Base = mix(Base)
		return Base
		
		//shared actions
		function get_named_mixes(...names) { return names.map(name => fxy.require(`element/${name}`)) }
	}
	
	function get_mixed_base_element(...x) { return x.filter(value => typeof value === 'function' && 'ELEMENT_NODE' in value)[0] || null }
	
	function get_template_selector(doc) {
		let current_script = doc.currentScript
		let current_script_id = current_script.id ? `#${current_script.id}` : ''
		if (current_script_id && !current_script_id.includes('-template') && doc.currentScript.ownerDocument.querySelector(`template${current_script_id}`) === null) current_script_id = current_script_id + '-template'
		return !current_script_id ? 'template' : `template${current_script_id}`
	}
})

