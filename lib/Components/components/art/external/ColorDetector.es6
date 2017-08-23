(function(get_tracking){ return get_tracking() })
(function(){
    return function export_tracking(art,fxy){
	
	    const color_tracker = Symbol('color tracker')
	    const colors = fxy.require('design/colors')
	    const color_names = new Set()
	    const color_limit = 60
	    
	    class ColorTracker{
	    	constructor(element){
	    		let tracking = art.detector.tracking
	    		let tracker = new tracking.ColorTracker(Array.from(color_names))
			    
			    let image = element.query('[target-image]')
			    tracker.on('track', function(event) {
				    event.data.forEach(function(target) {
					    set_frame(element,image,target)
				    });
			    });
	    		
	    		app.on('resized',()=>{
	    			if(this.tracked && this.clear()) this.start()
			    })
			    
			    this.clear = ()=>{
	    			let frames = element.all('[color-detected-frame]')
				    for(let frame of frames) frame.remove()
				    delete this.tracked
				    return true
			    }
			    
			    this.start = ()=>{
			    	if(!this.tracked){
					    tracking.track(image,tracker)
					    this.tracked=true
				    }
				    return this
			    }
		    }
	    }
	    
    	const ColorDetector = Base => class extends Base{
			get color_tracker(){
				return get_color_tracker(this)
			}
	    }
	   
        
        //exports
        return load()
	    //shared actions
	    function load(){
        	art.detector.load().then(_=>{
        		if(colors_registered()) art.ColorDetector = ColorDetector
        		
	        })
        	return null
		    function colors_registered(){
        		let tracking = art.detector.tracking
        		for(let name of colors.keys()){
        			if(name.includes('-50')!==true&&name.includes('-bg')!==true) register_color(name)
		        }
		        //return value
		        return true
			    //shared actions
			    function register_color(name){
				    tracking.ColorTracker.registerColor(name,color_matches(colors.color(name)))
				    return color_names.add(name)
			    }
			    
			    function color_matches(color){
				    return (red,green,blue)=>{
					    if(red <= 50 && green <= 50 && blue <=50) return false
					    let reds = color.red - red
					    if(reds < 0) reds = reds * -1
					    if(reds >= 0 && reds <= color_limit){
						    let blues = color.blue - blue
						    if(blues < 0) blues = blues * -1
						    if(blues >= 0 && blues <= color_limit){
							    let greens = color.green - green
							    if(greens < 0) greens = greens * -1
							    if(greens >= 0 && greens <= color_limit){
								    return true
							    }
						    }
					    }
					    return false
				    }
			    }
		    }
		    
	    }
	    
	    function get_color_tracker(element){
	    	if(color_tracker in element) return element[color_tracker]
		    return element[color_tracker] = new ColorTracker(element)
	    }
	    
	    function set_frame(element, image, target){
		    target.x += image.offsetLeft
		    target.y += image.offsetTop
		    
		    let view = element.view
		    let frame = get_rectangle(target)
		    view.appendChild(frame)
		    return target
	    }
	    
	    function get_rectangle({height,width,x,y,color}){
	    	color = colors.color(color)
		    let color_shadow = color.value(0.5)
		    let rectangle = document.createElement('div')
		    rectangle.setAttribute('color-detected-frame','')
		    Object.assign(rectangle.style,{
		    	width:`${width}px`,
			    height:`${height}px`,
			    position:'absolute',
			    left:`${x}px`,
			    top:`${y}px`,
			    border:`1px solid ${color.value()}`,
			    boxShadow:`0px 0px 4px  ${color_shadow}`,
			    boxSizing:'border-box',
			    borderRadius:'7px',
			    transitionDuration:app.help.numbers.random(100,800)+'ms',
			    transitionDelay:app.help.numbers.random(0,700)+'ms'
		    })
			return rectangle
	    }
    }
})