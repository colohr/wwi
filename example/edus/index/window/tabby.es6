/*
tabby is used to see the active element
of a site when using the tab key
because when using customElements
with shadowRoot the document.activeElement
doesnt reflect the correct element
you have to target the shadowRoot.activeElement
 */

(function(root,tabby){ return tabby(root)})(window,function(window){
	
    return function get_tabby_for_window(element){
    	if(!element) return new Error(`use edu.result to set a tabby element`)
	    const tabby = {
	    	element,
		    get active(){
			    var current = this.get(this.element)
			    var active = current
			    for(let i=0;i<100;i++){
				    if(active) current = this.get(active)
				    if(!current) return active
			    }
			    //default element for all sites that use no customElements with shadowRoot
			    return document.activeElement
		    },
		    get(el){
			    if(typeof el === 'object' && el !== null){
				    if('shadowRoot' in el) {
					    let shadow = el.shadowRoot
					    return shadow !== null ? el.shadowRoot.activeElement:null
				    }
			    }
			    return null
		    },
		    keyup(e){
			    let key = e.keyCode || e.which
			    if(key === 9){
				    let active = tabby.active
				    console.group('tabby.active element')
                    console.dir(active)
                    console.log(active)
				    console.groupEnd()
			    }
		    }
	    }
	    
	    window.addEventListener('keyup',tabby.keyup)
	    return tabby
    }
})