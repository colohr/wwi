(function(get_search){ return get_search() })
(function(){
    return function export_search(search,fxy){
     
    	const controller = Symbol('search controller')
	    
    	const Container = Base => class extends Base{
		    get search(){ return get_search(this) }
		    
	    }
        //exports
        return load_search()
	    //shared actions
	    function load_search(){
		    if(!fxy.is.defined('components-search-library')) fxy.port(components.search.url+'/index.html').then(_=>fxy.when('search-component')).then(_=>search.Container = Container)
		    else search.Container = Container
		    return null
	    }
	    
	    function get_search(element){
		    if(!(controller in element)) element[controller] = new search.Controller(get_search_field(element))
		    return new Proxy(element[controller],{
		    	get(o,name){
		    		let value = null
		    		if(name in o){
		    			value = o[name]
					    if(typeof value === 'function') value = value.bind(o)
				    }
				    if(value === null){
		    			if(name in o.field){
						    value = o.field[name]
						    if(typeof value === 'function') value = value.bind(o.field)
					    }
				    }
				    return value
			    },
			    set(o,name,value){
		    		o[name] = value
				    return true
			    }
		    })
	    }
	    
	    function get_search_field(element){
		    let search_element = element.query('search-component')
		    if(search_element === null) search_element = set_element()
		    //return value
		    return search_element
		    //shared actions
		    function set_element(){
			    search_element = document.createElement('search-component')
			    search_element.on.search = e => element.search.action({event:e,container:element})
			    search_element.button = document.createElement('navigator-search')
			    element.view.appendChild(search_element.button)
			    let buttons = get_buttons()
			    for(let button of buttons) search_element.appendChild(button)
			    element.view.appendChild(search_element)
			    return search_element
		    }
		    function get_buttons(){
			    let clear_button = document.createElement('navigator-clear')
			    clear_button.setAttribute('up','')
			    clear_button.setAttribute('search-close-button','')
			    clear_button.slot = 'close-button'
			    return [clear_button]
		    }
	    }
    }
})