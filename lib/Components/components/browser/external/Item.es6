(function(get_item){ return get_item() })
(function(){
    return function export_item(browser){
	    //exports
        return Base => class extends Base{
		    get data(){ return browser.memory.get(this.section) }
	    }
    }
})