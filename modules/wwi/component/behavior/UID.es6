(function(get_uid){ return get_uid() })
(function(){
    return function export_uid(behavior,fxy){
	    let symbol = fxy.symbols.uid
    	
	    //exports
	    return Base => class extends Base{
		    get fxy_uid(){ return get_uid(this) }
		    get uid(){ return get_uid(this).value }
		    set uid(value){ return set_uid(this,value) }
	    }
	    
	    //shared actions
	    function create_uid(prefix,index){ return { id:fxy.uid(), index, prefix, get value(){ return [this.prefix,this.id,this.index].filter(item=>item !== null).join('-') } } }
	    
	    function get_index(object){
		    if('uid_index' in object) return object.uid_index
		    else if('uid-index' in object) return object['uid-index']
		    else if(fxy.is.element(object) && object.hasAttribute('uid-index')) return object.getAttribute('uid-index')
		    return null
	    }
	
	    function get_prefix(object){
		    if('uid_prefix' in object) return object.uid_prefix
		    else if('uid-prefix' in object) return object['uid-prefix']
		    else if(fxy.is.element(object) && object.hasAttribute('uid-prefix')) return object.getAttribute('uid-prefix')
		    return null
	    }
	    
	    function get_uid(object){
		    if(symbol in object) return object[symbol]
		    return object[symbol] = set_value(object,create_uid(get_prefix(object),get_index(object)))
	    }
	    
	    function set_uid(object,value){
		    if(fxy.is.data(value) && 'id' in value) object[symbol] = set_value(this,value)
		    else if(fxy.is.numeric(value)) object[symbol] = set_value(this,create_uid(null,value))
		    else if(fxy.is.text(value)) object[symbol] = set_value(this,create_uid(value))
		    return object[symbol]
	    }
	    
	    function set_value(element,uid){
		    if(fxy.is.element(element)){
			    let prefix = uid.prefix
			    let index = uid.index
			    if(prefix) element.setAttribute('uid-prefix',prefix)
			    else element.removeAttribute('uid-prefix')
			    if(index) element.setAttribute('uid-index',index)
			    else element.removeAttribute('uid-index')
			    element.setAttribute('uid',uid.value)
		    }
		    return uid
	    }
    }
})