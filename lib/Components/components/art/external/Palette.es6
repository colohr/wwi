(function(get_palette){ return get_palette() })
(function(){
    return function external_module(behavior,fxy){
     
    	const palette = Symbol('Palette')
    	class Palette{
    		constructor(element,name){
    			if(!fxy.is.text(name)) this.palette_name = 'design colors'
			    else this.palette_name = name
		    }
	    }
    	
        const PaletteMix = Base => class extends Base{
            palette(){ return get_palette(this) }
        }
        
        //exports
        return PaletteMix
	    //shared actions
	    function get_options(element){
	    	let options = fxy.is.element(element) ? element.palette_options:element
		    if(!fxy.is.data(options)) options = {  }
		    return Object.assign({
			    number_of_items:10,
			    skip(color){ return color.includes('-bg') || color.includes('-50') }
		    },options)
	    }
	
	    function get_palette(element){
	    	if(palette in element) return element[palette]
		    element[palette] = new Palette(element)
		    set_palette_colors(element)
		    return element[palette]
	    }
	    
	    function set_palette_colors(element){
	    	let options = get_options(element)
		    let number_of_items = options.number_of_items
		    let colors = fxy.require('design/colors')
		    let items = []
		    let increment = 1/number_of_items
		    for(let i=1;i<=number_of_items;i++){
			    for(let color of colors.keys()){
				    if( !skips(options,color) ){
					    let t = parseFloat((i * increment).toFixed(4))
					    let color_value = colors.transparent(color,t)
					    let name = `${color} ${t}`
					    palette[name] = color_value
					    items.push({
						    name:`${color} ${t}`,
						    value:color_value,
						    name_html:`<div body select-all>${color_value}</div>
										<div description sort select-text>${color}</div>
										<div tag>${t}</div>
									   `
					    })
				    }
			    }
		    }
		    
		    if(fxy.is.element(element)) element.dispatch('palette items', items)
		    return element
	    }
	    
	    function skips(options,color){
	    	if(!('skip' in options)) return false
		    else if(!fxy.is.function(options.skip)) return false
		    return options.skip(color)
	    }
    }
})