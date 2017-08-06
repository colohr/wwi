(function(position){ return position() })
(function(){
    return function external_module(behavior,fxy){
	
	    class Center{
		    constructor(bounds,center){
			    this.width = 0
			    this.height = 0
			    this.top = 0
			    this.left = 0
			    this.y = null
			    this.x = null
			    if(fxy.is.data(bounds)){
				    for(let name in bounds){
					    if(name in this) this[name] = bounds[name]
				    }
			    }
			    if(fxy.is.data(center)){
				    Object.assign(this,center)
			    }
			    if(this.x === null) this.x = this.width / 2
			    if(this.y === null) this.y = this.height / 2
		    }
		    get px(){
			    return new Proxy(this,{
				    get(o,name){
					    if(name in o) {
						    let value
						    if(name === 'x' || name === 'y') value = `translate${name.toUpperCase()}(${o[name]}px)`
						    else value = `${o[name]}px`
						    return value
					    }
					    return 0
				    }
			    })
		    }
	    }
	
	    
        return  Base => class extends Base{
	        center(){
		        let value = get_center_value(this)
		        let px = value.px
		        this.style.top = px.top
		        this.style.left = px.left
		        return value
	        }
	        get center_position(){ return new Center(this.getBoundingClientRect())}
        }
	
	    //shared actions
	    function get_center_value(element){
		    let parent_element
		    if(fxy.is.element(element.parentElement)) parent_element = element.parentElement
		    else parent_element = document.body
		    let parent = new Center(parent_element.getBoundingClientRect())
		    let center = element.center_position
		    let x = parent.x - center.x
		    let y = parent.y - center.y
		    return new Center(null,{left:x,top:y,x,y})
	    }
     
    }
})

