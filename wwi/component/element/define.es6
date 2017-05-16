wwi.exports('element',(element,fxy) => {
	const is = fxy.is
	const skip_definitons = ["isAttributed", "__polymerGestures"]
	
	function get_property(name,prop){
		let property = {}
		if ('value' in prop) Object.assign(property, prop)
		else {
			let alias = prop.alias || name;
			if (prop.get) property.get = prop.get;
			else {
				property.get = function () {
					let v = this.getAttribute(alias)
					let value = get_attribute_value(v)
					if ( value === null ) return null
					else if(value === '') return true
					return value
				}
			}
			
			if ( is.function( prop.set ) ) property.set = prop.set
			else if ( prop.set === false ) {}
			else {
				property.set = function (v) {
					let value = get_attribute_value(v)
					let old = this.getAttribute(alias)
					//let changed = old === null && old !== value
					if (value === null) this.removeAttribute(alias)
					else this.setAttribute(alias, value)
					if('attributeChangedCallback' in this) this.attributeChangedCallback(name, old, value)
					return value
				}
			}
		}
		return property
	}
	
	function get_attribute_value(value){
		if(value === null || value === false) return null
		else if(value === true) return ''
		return value
	}
	
	function get_prop_value(prop,name){
		let value = is.data(prop) ? prop : { name }
		if( is.text( prop ) ) value.alias = prop
		return {
			get id(){
				if(!this.identity) this.identity = get_property_identity(this.name)
				return this.identity
			},
			get name(){ return this.value.name },
			value
		}
	}
	
	const ElementProperties = Base => class extends Base {
		
		define(props, apply) {
			if(typeof props !== 'object' || props === null) return this
			let _props = Object.getOwnPropertyNames(this)
			for (let key in props) {
				
				let prop = get_prop_value( props[key], key )
				let id = prop.id
				let change = id.change
				let name = change ? id.decamel : prop.name
				
				let property = get_property(name,prop.value)
				
				if (_props.includes(name)) console.warn('property already defined', name)
				else Object.defineProperty(this, name, property)
				
				//remember to add camel & dash changes
				if(id.dashed || change){
					let camel_name = id.camel
					if(camel_name){
						if (_props.includes(camel_name)) {
							console.warn(`skipped camelCase prop: ${name}`, camel_name)
						}
						else Object.defineProperty(this, camel_name, property)
					}
				}
				
				if(apply){
					let apply_value = fxy.symbols.true === value ? '':value
					this[name] = apply_value
				}
				
			}
			return this
		}
		defined(name){ return this.definitions.includes(name) }
		get definitions(){ return Object.getOwnPropertyNames(this).filter(name=>{ return skip_definitons.includes(name) !== true }) }
		
		
	}
	
	
	
	function camel(){}
	camel.not = function decamel(str) {
		str = str.replace(/\W+/g, '-')
		         .replace(/([a-z\d])([A-Z])/g, '$1-$2');
		if(str.indexOf('-') === 0) str = str.replace('-','').trim()
		return str.toLowerCase()
	}
	camel.ize = function camelize(x) {
		return x.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : letter.toUpperCase()
		}).replace(/\s+/g, '')
	}
	
	function get_property_identity(name){
		return {
			get camel(){ return camel.ize( this.dashed ? this.name.replace(/-/g,' '):this.name ) },
			get dashed(){ return this.name.includes('-') },
			get decamel(){ return camel.not(this.name) },
			get change(){
				if(this.dashed) return false
				return this.name !== this.decamel
			},
			name
		}
	}
	
	
	
	
	
	element.define = ElementProperties
})