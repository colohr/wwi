(function(export_scroll){ return export_scroll() })
(function(){
    return function external_module(){
    	const scrolling = Symbol('scrolling')
	    const scroll_watcher = Symbol('scroll watcher')
        const Mix = Base => class extends Base{
        	get watch_scroll(){ return this[scroll_watcher] }
        	set watch_scroll(value){
        		if(value) this[scroll_watcher] = bind_scroll(this,value)
		        return this[scroll_watcher]
	        }
        }
        
        return Mix
	    //shared actions
	    
	    function clear_timer(list){
    		if(scrolling in list){
    			if(typeof list[scrolling] === 'number'){
    				window.clearTimeout(list[scrolling])
				    delete list[scrolling]
			    }
		    }
		    return true
	    }
	    function on_scroll_finished(){
		    delete this.list[scrolling]
		    this.list.style.pointerEvents = ""
		    this.list.scrolling = false
		    if('on_scroll' in this.list) this.list.on_scroll()
		    else this.list.dispatchEvent(new CustomEvent('scroll',{bubbles:false,composed:true,detail:this}))
	    }
	    
	    function on_scroll(e) {
	    	let target = this
		    target.list.style.pointerEvents = "none !important"
		    target.list.scrolling = true
		    if (clear_timer(target.list)) {
			    window.requestAnimationFrame(function () {
				    target.list[scrolling] = window.setTimeout(on_scroll_finished.bind(target), 200)
			    })
		    }
	    }
	    function bind_scroll(list,element){
	    	if(!element) element = list
		    element.addEventListener('scroll', on_scroll.bind({list,element}), false)
		    return true;
	    }
	    
	    
    }
})