(function(get_module){ return get_module() })
(function(){
    return function external_module(){
        return Base => class extends Base {
	        add_class(...x) { return set_class(this,true,...x) }
	        has_class(...x) { return has_class(this,...x) }
	        remove_class(...x) { return set_class(this,false,...x) }
	        toggle_class(name) { return this.has_class(name) ? this.remove_class(name):this.add_class(name) }
        }
    }
    
	//shared actions
	function has_class(element,...names){
		let has = false
		for(let name of names) has = element.classList.contains(name)
		return has
	}
	function set_class(element,value,...x){
    	for(let name of x) element.classList.toggle(name,value)
	    return element
	}
})
