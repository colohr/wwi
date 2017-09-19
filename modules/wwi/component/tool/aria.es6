window.fxy.exports('tool',(tool,fxy)=>{
	let symbol = Symbol.for('aria options')
	
	//exports
	tool.aria = { toggle:aria_toggle }
	
	//shared actions
	function aria_toggle(trigger,target,options){
		options = aria_options(options)
		aria_set({trigger,target},options)
		aria_trigger(trigger)[symbol] = options
		trigger.addEventListener(options.event,aria_toggle_action.bind(target),false)
		return trigger[symbol] = options
	}
	
	function aria_set(elements,options){
		for(let name in elements){
			let option = aria_value(elements[name],options[name])
			if(!option.has) option.value = option.name === 'collapsed' ? true:false
		}
		return options
	}
	
	function aria_trigger(element){
		if(!element.hasAttribute('tabindex')) element.setAttribute('tabindex','0')
		if(!element.hasAttribute('aria-disabled')) element.setAttribute('aria-disabled','false')
		if(element.localName !== 'button' && !element.hasAttribute('role')) element.setAttribute('role','button')
		return element
	}
	
	function aria_options(options){
		if(fxy.is.text(options)) options = { target:{name:options} }
		options = fxy.is.data(options) ? options:{}
		if(fxy.not.trigger(options)) options.trigger = {name:'selected'}
		if(fxy.not.target(options)) options.target = {name:'collapsed'}
		if(fxy.not.event(options)) options.event = 'click'
		return options
	}
	
	function aria_value(element,options){
		let i = `aria-${options.name}`
		return new Proxy(options,{
			get(o,name){
				if(name === 'has') return element.hasAttribute(i)
				else if(name === 'value') return element.getAttribute(i) === 'true'
				else if(name === 'type') return i
				else if(name in o) return o[name]
				return null
			},
			has(o,name){
				if(name === 'value') return element.hasAttribute(i)
				return name in o
			},
			set(o,name,value){
				if(name === 'value') element.setAttribute(i,value)
				else o[name] = value
				return true
			}
		})
	}
	
	function aria_toggle_action(event){
		let item = event.currentTarget
		let options = item[symbol]
		let trigger = aria_value(item,options.trigger)
		let target = aria_value(this,options.target)
		if(trigger.value){
			trigger.value = false
			target.value = target.name === 'collapsed' ? true:false
		}
		else{
			trigger.value = true
			target.value = target.name === 'collapsed' ? false:true
		}
		item.dispatchEvent(new CustomEvent(trigger.type,{bubbles:true,detail:{element:this,value:trigger.value,target}}))
	}
})