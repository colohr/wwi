(function(get_module){ return get_module() })
(function(){
    return function external_module(behavior,fxy){
    	const binding = Symbol.for('data binding')
	    const bound_data = Symbol.for('bound data')
	    
	    class Binding{
	    	constructor(element){
			    let bind_target = element.hasAttribute('bind-target') ? element.query(element.getAttribute('bind-target')):element.shadow
	    		this.template = bind_target.innerHTML
			    
				   
			    this.render = data=>{
	    			if(fxy.is.data(data)){
					    this[bound_data] = data
					    bind_target.innerHTML = set_data(this.template,data)
					    element.dispatch('bind',this)
				    }
				    return element
			    }
		    }
		    get data(){ return bound_data in this ? this[bound_data]:null }
	    }
        
        //exports
        return Base => class extends Base{
	        get binding(){ return get_binding(this) }
	        bind(data){ return this.binding.render(data) }
        }
	
	    //shared actions
	    function get_binding(element){
    		if(binding in element) return element[binding]
		    return element[binding] = new Binding(element)
	    }
	
	    function get_data_name(str){
		    if(str.indexOf('${') === -1) return null
		    return str.substring(str.lastIndexOf("${")+2,str.lastIndexOf("}"))
	    }
	
	    function set_data(html,data){
		    let data_name = get_data_name(html)
		    if(data_name === null) return html
		    let dot_notation = fxy.dot(data_name)
		    let data_value = dot_notation.value(data) || ''
		    let reg_name = ['\$\{',data_name,'\}'].join('')
		    html = html.replace(reg_name,data_value)
		    return set_data(html,data)
	    }
	    
    }
})