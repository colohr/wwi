(function(get_action){ return get_action() })
(function(){
    return function export_action(gui,fxy){
	    
        const Element = Base => class extends Base{
	        constructor(){
		        super('routes',{
			        centered(value){
				        if(value !== null) this.view.setAttribute('center-center','')
				        else this.view.removeAttribute('center-center')
			        },
			        disabled(value){
				        if(value !== null) this.aria.disabled=true
				        else this.aria.disabled=false
				        this.do_action('disabled')
			        },
			        selected(value){
				        if(value !== null) this.aria.selected=true
				        else this.aria.selected=false
				        this.do_action('selected')
			        },
			        toggles:true
		        })
	        }
	        a11y_connected(ally){
		        ally.on('click',e=>{
			        if(this.toggles) this.selected = !this.selected
		        })
		        ally.on('keypress',e=>{
			        if(e.activates){
				        if(this.toggles) this.selected = !this.selected
			        }
		        })
	        }
	
	        do_action(name){
		        if(this.has_listener) this.dispatch(name,this)
		        if(`${name}_action` in this) this[`${name}_action`](this)
		        return this
	        }
        }
	    //load
	    return load()
	    //shared actions
	    function load(){
		    return fxy.port(window.components['gui-icon'].index_url).then(()=>fxy.when('gui-icon'))
		              .then(()=>gui.Element = Element).catch(console.error)
	    }
    }
    
	
})
