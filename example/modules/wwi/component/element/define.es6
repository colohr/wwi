wwi.exports('element',(element,fxy) => {
	const is = fxy.is
	const skip_definitons = ["isAttributed", "__polymerGestures"]
	class Routes{ constructor(){ } }
	
	//exports
	element.define = Base => class extends Base {
		define(props, apply) {
			if(props === 'routes') props = define_routes(this,apply)
			if(typeof props !== 'object' || props === null) return this
			for (let key in props) {
				let prop = get_prop_value( props[key], key )
				let name = set_property(this,key,prop.value)
				if(apply === true) this[name] = fxy.symbols.true === prop.value ? '':prop.value
			}
			return this
		}
		defined(name){ return this.definitions.includes(name) }
		get definitions(){ return Object.getOwnPropertyNames(this).filter(name=>skip_definitons.includes(name) !== true) }
	}
	
	//shared actions
	function define_routes(element,routes){
		if(fxy.is.data(routes) && Object.keys(routes).length > 0){
			let props = {}
			let route_actions = {}
			for(let name in routes){
				let route = routes[name]
				if(fxy.is.function(route)) {
					props[name] = true
					route_actions[name] = route
				}
				else if(!fxy.is.nothing(route)) props[name] = route
			}
			if(Object.keys(route_actions).length){
				let routes_object = fxy.symbols.routes in element ? element[fxy.symbols.routes]:new Routes()
				Object.assign(routes_object,route_actions)
				element[fxy.symbols.routes] = routes_object
			}
			if(Object.keys(props).length) return props
		}
		return null
	}
	
	function get_attribute_value(value){
		if(value === null || value === false) return null
		else if(value === true) return ''
		return value
	}
	
	function get_property(name,prop){
		let property = {}
		if ('value' in prop) Object.assign(property, prop)
		else {
			let dashed = fxy.id.dash(name)
			if (prop.get) property.get = prop.get;
			else {
				property.get = function () {
					let v = this.getAttribute(dashed)
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
					let old = this.getAttribute(dashed)
					if (value === null) this.removeAttribute(dashed)
					else this.setAttribute(dashed, value)
					if('attributeChangedCallback' in this && old !== value) this.attributeChangedCallback(name, old, value)
					return value
				}
			}
		}
		return property
	}
	
	function get_prop_value(prop,name){
		let value = is.data(prop) ? prop : { name }
		if( is.text( prop ) ) value.alias = prop
		return {
			get name(){ return this.value.name },
			value
		}
	}
	
	function set_property(element, key, value){
		let ids = ['dash','code','underscore']
		let _props = Object.getOwnPropertyNames(element)
		let set = []
		let name
		for(let id of ids){
			name = fxy.id[id](key)
			if(!_props.includes(name) && !set.includes(name)){
				let property = get_property(name,value)
				Object.defineProperty(element, name, property)
				set.push(name)
			}
		}
		return name
	}
	
})