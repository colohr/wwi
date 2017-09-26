(function(get_struct_client){ return get_struct_client() })
(function(){
    return function export_struct_client(struct,fxy){
	    const struct_options = Symbol('struct options')
        const ElementMix = Base => class extends Base{
		    connectedCallback(){
		    	try{ super.connectedCallback() }catch(e){}
			    if(this.hasAttribute('struct-actions')){
				    window.setTimeout(()=>{
					    if('ready' in this) fxy.on(()=>this.ready(),this,'struct.actions')
					    struct.load.actions(this.getAttribute('struct-actions')).then(actions=>this.struct.actions=actions)
				    },500)
			    }
		    }
	        get client(){ return get_client(this) }
	        get struct(){ return struct.get(this) }
	        get struct_options(){ return struct_options in this ? this[struct_options]:null }
	        set struct_options(value){ return this[struct_options] = value }
        }
        
        //load
        return ElementMix
        
        //shared actions
	    function get_client(element){ return struct.client(element.struct) }
	    
    }
})