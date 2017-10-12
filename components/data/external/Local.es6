(function(get_local){ return get_local() })
(function(){
    return function export_local(data,fxy){
	    const database_value = Symbol('database value')
	    const Local = Base => class extends Base{
		    get database(){ return get_database(this) }
	    }
        
        //exports
        return load()
	    //shared actions
	    function get_database(element){
		    if(database_value in element) return element[database_value]
		    return element[database_value] = new data.LocalDatabase(element.getAttribute('database-name') || 'shared')
	    }
	    function load(){
	    	fxy.on(()=>{
			   data.Local = Local
		    },'fxy.modules.data.local_forage')
		    return null
	    }
    }
})