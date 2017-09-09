(function(get_library){ return get_library() })
(function(){
    return (function export_library(){
		
		return window.fxy.library  = create_library
	
	    //shared actions
	    function create_library(path) {
		    let parts = path.split('/')
		    let library = {
			    get element_name(){ return this.id || `${this.name}-library`},
			    name:parts[parts.length - 1],
			    path
		    }
		    return get_library_data(library)
			    .then(data=>load_ports(data))
			    .then(data=>load_logic(data))
			    .then(data=>load_elements(data))
			    .then(data=>load_wait(data))
			    .then(data=>window.customElements.define(data.element_name,class extends HTMLElement{constructor(){super()}}))
		
	    }
	    
	    function get_library_data(library){
		    return window.fetch(`${library.path}/library`)
		                 .then(response=>response.text())
		                 .then(text=>get_library_module(text,library))
	    }
	
	    function get_library_module(text,library){
		    let lines = text.split('\n')
		    if (lines.length) {
			    if (lines[0].trim() === 'library = {}') lines = lines.splice(1)
			    let library_script = lines.join('\n')
			    return eval(`(()=>function library_export(library){
							${library_script}
							return library;
						})()`)(library)
		    }
		    throw new Error(`Nothing found in ${library.path}/library file`)
	    }
	
	    function load_elements(library) {
	    	let items = 'elements' in library ? library.elements:[]
		    return load_items(library,get_element,...items)
		    //shared actions
		    function get_element(element_data) {
			    element_data = get_element_data(element_data)
			    return new Promise((success,error)=>{
				    let waits = element_data.wait || []
				    return window.fxy.when(...waits).then(_=>{
					    return window.fxy.port(element_data.path, {'from-library': library.name})
					                 .then(()=>{
						                 if(!window.fxy.is.text(element_data.name)) return success(element_data)
						                 return window.fxy.when(element_data.name).then(()=>success(element_data))
					                 })
					                 .catch(e=>{
						                 console.error(`Library: ${library.name}`)
						                 console.error(`Error loading element at: ${element_data.path}`)
						                 console.error(`Element waits on: ${element_data.wait}`)
						                 return error(e)
					                 })
				    })
			    })
		    }
		
		    function get_element_data(data) {
			    let output = {}
			    if (window.fxy.is.text(data)) output.file = data
			    else if(window.fxy.is.data(data)) output = data
			    if (!('path' in output)) output.path = `${library.path}/${output.file}`
			    else output.path = `${library.path}/${output.path}`
			    if (!('wait' in output)) output.wait = data.wait
			    return output
		    }
	    }
	
	    function load_logic(library) {
		    let items = 'logic' in library ? library.logic:[]
		    return load_items(library,get_logic,...items)
		    
		    //shared actions
		    function get_logic(name) {
			    let item = {path:`${library.path}/${name}`}
			    return window.fxy.port.eval(item.path).then(()=>item)
		    }
	    }
	
	    function load_ports(library) {
		    let items = 'ports' in library ? library.ports:[]
		    return load_items(library,get_port,...items)
		    //shared actions
		    function get_port(item) {
			    item = window.fxy.is.text(item) ? {path:item}:item
			    let file_url = item.path.includes('http') ? item.path:window.url(item.path)
			    return window.fxy.port(file_url).then(()=>item)
		    }
	    }
	    
	    function load_items(library,loader,...items){
		    let count = items.length
		    let loaded = 0
		    return new Promise((success, error)=>{
		    	if(library.log) console.groupCollapsed('Library: '+library.name+' -> '+loader.name)
			    function get_element_items(){
				    for(let i = loaded; i < count; i++){
					    let item = loader(items[i])
					    return item.then(file=>{
					    	if(library.log) console.log(file)
						    loaded++
						    return get_element_items()
					    }).catch(e=>{
					    	console.error(`Library Error: ${library.name}`)
						    console.error('loader: ',loader.name)
						    console.error('item: ',items[i])
						    console.error(e)
						    return error(e)
					    })
				    }
				    if(library.log) console.groupEnd()
				    return success(library)
			    }
			    return get_element_items()
		    })
	    }
	
	    function load_wait(library){
		    return new Promise((success,error)=>{
			    if('wait' in library) return window.fxy.when(...library.wait).then(_=>success(library)).catch(error)
			    return success(library)
		    })
	    }
	
	
    })()
})

