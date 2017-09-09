(function(get_sort){ return get_sort() })
(function(){
    return function export_sort(behavior,fxy){
    	const Sort = Base => class extends Base{
    		get sort(){ return fxy.require('sort/controller')(this) }
	    }
        //exports
        return load()
        //shared actions
	    function load(){
	    	if(fxy.is.nothing(fxy.require('sort/controller'))===false) return Sort
		    let sort_url = window.url('modules/wwi/component/behavior/classes/Sort.es6')
	    	fxy.port.eval(sort_url).then(_=>behavior.Sort = Sort).catch(console.error)
		    return null
	    }
	    
    }
})