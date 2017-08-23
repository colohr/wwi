(function(get_button){ return get_button() })
(function(){
    return function export_button(navigator,fxy){
     
        
        //exports
        return load()
	    //shared actions
	    function load(){
    		fxy.external.component({
			    module:'behavior',
			    name:'AriaTrigger'
    		}).then(AriaTrigger=>{
    			
			    navigator.Button = Base => class extends AriaTrigger(Base){
				    constructor(...x){
					    super(...x)
					    this.define('routes',{
						    icon:true,
						    selected(value){
							    if(value !== null) this.aria.selected=true
							    else this.aria.selected=false
						    }
					    })
					    
					    this.setAttribute('tabindex','0')
					    this.setAttribute('role','button')
					    this.aria.selected='false'
					    this.on('aria trigger',e=>{
					    	let data = e.detail.action
						    if(data.activates) this.dispatch(this.event_name,data)
					    })
				    }
				    get event_name(){ return this.hasAttribute('event-name') ? this.getAttribute('event-name'):this.localName.replace('navigator-','') }
			    }
				   
		    })
		    return null
	    }
    }
})