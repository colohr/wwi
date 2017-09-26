window.fxy.exports('pop-up',(popup)=>{
	const client_rect = Symbol('client rect')
	const position_bounds = Symbol('position bounds')
	const position_data = Symbol('position data')
	
	class Bounds {
		constructor(el) {
			this.element = el instanceof HTMLElement ? el : window.document.body;
		}
		
		get win() {return window.app.boundry}
		
		get clientWidth() {return this.element.clientWidth}
		
		get clientHeight() {return this.element.clientHeight}
		
		get client() {
			if (!this.element[client_rect]) {
				this.element[client_rect] = {
					w: this.clientWidth,
					h: this.clientHeight,
					rect: this.element.getBoundingClientRect()
				}
			}
			return this.element[client_rect];
		}
		
		get rect() {return this.element.getBoundingClientRect()}
		
		get w() {return this.clientWidth}
		
		get h() {return this.clientHeight}
		
		get content(){return 'content' in this.element ? this.element.content:this.rect}
		get height(){return this.content.clientHeight}
		get width(){return this.content.clientWidth}
		
		get boundries() {return this.element.boundries || this.win}
	}
	
	const Position =  Base => class extends Base {
		get positions(){ return get_position_data(this) }
		bounds(element){
			if(element){
				if(position_bounds in element) return element[position_bounds]
				return element[position_bounds] = new Bounds(element)
			}
			return position_bounds in this ? this[position_bounds] : this[position_bounds] = new Bounds(this)
		}
		changing_timeout(){
			if(this.clear_changing_timeout()){
				this.style.transitionProperty = 'top,transform';
				this.changing_time = window.setTimeout(()=>{
					this.clear_changing_timeout()
				},300)
			}
			return this;
		}
		
		clear_changing_timeout(){
			if(typeof this.changing_time === 'number'){
				window.clearTimeout(this.changing_time);
				delete this.changing_time
			}
			this.style.transitionProperty = '';
			return true;
		}
		clear_position(){ return get_clear_position(this) }
		handle_content_size_changed(e,data){
			this.changing_timeout().position()
		}
		position(){
			let target=this.positions.target
			if(target === null) return
			let outs = this.positions.bounds
			let bounds = {
				self:this.bounds(),
				target:this.bounds(target)
			}
			
			let rect = {
				get target(){ return bounds.target.rect },
				get self(){ return bounds.self.rect }
			}
		
			
			//let x = (rect.target.left + (rect.target.width/2)) - (this.clientWidth/2)
			let offset = {}
			offset.x = this.hasAttribute('offset-x') ? parseFloat(this.getAttribute('offset-x')):0
			//if(offset.x !== 0) x += offset.x
			offset.y = this.hasAttribute('offset-y') ? parseFloat(this.getAttribute('offset-y')):0
			let y = get_y(bounds,offset)
			let x = get_x(bounds,offset,this.clientWidth)
	
			
			get_clear_position(this,get_css(x,y,null,null))
			
			let sides = get_object(rect.target)
			sides.right = sides.left + rect.self.width
			bounds.self.sides = get_sides(sides)
			if(bounds.self.sides.right) get_clear_position(this,get_css(null,y,null,outs.right))
		
			if (x <= 0) this.style.left = outs.left
			else if(isNaN(x)) {
				x = rect.target.left - ((this.clientWidth/2) - (rect.target.width/2))
				this.style.left = x+'px'
			}
			return this
		}
		
	}
	
	//exports
	popup.Bounds = Bounds
	popup.Position = Position
	
	//shared actions
	function get_clear_position(element,css){
		if(!css) css={top:'',bottom:'',right:'',left:''}
		return Object.assign(element.style,css)
	}
	
	function get_css(x,y,b,r){
		let left = get_value(x)
		let top = get_value(y)
		let bottom = get_value(b)
		let right = get_value(r)
		return {left,top,bottom,right}
	}
	
	function get_position_data(element){
		if(position_data in element) return element[position_data]
		return element[position_data] = {
			bounds:{top:'5px',left:'5px',right:'5px',bottom:'5px'},
			target:null,
			options:{top:{target:'height'}}
		}
	}
	
	function get_object(rect){
		let o = {}
		o.left=rect.left
		o.right=rect.right
		o.bottom=rect.bottom
		o.top=rect.top
		o.width=rect.width
		o.height=rect.height
		return o
	}
	
	function get_sides(rect){
		let boundry = get_window_boundry()
		return {
			top:rect.top < 0,
			right:rect.right > boundry.width,
			bottom:rect.bottom > boundry.height,
			left:rect.left < 0,
			get outside(){return this.top || this.right || this.bottom || this.left;},
			get inside(){return !this.outside}
		}
	}
	
	function get_value(x){
		if(typeof x === 'number') x = x+'px'
		if(typeof x !== 'string') return 'initial'
		return x
	}
	
	function get_window_boundry(){
		if(window.app && window.app.boundry) return window.app.boundry
		return {width:window.innerWidth,height:window.innerHeight}
	}
	
	function get_y(rects,offset){
		let target = rects.target.rect
		let self = rects.self.rect
		let y = (target.top + target.height) - offset.y
		if( (y + self.height) >= window.innerHeight - offset.y ){
			y = (window.innerHeight-offset.y) - ( self.height  +  target.top )
		}
		if(y <= 0) y = 5
		return y
	}
	function get_x(rects,offset,width){
		let target = rects.target.rect
		let self = rects.self.rect
		let x = offset.x
		let default_x = (rects.target.left + (rects.target.width/2)) - (width/2)
		if(offset.x !== 0) x = offset.x
		else x = default_x
		if( (x + self.width) >= window.innerWidth - offset.x ){
			x = (window.innerWidth-offset.x) - ( self.width  +  target.left )
		}
		if(x <= 0) x = 5
		return x
	}
})