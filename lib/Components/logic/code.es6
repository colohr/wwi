(function(get_code,window){ return get_code(window) })
(function(window){
	let components_index = ${index};
    //exports
    window.components = new Proxy(get_component_library,{
	    get(o,name){
		    let value = null
		    if(name in components_index) return get_component_proxy(components_index[name])
		    if(name === 'library') return get_component_library_proxy()
		    if(name in o) value = o[name]
		    return value
	    },
	    has(o,name){
		    if(name in o) return true
		    else if(name in components_index) return true
		    return false
	    }
    })
	
	window.fxy.define('components-code',class extends HTMLElement{constructor(){super()}})
	
	//shared actions
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
	function get_component_proxy(component){
        return new Proxy(component,{
        	get(o,name){
        		switch(name){
			        case 'extension':
			        case 'external':
			        case 'mix':
			        case 'control':
			        	let type = null
			        	if(name === 'control') type = 'control'
				        else type = 'external'
			        	return get_component_extension_proxy(o,type)
			        	break
			        case 'library':
			        	return get_component_library
			        	break
		        }
		        if(name in o) return o[name]
		        return null
	        }
        })
	}
	function get_component_extension_proxy(component,type){
		
		return function get_extension(...names){
			return names.map(name=>get_data(name))
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
},this)