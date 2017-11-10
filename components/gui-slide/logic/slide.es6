window.fxy.exports('gui-slide',(gui_slide,fxy)=>{
	const design_of = fxy.require('element/design_of')
	
	const Slide = {
		moving:false,
		right_click:null
	}
	
	const Slider = Base => class extends Base{
		get bar(){ return this.query('[gui-slide][bar]') }
		connected(){
		
			this.define('routes',{
				active:true,
				value(value){
					let percent = fxy.is.number(value) ? value:0
					this.dispatch('change',{value:percent})
				}
			})
			
			this.addEventListener('mousedown', mouse_down, false)
			this.addEventListener('mousemove', mouse_move, false)
			this.addEventListener('mouseenter', mouse_enter, false)
			this.addEventListener('mouseleave', mouse_leave, false)
			if(typeof super.connected === 'function') super.connected()
			//this.addEventListener('click', e => e.stopPropagation(), false)
		}
		get handle(){ return this.query('[gui-slide][bar] > [handle]') }
	}
	
	
	//load
	document.documentElement.addEventListener('mouseup', remove_slide, false)
	
	//exports
	gui_slide.Slider = Slider
	
	//shared actions
	function clear_leave_timeout(target){
		if('leave_timeout' in target){
			window.clearTimeout(target.leave_timeout)
			delete target.leave_timeout
		}
		return true
	}
	
	function get_x(e, target) {
		let slider = design_of(target.handle)
		let x = e.clientX - slider.offset().left
		let x_offset = x + window.pageXOffset
		let x_percentage = x_offset * 100 / slider.parentNode.offsetWidth
		if(x_percentage >= 100) x_percentage = 100
		return Math.round(x_percentage)
	}
	
	function is_right_click(e){ return e.which === 3 }
	
	function mouse_down(e) {
		Slide.target = e.currentTarget
		let activate = Slide.target.is_lock ? Slide.target.movable:true
		if(activate){
			Slide.right_click = is_right_click(e)
			Slide.target.active = Slide.moving = !Slide.right_click
		}
		if(!Slide.target.is_lock) mouse_move(e)
	}
	
	function mouse_enter(e){
		let target = e.currentTarget
		clear_leave_timeout(target)
	}
	
	function mouse_leave(e){
		let target = e.currentTarget
		if(clear_leave_timeout(target)){
			target.leave_timeout = window.setTimeout(()=>remove_slide(e),1000)
		}
	}
	
	function mouse_move(e) {
		e.preventDefault()
	
		let target = e.currentTarget
		let activate = target.is_lock ? target.movable:true
		if (activate && Slide.moving && !Slide.right_click) {
			let x = get_x(e, target)
			target.value = x
			target.handle.style.width = `${x}%`
		}
	}
	
	function remove_slide() {
		if(!Slide.target) return
		Slide.target.active = !(Slide.moving && !Slide.right_click)
		Slide.target.movable=false
		if(Slide.target.is_lock) Slide.target.dispatch('toggle')
		Slide.moving = false
		delete Slide.target
	}
	
})
