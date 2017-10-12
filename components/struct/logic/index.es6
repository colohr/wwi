window.fxy.exports('struct',(struct,fxy)=>{
	const struct_actions = Symbol('struct actions')
	const struct_endpoint = Symbol('struct endpoint')
	const struct_index = Symbol.for('struct index')
	const struct_interface = Symbol('struct interface')
	
	//exports
	struct.get = get_struct

	//shared actions
	function get_actions(element,actions){
		if(actions) element[struct_actions] = actions
		if(struct_actions in element) return element[struct_actions]
		return null
	}
	
	function get_client(element){
		let client_interface = get_interface(element)
		if(client_interface) return client_interface.client
		return null
	}
	
	function get_endpoint(element,endpoint){
		if(endpoint) return element[struct_endpoint] = endpoint
		if(struct_index in element) return element[struct_index].endpoint
		else if(fxy.is.element(element) && element.hasAttribute('endpoint')) return element.getAttribute('endpoint')
		else if(struct_endpoint in element) return element[struct_endpoint]
		let index = get_index(element)
		if(index) return index.endpoint
		return null
	}
	
	function get_index(element,name){
		if(struct_index in element) return element[struct_index]
		name = get_name(element,name)
		if(name) return element[struct_index] = window.components[name].struct
		return null
	}
	
	function get_interface(element,endpoint,options){
		if(struct_interface in element) return element[struct_interface]
		endpoint = get_endpoint(element,endpoint)
		options = get_options(element,options)
		return element[struct_interface] = new struct.Interface(endpoint,options)
	}
	
	function get_name(element,name){
		if(!fxy.is.text(name)){
			if(fxy.is.data(element)){
				if(fxy.is.element(element) && element.hasAttribute('struct-name')) name = element.getAttribute('struct-name')
				if(!fxy.is.text(name) && 'struct_name' in element) name = element.struct_name
			}
		}
		return name
	}
	
	function get_options(element,options){
		if(!fxy.is.data(options) && 'struct_options' in element) options = element.struct_options
		if(!fxy.is.data(options) && 'shared-options' in struct) options = struct['shared-options']
		return fxy.is.data(options) ? options:null
	}
	
	function get_struct(element){
		return new Proxy(element,{
			get(o,name){
				switch(name){
					case 'actions': return get_actions(o)
					case 'client': return get_client(o)
					case 'endpoint': return get_endpoint(o)
					case 'index': return get_index(o)
					case 'interface': return get_interface(o)
				}
				return null
			},
			has(o,name){
				switch(name){
					case 'actions': return get_actions(o) !== null
					case 'client': return get_client(o) !== null
					case 'endpoint': return get_endpoint(o) !== null
					case 'index': return get_index(o) !== null
					case 'interface': return get_interface(o) !== null
				}
				return false
			},
			set(o,name,value){
				switch(name){
					case 'actions':
						get_actions(o,value)
						break
					case 'endpoint':
						get_endpoint(o,value)
						break
					case 'index':
						get_index(o,value)
						break
					case 'interface':
						get_interface(o,value)
						break
				}
				return true
			}
		})
	}
	
	
})