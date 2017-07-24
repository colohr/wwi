wwi.exports('element',(element,fxy)=>{
	
	const Focus = Base => class extends Base{
		get act(){ return get_act(this) }
		get focused(){ return 'shadowRoot' in this ? this.shadowRoot.activeElement:null }
		get first_focus(){ return this.query('[tabindex="0"]') }
		get supermodel(){ return get_parent_element(this) }
	}
	
	//exports
	element.Focus = Focus
	
	//shared actions
	function get_top_element(element){
		let parent = element.parentNode
		if(parent === null) return null
		else if(parent instanceof ShadowRoot) return element
		else return get_top_element(parent)
	}
	function get_parent_element(element){
		let top_element = get_top_element(element)
		if(top_element && 'offsetParent' in top_element) return top_element.offsetParent
		return null
	}
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
})