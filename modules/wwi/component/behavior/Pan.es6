(function(get_module){ return get_module() })
(function(){
    return function external_module(behavior,fxy){
	
	    const pan_instance = Symbol.for('pan instance in element')
	    const pan_handle = Symbol.for('pan handle')
	    const PanTransform = {};
	
	    PanTransform.update = (element)=>{
		    element.style.transform = `translate3d(${element.dataset.translateX}px,${element.dataset.translateY}px,0) scale3d(${element.dataset.scale},${element.dataset.scale},1)`;
		    return element;
	    }
	
	    PanTransform.translate = (element,x,y)=>{
		    element.dataset.translateX = x;
		    element.dataset.translateY = y;
		    return PanTransform.update(element)
	    }
	
	    PanTransform.scale = (element,scale)=>{
		    element.dataset.scale = scale;
		    return PanTransform.update(element)
		
	    }
	
	    class Pan{
		    static get isInit(){return this.initialized}
		    static stopDrag(e){
			    if(e){
				    if(e.stopPropagation) e.stopPropagation()
				    if(e.preventDefault) e.preventDefault()
			    }
			    document.body.removeAttribute('dragging');
			    document.onmousemove = function(){}
		    }
		    static init(){
			    if(this.isInit) return true;
			    document.dblclick = Pan.stopDrag;
			    return this.initialized=true;
		    }
		    static get center(){
			    return {
				    get width(){return window.innerWidth},
				    get height(){return window.innerHeight},
				    get x(){return this.width/2},
				    get y(){return this.height/2}
			    }
		    }
		    static prepare(element){
			    let t = ['translateX','translateY','scale'];
			    t.forEach(tr=>{
				    if(!(tr in element.dataset)){
					    element.dataset[tr] = tr === 'scale' ? 1:0;
				    }
			    })
			    return element;
		    }
		    constructor(element){
			    Pan.init()
			    this.element=this.constructor.prepare(element)
			    this.x=0
			    this.y=0
			    this.handle.addEventListener('mousedown',this.start.bind(this),false)
			    this.handle.addEventListener('mouseup',this.stop.bind(this),false)
		    }
		    get active(){ return Pan.currentElement === this.element }
		    get handle(){ return get_handle(this) }
		    get width(){return this.element.clientWidth}
		    get height(){return this.element.clientHeight}
		
		    center(){
			    let center = this.constructor.center
			    let w = this.width
			    let h = this.height
			    let x = center.x - w/2
			    let y = center.y - h/2
			    this.move(x,y)
			    let el = this.scale(1)
			
			    return el
			
		    }
		    scale(xy){
			    return PanTransform.scale(this.element,xy)
		    }
		    move(x,y){
			    this.x=x
			    this.y =y
			    PanTransform.translate(this.element,x,y)
		    }
		    start(evt){
			    document.body.setAttribute('dragging','')
			    const pan = this
			    evt = evt || window.event;
			    if(Pan.currentElement) Pan.currentElement.style.zIndex='60'
			    Pan.currentElement = this.element
			    Pan.currentElement.style.zIndex = '105'
			    document.onmousemove = function(evt){
				    evt = evt || window.event;
				    pan.move(pan.x+evt.movementX,pan.y+evt.movementY)
				    if(pan.moving) pan.moving(pan)
			    }
			
			
		    }
		    stop(e){Pan.stopDrag(e) }
		
	    }
    	
        
        //exports
	    behavior.pan = get_pan
        return behavior.Pan = Base => class extends Base{
	        get pan(){ return get_pan(this) }
        }
        
        //shared actions
	    function get_handle(pan){
		    if(pan_handle in pan) return pan[pan_handle]
		    let element = pan.element
		    if('handle' in element && fxy.is.element(element.handle)) return pan[pan_handle] = element.handle
		    if(element.hasAttribute('pan-handle')){
			    let handle
			    if('query' in element && typeof element.query === 'function') handle = element.query(element.getAttribute('pan-handle'))
			    else handle = element.querySelector(element.getAttribute('pan-handle'))
			    if(fxy.is.element(handle)) return pan[pan_handle] = handle
		    }
		    return pan[pan_handle] = element
	    }
	
	    function get_pan(element){
		    if(fxy.is.element(element)){
			    if(pan_instance in element) return element[pan_instance]
			    return element[pan_instance] = new Pan(element)
		    }
		    return Pan
	    }
    }
    
})
