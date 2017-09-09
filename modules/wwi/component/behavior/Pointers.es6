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
    		if(!fxy.is.nothing(fxy.require('tool/pointers'))) return Pointers
		    window.fxy.port.eval(window.url.wwi('component/logic/pointers.es6'))
		          .then(()=>behavior.Pointers = Pointers)
		          .catch(console.error)
		    return null
	    }
    }
})