(function(get_palette){ return get_palette() })
(function(){
    return function external_module(behavior,fxy){
     
    	const palette = Symbol('Palette')
    	class Palette{
    		constructor(color_css_url,element){
    			if(fxy.is.map(color_css_url)) this.palette_name = 'design colors'
			    else this.palette_name = window.app.source.identity(color_css_url).name
			    get_color_theme(this,color_css_url,element)
		    }
	    }
    	
        const PaletteMix = Base => class extends Base{
            get palette(){ return palette in this ? this[palette]:null }
            set palette(css_url){ return set_palette(this,css_url) }
        }
        
        //exports
	    fxy.exports('design').Palette = Palette
        return PaletteMix
	    //shared actions
	    function get_color_theme(palette_value,palette_url,element){
    		if(fxy.is.map(palette_url)) return done(palette_url)
		    return fxy.require('design/color_theme')(palette_url)
		              .then(done)
		              .catch(e=>palette.error=e)
		    //shared actions
		    function done(theme){
			    let palette_colors = set_palette_colors(palette_value,theme,element)
			    if(fxy.is.element(element)) element.dispatch('palette',element[palette] = palette_colors)
			    return palette_colors
		    }
		
	    }
	    
	    function get_options(element){
	    	let options = fxy.is.element(element) ? element.palette_options:element
		    if(!fxy.is.data(options)) options = {  }
		    return Object.assign({
			    number_of_items:10,
			    skip(color){ return color.includes('-bg') || color.includes('-50') }
		    },options)
	    }
	
	    function set_palette(element,css_url){
		    return new Palette(css_url,element)
	    }
	    
	    function set_palette_colors(palette,theme,element){
	    	let options = get_options(element)
		    let number_of_items = options.number_of_items
		    let colors = fxy.is.map(theme) ? theme:fxy.require('design/colors')
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
		    return List(palette)
	    }
	    
	    function skips(options,color){
	    	if(!('skip' in options)) return false
		    else if(!fxy.is.function(options.skip)) return false
		    return options.skip(color)
	    }
    }
})