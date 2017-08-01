(function(get_module){ return get_module() })
(function(){
    return function external_module(behavior,fxy){
	
	    const bound_data = Symbol.for('bound data')
	
        const Bind = Base => class extends Base{
	        bind(data){
		        if(fxy.is.data(data)) {
			        this[bound_data] = data
			        return bind_data(this)
		        }
		        return this
	        }
        }
        
        //exports
        return behavior.Bind = Bind
	
	    //shared actions
	    function bind_data(element){
		    let html = element.shadow.innerHTML
		    let new_html = set_data(html,element[bound_data])
		    element.shadow.innerHTML = new_html
		    return element
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