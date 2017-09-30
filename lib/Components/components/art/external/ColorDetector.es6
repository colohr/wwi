(function(get_tracking){ return get_tracking() })
(function(){
    return function export_tracking(art,fxy){
	
	    const color_tracker = Symbol('color tracker')
	    const color_names = new Set()
	    const colors = fxy.require('design/colors')
	    const invalid_colors = ['-bg','-50','-40','-30','-20','-10','-bright','-light','-dark','-black']
	
	
	    class ColorTracker{
	    	constructor(element){
	    		this.element = element
			    window.tracker = this
		    }
		    clear(){
	    		if(this.tracked){
				    let frames = this.frames
				    for(let frame of frames) frame.remove()
				    delete this.tracked
			    }
			    return true
		    }
		    get frames(){ return this.element.all('[color-detector-frame]') }
		    get image(){ return this.element.query('img[color-detector-target]') }
		    start(){
		    	if(!this.tracker) this.tracker = set_color_tracker(this)
			    else start_tracking(this)
			    return this
		    }
	    }
	    
    	const ColorDetector = Base => class extends Base{
			get color_detector(){
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
		    
	        //return value
        	return null
		    
		    //shared actions
		    function colors_registered(){
			    const color_limit = 'color_limit' in art.detector ? art.detector.color_limit:60
        		const tracking = art.detector.tracking
			    
        		for(let name of colors.keys()) if(valid_color(name)) register_color(name)
		        
		        //return value
		        return true
			    
			    //shared actions
			    function color_matches(color){
				    return function check_red_green_blue(red,green,blue){
					    if(red <= color_limit && green <= color_limit && blue <= color_limit) return false
					    let reds = color.red - red
					    if(reds < 0) reds = reds * -1
					    if(reds >= 0 && reds <= color_limit){
						    let blues = color.blue - blue
						    if(blues < 0) blues = blues * -1
						    if(blues >= 0 && blues <= color_limit){
							    let greens = color.green - green
							    if(greens < 0) greens = greens * -1
							    if(greens >= 0 && greens <= color_limit) return true
						    }
					    }
					    return false
				    }
			    }
			    
			    function register_color(name){
				    tracking.ColorTracker.registerColor(name,color_matches(colors.color(name)))
				    return color_names.add(name)
			    }
			    
			    function valid_color(color){
			    	for(let invalid_color in invalid_colors){
			    		if(color.includes(invalid_color)) return false
				    }
				    return true
			    }
		    }
	    }
	    
	    function get_color_tracker(element){
	    	if(color_tracker in element) return element[color_tracker]
		    return element[color_tracker] = new ColorTracker(element)
	    }
	    
	    function get_color_frame({height,width,x,y,color}){
		    color = colors.color(color)
		    let color_shadow = color.value(0.5)
		    let rectangle = document.createElement('div')
		    rectangle.setAttribute('color-detector-frame','')
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
	    
	    function set_color_tracker(controller){
		    const tracker = new art.detector.tracking.ColorTracker(Array.from(color_names))
		    let resizing = null
		    tracker.on('track', on_track)
		    window.app.on('resized',on_resize)
		    
		    if(controller.image.hasAttribute('loaded') === false) controller.image.addEventListener('loaded',on_image_load,false)
		    else on_image_load()
		    //return value
		    return tracker
		    
		    //shared actions
		    function on_image_load(){ start_tracking(controller) }
		    function on_resize(){
		    	if(controller.tracked){
				    controller.clear()
				    if(resizing) resizing = window.clearTimeout(resizing)
				    resizing = window.setTimeout(()=>controller.start(),200)
			    }
		    }
		    function on_track(event){
			    event.data.forEach(function(target) {
				    set_color_frame(controller.element,controller.image,target)
			    })
		    }
	    }
	    
	    function start_tracking(controller){
	    	if('timer' in controller) window.clearTimeout(controller.timer)
		    return controller.timer = window.setTimeout(()=>{
			    window.requestAnimationFrame(()=>{
				    if(!controller.tracked){
					    art.detector.tracking.track(controller.image,controller.tracker)
					    controller.tracked=true
					    delete controller.timer
				    }
			    })
		    })
	    }
	    
	    function set_color_frame(element, image, target){
		    return window.requestAnimationFrame(()=>{
			    target.x += image.offsetLeft
			    target.y += image.offsetTop
			    let view = element.view
			    let frame = get_color_frame(target)
			    view.appendChild(frame)
		    })
	    }
	    
	    
    }
})