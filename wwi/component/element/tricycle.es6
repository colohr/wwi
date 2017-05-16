wwi.exports('element',(element,fxy)=>{
	
	const is = fxy.is
	
	const Listener = fxy.require('element/listener')
	const A11y = fxy.require('element/a11y')
	
	
	const routes = {}
	
	
	routes.connected = function (el) {
		if('tricycle' in el) return tricycle(el,{},{cycle:'connected'})
		return connect_element(el)
		
	}
	
	routes.disconnected = function (el) {
		if('tricycle' in el) return tricycle(el,{},{cycle:'disconnected'})
		return disconnect_element(el)
	}
	
	routes.changed = function ( changes ) {
		return changed_element( changes )
	}
	
	
	const Tricycle = Base => class extends Base {
		connectedCallback() { routes.connected(this) }
		disconnectedCallback() { routes.disconnected(this) }
		attributeChangedCallback(attribute_name, old_value, new_value) {
			routes.changed({ el:this, name:attribute_name, old:old_value, value:new_value })
		}
	}
	
	Tricycle.routes = routes
	
	//--------------tricycle exports-----------
	element.tricycle = Tricycle
	
	
	//--------------shared actions--------------
	//let ally = is_ally(el) && is_ally_change(name)
	//if( ally ){
	//	data.el = el
	//	A11y.change(data)
	//}
	function tricycle(el,data,type){
		let tridata = Object.assign({},data)
		Object.assign(tridata,type)
		return el.tricycle(tridata,function tricycles(){
			if(type.cycle === 'connected') connect_element(el)
			else if(type.cycle === 'changed' && type.changed) el.changed(data.name, data.old, data.value)
			else if(type.cycle === 'disconnected') disconnect_element(el)
		})
	}
	
	function changed_element({el,name,old,value}){
		let data = {name,old,value}
		let changed = 'changed' in el && is.function(el.changed)
		let tricycles = 'tricycle' in el
		if(tricycles) tricycle(el,data,{changed,cycle:'changed' })
		else if (changed) el.changed(name, old, value)
		//if (el.hasListener) el.dispatch(name, {name, old, value, action: 'attribute'}, el, el);
	}
	
	//connect actions
	function connect_element(el){
		el.definitions.forEach( name => {
			let value = el[name]
			if(value !== null) changed_element({el,name,old:null,value})
		})
		if (!el.isAttributed) el.isAttributed = true
		else return el
		if ('ui' in el.constructor) el.ui(el.constructor.ui)
		if (typeof el.connected === 'function') el.connected( fxy.symbols, is )
		if( is_ally(el) ) A11y.connect(el)
		return el
	}
	
	function connect_element_attributes(el){
		if (typeof el.attributeChangedCallback === 'function') {
			let a = el.attributes
			let Atts = el.constructor && 'observedAttributes' in el.constructor ? el.constructor.observedAttributes : []
			if (Atts && Atts.length) {
				for (var i = 0; i < a.length; i++) {
					let b = a[i]
					if (Atts.includes(b.name) && 'attributeChangedCallback' in el){
						el.attributeChangedCallback(b.name, null, b.value)
					}
				}
			}
		}
		return el
	}
	function connect_element_routes(el){
		//if (typeof el.route === 'function') el.route('connected')
		let ally = is_ally(el)
		if (typeof el.connected === 'function') el.connected( fxy.symbols, is )
		if( ally ) A11y.connect(el)
		return el
	}
	function connect_element_ui(el){
		if ('ui' in el.constructor) el.ui(el.constructor.ui)
		return el
	}
	
	
	//disconnect actions
	function disconnect_element(el){
		if (typeof el.route === 'function') el.route('disconnected')
		if (typeof el.disconnected === 'function') el.disconnected(fxy.symbols,is)
		if( is_ally(el) ) A11y.disconnect(el)
		fxy.require('element/forget')(el)
		return Listener.Delete(el)
	}
	
	//is actions
	function is_ally(el){
		return fxy.symbols.ally.element in el
	}
	
	
	
})

/*
*
function changed(){
 if (typeof el.route === 'function') el.route('attribute', {name, old, value})
 if (typeof el.changed === 'function') el.changed(name, old, value)
 if (el.hasListener) el.dispatch(name, {name, old, value, action: 'attribute'}, el, el);
 return el;
}
function connected(){
 if (!el.isAttributed) el.isAttributed = true
 else return el
 if ('ui' in el.constructor) el.ui(el.constructor.ui)
 if (typeof el.attributeChangedCallback === 'function') {
 let a = el.attributes
 let Atts = el.constructor && 'observedAttributes' in el.constructor ? el.constructor.observedAttributes : []
 if (Atts && Atts.length) {
 for (var i = 0; i < a.length; i++) {
 let b = a[i]
 if (Atts.includes(b.name) && 'attributeChangedCallback' in el){
 el.attributeChangedCallback(b.name, null, b.value)
 }
 }
 }
 }
 if (typeof el.route === 'function') el.route('connected')
 if (typeof el.connected === 'function') el.connected(fxy.symbols,is)
 return el;
}
* */