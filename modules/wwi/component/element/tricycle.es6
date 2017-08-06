wwi.exports('element',(element,fxy)=>{
	const is = fxy.is
	const Listener = fxy.require('element/listener')
	const A11y = fxy.require('element/a11y')
	
	const routes = {
		changed( changes ) { return changed_element( changes ) },
		connect(el){
			if('tricycle' in el) return tricycle(el,{},{cycle:'connected'})
			return connect_element(el)
		},
		connected(el) {
			if(el.hasAttribute('wait')) get_wait(el).then(_=>this.connect(el))
			else this.connect(el)
		},
		disconnected(el) {
			if('tricycle' in el) return tricycle(el,{},{cycle:'disconnected'})
			return disconnect_element(el)
		}
	}

	//--------------tricycle exports-----------
	element.tricycle = Base => class extends Base {
		connectedCallback() { routes.connected(this) }
		disconnectedCallback() { routes.disconnected(this) }
		attributeChangedCallback(attribute_name, old_value, new_value) { routes.changed({ el:this, name:attribute_name, old:old_value, value:new_value }) }
	}
	
	//--------------shared actions--------------
	function changed_element({el,name,old,value}){
		let data = {name,old,value}
		let tricycles = 'tricycle' in el
		if(tricycles) tricycle(el,data,{cycle:'changed'})
		else trigger_element_changed(el,name,old,value)
	}
	
	function connect_element(el){
		if('ui' in el.constructor) el.ui(el.constructor.ui)
		if(typeof el.connected === 'function') el.connected( fxy.symbols, is )
		if(is_ally(el)) A11y.connect(el)
		el.definitions.forEach( name => {
			if(el.hasAttribute(name)){
				let value = el.getAttribute(name)
				if(value !== null) changed_element({el,name,old:null,value})
			}
		})
		if (!el.isAttributed) el.isAttributed = true
		else return el
	}
	
	function disconnect_element(el){
		if(typeof el.route === 'function') el.route('disconnected')
		if(typeof el.disconnected === 'function') el.disconnected(fxy.symbols,is)
		if(is_ally(el)) A11y.disconnect(el)
		fxy.require('element/forget')(el)
		return Listener.Delete(el)
	}
	
	function get_element_routes(el){
		if(fxy.symbols.routes in el){
			return new Proxy({
				element:el,
				get routes(){ return this.element[fxy.symbols.routes] }
			},{
				get(o,name){
					let route
					if(name in o.routes) route = o.routes[name]
					if(fxy.is.function(route)) return route.bind(o.element)
					return null
				},
				has(o,name){
					if(fxy.is.text(name)) return name in o.routes
					return false
				}
			})
		}
		return null
	}
	
	function get_wait(element){
		return window.wwi.when(...get_waits())
		//shared actions
		function get_list(value){ return value.replace(/ /g,',').split(',').map(part=>part.trim()).filter(part=>part.length > 0) }
		function get_waits(){
			let wait = element.getAttribute('wait')
			if(fxy.is.text(wait)) return get_list(wait)
			return []
		}
	}
	
	

	function is_ally(el){ return fxy.symbols.ally.element in el }
	
	function tricycle(el,data,type){
		let tridata = Object.assign({},data)
		Object.assign(tridata,type)
		return el.tricycle(tridata,function tricycles(){
			if(type.cycle === 'connected') connect_element(el)
			else if(type.cycle === 'changed') trigger_element_changed(el,data.name, data.old, data.value)
			else if(type.cycle === 'disconnected') disconnect_element(el)
		})
	}
	
	function trigger_element_changed(el,name,old,value){
		let routes = get_element_routes(el)
		if(routes && name in routes) routes[name](value,old)
		else if('changed' in el && fxy.is.function(el.changed)) el.changed(name,old,value)
	}
	
})


//function connect_element_attributes(el){
//	if (typeof el.attributeChangedCallback === 'function') {
//		let a = el.attributes
//		let Atts = el.constructor && 'observedAttributes' in el.constructor ? el.constructor.observedAttributes : []
//		if (Atts && Atts.length) {
//			for (var i = 0; i < a.length; i++) {
//				let b = a[i]
//				if (Atts.includes(b.name) && 'attributeChangedCallback' in el){
//					el.attributeChangedCallback(b.name, null, b.value)
//				}
//			}
//		}
//	}
//	return el
//}

//routes.connected = function (el) {
//	if('tricycle' in el) return tricycle(el,{},{cycle:'connected'})
//	return connect_element(el)
//}
//
//routes.disconnected = function (el) {
//	if('tricycle' in el) return tricycle(el,{},{cycle:'disconnected'})
//	return disconnect_element(el)
//}
//
//routes.changed = function ( changes ) { return changed_element( changes ) }


//const Tricycle =
//Tricycle.routes = routes


