(function(get_pointers){ return get_pointers() })
(function(){
    return function export_pointers(behavior,fxy){
        const Pointers =  Base => class extends Base{
        	get pointers(){ return fxy.require('tool/pointers').element(this) }
        }
	    //load
	    return load()
	    //shared actions
	    function load(){
    		if(fxy.is.defined('tool/pointers')) return Pointers
		    window.wwi.tool('pointers').then(()=>behavior.Pointers=Pointers)
		    return null
	    }
    }
})