(function(get_list){ return get_list() })
(function(){
    return function export_list(browser){
    	//exports
	    return Base => class extends Base{
		    add_item(...x){ return this.sections.add_item(...x) }
		    add_items(...x){ return this.sections.add_items(...x) }
		    add_section(...x){ return this.sections.add_section(...x) }
		    add_sections(...x){ return this.sections.add_sections(...x) }
		    disconnected(){ this.items.forEach(item=>item.style.opacity=0) }
		    get items(){ return this.all('browser-item') }
		    get sections(){ return  browser.types.sections(this) }
		    get uid_prefix(){ return 'browser' }
	    }
    }
})