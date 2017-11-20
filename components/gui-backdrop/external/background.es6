(function(get_control){ return get_control() })
(function(){
    return function export_control(gui,fxy){
	    const timer = Symbol('timer')
	    const data_path = window.url(window.components['gui-backdrop'].path,'background/data.json')
        const types = {
	    	collections:null,
	        effects:null,
	        wallpapers:null
        }
        
        const Background = Base => class extends Base{
	    	get_graphic(value){
	    		if(fxy.is.text(value) !== true) return null
	    		let type = this.type || 'collections'
			    let name = this.name
			    if(type in types){
	    			let data = types[type]
				    let list = null
				    if(data.has(name)) list = data.get(name)
				    if(list && value in list) return list[value]
			    }
			    return null
		    }
	        get_graphic_by_index(index){
	    		if(fxy.is.text(index)) index = parseInt(index)
		        if(fxy.is.number(index) !== true) return null
		        let type = this.type || 'collections'
		        let name = this.name
		        if(type in types){
			        let data = types[type]
			        let list = null
			        if(data.has(name)) list = data.get(name)
			        if(list){
			        	let value = list[index]
				        if(value) return value
			        }
		        }
	    		return null
	        }
	        set_background(graphic){
		        if(fxy.is.nothing(graphic)) graphic = get_random(this)
		        let graphic_url = this.url(graphic)
		        this.style.backgroundImage = `url(${graphic_url})`
		        if('style' in graphic) Object.assign(this.style,graphic.style)
		        if(!this.hasAttribute('value') || this.getAttribute('value') !== graphic.name) this.setAttribute('value',graphic.name)
		        if(this.timer) set_timer(this,this.timer)
		        return this
	        }
	        set_timer(value){return set_timer(this,value)}
	        url(graphic){ return get_graphic_url(graphic) }
	        
        }
	
	    //setup
	    load_collections().then(_=>{
		    types.Element = Background
		    return true
	    })
	    
        //exports
        return types
	    
        //shared actions
	    function change_bg(element){
	    	window.requestAnimationFrame(()=>element.set_background())
	    }
	    
	    function clear_timer(bg){
		    if(timer in bg && typeof bg[timer] === 'number') window.clearTimeout(bg[timer])
		    return delete bg[timer]
	    }

		function get_graphic_url(graphic){ return window.url(graphic.path) }
	 
		function get_random(element){
			let type = element.hasAttribute('type') ? element.getAttribute('type'):'collections'
			let name = element.hasAttribute('name') ? element.getAttribute('name'):null
			return get_random_graphic(type,name)
	    }
	    
	    function get_random_graphic(type,name){
			let data = type in types ? types[type]:types.collections
		    if(fxy.is.nothing(name) || !data.has(name)){
				let names = Array.from(data.keys())
			    let index = fxy.random(0,names.length-1)
			    name = names[index]
		    }
		    let items = data.get(name)
		    let graphics = Object.keys(items)
		    let graphic_index = fxy.random(0,graphics.length-1)
		    
		    return items[graphics[graphic_index]]
	    }
	    
	    function load_collections(){
	    	return fetch(data_path).then(response=>response.json()).then(data=>{
			    for(let type in data){
				    for(let name in data[type]){
				    	let items = data[type][name]
					    save_type_data(type,name,items)
				    }
			    }
			    return true
		    })
	    }
	    
	    function save_type_data(type,name,value){
		    if(types[type]===null) types[type] = new Map()
		    types[type].set(name,value)
		    return value
	    }
	    
	    function set_timer(bg,time){
		    if(clear_timer(bg)){
			    time = parseInt(time)
			    if(fxy.is.number(time)) bg[timer] = window.setTimeout(()=>change_bg(bg),time)
		    }
	    }
	    
    }
})