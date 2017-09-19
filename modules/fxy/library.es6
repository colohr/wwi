(function(get_library){ return get_library() })
(function(){
    return (function export_library(){
    	
    	class LibraryItem{
    		constructor(item,type,library){
    			Object.assign(this,get_item(item,library.path))
			    this.type = type
		    }
		    get waits(){ return 'wait' in this }
		    before(success){
		    	if(!this.waits) return success(this)
			    let waits = this.wait.filter(wait=>wait.includes('-'))
			    let ons = this.wait.filter(wait=>wait.includes('-')!==true)
			    return load_waits(()=>load_ons(()=>success(this),...ons),...waits)
		    }
		    after(success){
		    	if(this.type !== 'elements') return success(this)
			    if('name' in this){
				    return window.fxy.when(this.name).then(()=>success(this))
			    }
			    return success(this)
		    }
	    }
		
		//exports
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
			    .then(data=>{
				    if(data.log) console.groupEnd()
			    	window.customElements.define(data.element_name,class extends HTMLElement{constructor(){super()}})
				    return data
			    })
		    
	    }
	    
	    function get_item(item,path) {
		    let data = window.fxy.is.data(item) ? item:{path:item}
		    if(!data.path.includes('http')) data.path = window.fxy.file.url(path,data.path)
		    return data
	    }
	    
	    function get_items(library,type){
		    let items = type in library ? library[type]:[]
		    return items.map(item=>new LibraryItem(item,type,library))
	    }
	    
	    function get_library_data(library){ return window.fetch(`${library.path}/library`).then(response=>response.text()).then(text=>get_library_module(text,library)) }
	
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
	
	
	    function load_elements(library) { return load_items(library,...get_items(library,'elements')) }
	    
	    function load_item(item,library){
		    return new Promise((success,error)=>{
			    return item.before(()=>{
				    return window.fxy.port(item.path, {'from-library': library.name, async:'', defer:''})
				                 .then(()=>item.after(success))
				                 .catch(error)
			    })
		    })
	    }
	    
	    function load_items(library,...items){
		    let count = items.length
		    let loaded = 0
		    return new Promise((success, error)=>{
		    	if(count === 0) return success(library)
			    function next(){
				    for(let i = loaded; i < count; i++){
					    let item = items[i]
					    return load_item(item,library).then(item=>{
					    	if(library.log) console.log(item)
						    loaded++
						    return next()
					    }).catch(e=>{
					    	console.error(`Library Error: ${library.name}`)
						    console.error('item: ',item)
						    console.error(e)
						    return error(e)
					    })
				    }
				    
				    return success(library)
			    }
			    return next()
		    })
	    }
	
	    function load_logic(library) { return load_items(library,...get_items(library,'logic')) }
	    
	    function load_ons(success,...ons){
		    if(ons.length === 0) return success()
		    window.fxy.on(success,...ons)
	    }
	
	    function load_ports(library) {
		    if(library.log) console.groupCollapsed('Library: '+library.name)
		    return load_items(library,...get_items(library,'ports'))
	    }
	    
	    function load_wait(library){
		    return new Promise((success,error)=>{
			    if('wait' in library) return window.fxy.when(...library.wait).then(_=>success(library)).catch(error)
			    return success(library)
		    })
	    }
	
	    function load_waits(success,...waits){
		    if(waits.length === 0) return success()
		    window.fxy.when(...waits).then(()=>success())
	    }
	    
    })()
})

