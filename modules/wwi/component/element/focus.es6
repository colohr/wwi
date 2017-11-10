window.fxy.exports('element',(element_exports,fxy)=>{
	const element_overlay = Symbol('element overlay')
	const Focus = Base => class extends Base{
		get act(){ return get_act(this) }
		get focused(){ return 'shadowRoot' in this ? this.shadowRoot.activeElement:null }
		get first_focus(){ return this.query('[tabindex="0"]') }
		get supermodel(){ return get_parent_element(this) }
	}
	
	//exports
	element_exports.focus = Focus
	element_exports.overlay = get_overlay
	
	//shared actions
	function get_act(element){
		return new Proxy({
			parent_element:get_parent_element(element),
			element
		},{
			get(o,name){
				for(let i in o){
					let target = o[i]
					if(fxy.is.element(target)){
						if(name in target && fxy.is.function(target[name])){
							return (event)=>{
								let ally_action = wwi.ally[event.type](event)
								return target[name](ally_action)
							}
						}
					}
				}
				return (event)=>{
					console.warn(`WorldWideInternet window.act warning!`)
					console.error(`act not found for name ${name}`)
					console.log(event.currentTarget)
					console.log(event)
					console.log(o)
				}
			}
		})
	}
	function get_overlay(element){
		if(element_overlay in element) return element[element_overlay]
		return element[element_overlay] = overlay_focus(element)
	}
	function get_parent_element(element){
		let top_element = get_top_element(element)
		if(top_element && 'offsetParent' in top_element) return top_element.offsetParent
		return null
	}
	function get_top_element(element){
		let parent = element.parentNode
		if(parent === null) return null
		else if(parent instanceof ShadowRoot) return element
		else return get_top_element(parent)
	}
	function overlay_focus(element){
		let is_active = false
		let overlay = {
			get active(){ return is_active },
			set active(value){ return value === true ? overlay_on():overlay_off() },
		}
		//return value
		return overlay
		//shared actions
		function close_action(){
			if(overlay.on_close) overlay.on_close()
			overlay_off()
		}
		function close_action_by_key(event){
			event.stopPropagation()
			let code = event.keyCode || event.which
			if(code === 27) close_action()
		}
		function prevent_mouse_down(e){
			if(e.stopPropagation) e.stopPropagation()
			if(e.preventDefault) e.preventDefault()
			return false
		}
		function overlay_off(){
			if(!is_active) return is_active
			element.removeEventListener('mousedown',prevent_mouse_down,false)
			window.removeEventListener('mousedown',close_action,false)
			window.removeEventListener('keyup',close_action_by_key,false)
			return is_active = false
		}
		function overlay_on(){
			if(is_active) return is_active
			element.addEventListener('mousedown',prevent_mouse_down,false)
			window.addEventListener('mousedown',close_action,false)
			window.addEventListener('keyup',close_action_by_key,false)
			return is_active = true
		}
	}
})