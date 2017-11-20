(function(get_code,window){ return get_code(window) })
(function(window){
	let components_index = ${components_index};
	let struct_index = ${struct_index};
	if(!('items' in struct_index)) struct_index.items = {}
	const item_names = get_item_names()
 
	const extension = {
		types:{
			mix:'external',
			extension:'external',
			extend:'external',
			'extends':'external',
			mixin:'external'
		},
		value:{
			mixin:true,
			extend:true
		}
	}
	
	//exports
    window.components = new Proxy(get_component_library,{
	    get:get_value,
	    has(o,name){
		    if(name in o) return true
		    else if(name in components_index) return true
		    return false
	    }
    })
	if(!window.customElements.get('components-code')) window.customElements.define('components-code', class extends HTMLElement{constructor(){super()}})
	
	//shared actions
	function get_index(){
		return {
			components:components_index,
			structs:struct_index.items
		}
	}
	
	function get_component_extension_proxy(component,type,selector){
		return function get_extension(...names){
			let value = names.map(name=>get_data(name))
			if(selector in extension.value) return value[0]
			return value
		}
		//shared action
		function get_data(name){
			return {
				path:component.url+'/'+type,
				module:component.name,
				name
			}
		}
	}
	
	function get_component_library(name){
		if(name in components_index) {
			let value = components_index[name]
			return window.fxy.library(value.url)
		}
		return window.fxy.library(name)
	}
	
	function get_component_library_proxy(){
		return new Proxy(components_index,{
			get(o,name){
				if(name in o) return get_component_library(name)
				return null
			},
			has(o,name){ return name in o }
		})
	}
	
	function get_component_url(component){ return (...x)=>window.fxy.file.url(component.url,...x) }
	
	function get_component_port(component){ return (...x)=>window.fxy.port(get_component_url(component)(...x)) }
	
	
	function get_component_work(component){
		return (name,options)=>{
			if(name.includes('.') !== true) name += '.js'
			return fxy.point.Worker(get_component_url(component)('worker',name),options)
		}
	}
	function get_component_worker(component){
		return (name)=>{
			if(name.includes('.') !== true) name += '.js'
			return new Worker(get_component_url(component)('worker',name))
		}
	}
	
	function get_item(item_name){
		return new Proxy({
			name:item_name,
			component:components_index[item_name] || null,
			struct:struct_index.items[item_name] || null
		},{
			get(o,name){
				switch(name){
					case 'actions': return get_item_actions(o)
					case 'api':
					case 'client': return get_item_client(o)
					case 'extension':
					case 'extend':
					case 'extends':
					case 'external':
					case 'mix':
					case 'mixin':
					case 'control':
						if(o.component){
							let type = name in extension.types ? extension.types[name]:name
							return get_component_extension_proxy(o.component,type,name)
						}
						break
					case 'file':
						return get_component_url(o.component)
						break
					case 'port':
						return get_component_port(o.component)
						break
					case 'work':
						return get_component_work(o.component)
						break
					case 'worker':
						return get_component_worker(o.component)
						break
					case 'library':
						return get_component_library
						break
				}
				if(o.component && name in o.component) return o.component[name]
				else if(o.struct) {
					if(name in o.struct) return o.struct[name]
					else if(name in struct_index) return struct_index[name]
				}
				if(name in o) return o[name]
				return null
			}
		})
	}
	
	function get_item_client(component){
		let struct = component.struct
		if(struct && fxy.is.module('struct/client')) return fxy.require('struct/client').api(struct)
		return null
	}
	
	function get_item_actions(component){
		let struct = component.struct
		if(struct && fxy.is.module('struct/client')) return fxy.require('struct/client').actions(struct)
		return null
	}
	
	function get_item_names(){
		let names = new Set()
		Object.keys(components_index).forEach(name=>names.add(name))
		Object.keys(struct_index.items).forEach(name=>names.add(name))
		return names
	}
	
	function get_value(o,name){
		let value = null
		if(item_names.has(name)) return get_item(name)
		if(name === 'library') return get_component_library_proxy()
		else if(name === 'index') return get_index()
		else if(name in struct_index) return struct_index[name]
		if(name in o) value = o[name]
		if(name === 'index_names' || name === 'names') return item_names
		return value
		
	}
	
},this)