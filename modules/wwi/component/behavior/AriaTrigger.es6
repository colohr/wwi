(function(get_aria_trigger){ return get_aria_trigger() })
(function(){
    return function external_module(){
     
    	const types = Symbol.for('code types')
	    
    	const codes = {
    		activate:{
    			[types]:['click','mouseup'],
    			enter:13,
			    space:32
		    },
		    deactivate:{
    			escape:null
		    },
		    tab:{
    			tab:null
		    }
    	}
    	const action_items = get_items()
    	
    	const actions = new Proxy(codes,{
		    get(o,name){
				switch(name){
					case 'items':
						return action_items
						break
					default:
						if(action_items.has(name)) return action_items.get(name)
						break
				}
				if(name in o) return o[name]
				return null
		    }
	    })
    	
    	const AriaTrigger = Base => class extends Base{
    	    get_action(event){ return get_action(event) }
    	    on_trigger(event){ return on_action(this,event) }
    	    connected(){ connect_element(this) }
	    }
	    
	    //exports
        return AriaTrigger
	    
	    //shared actions
	    function connect_element(element){
		    if(!element.hasAttribute('tabindex')) element.setAttribute('tabindex','0')
		    if(!element.hasAttribute('role')) element.setAttribute('role','link')
		    element.onclick = e => element.on_trigger(e)
		    element.onkeydown = e => element.on_trigger(e)
		    return element
	    }
	    
	    function get_action(event){
		    if(!(event instanceof Event)) return {event}
		    let code = get_code(event)
		    let type = get_type(event)
		    let action = null
		    if(type !== null) action = actions[type]
		    if(action === null) action = actions[code]
		    if(action === null) return {event}
		    return {
			    action_type:action.type,
			    get activates(){ return this.action_type === 'activate' },
			    code,
			    event,
			    input:action.pointer ? 'pointer':'keyboard',
			    name:action.name,
			    get target(){ return get_target(this.event) },
			    type
		    }
	    }
	    
	    function get_code(event){
	    	if('keyCode' in event) return event.keyCode
		    else if('which' in event) return event.which
		    return null
	    }
	    
	    function get_items(){
	    	let items = []
		    for(let type in codes){
	    		let data = codes[type]
			    let item = {type}
			    for(let name in data){
	    			item={type}
	    			if(typeof name === 'string'){
					    item.name = name
					    item.code = data[name]
					    item.keyboard = true
					    if(item.code !== null) items.push([`${item.code}`,item])
					    items.push([item.name,item])
				    }
			    }
			    if(types in data){
				    
				    for(let pointer of data[types]){
					    item={type}
					    item.pointer = true
					    item.name = pointer
					    items.push([item.name,item])
				    }
			    }
			    
		    }
		    return new Map(items)
	    }
	    
	    function get_target(event){
	    	let target = event.currentTarget !== null ? event.currentTarget:null
		    if(target === null){
			    target = event.target !== null ? event.target : event.srcElement
		    }
		    return target
	    }
	
	    function get_type(event){
		    if('type' in event) return event.type
		    return null
	    }
	
	    function on_action(element,event){
		    let action = get_action(event)
		    let trigger = element.hasAttribute('trigger') ? element.getAttribute('trigger'):null
		    let detail = { action,  trigger }
		    if(trigger && action.activates){
			    switch(trigger){
				    case 'open':
				    case 'link':
				    case 'hash':
					    let link_url = element.getAttribute('url')
					    if(link_url !== null) {
						    if(trigger === 'open') window.open(link_url,"_blank")
						    else if(trigger === 'hash') window.location.hash = link_url
						    else window.location.href = link_url
					    }
					    break
				    case 'dispatch':
					    element.dispatch(trigger,detail)
					    break
			    }
		    }
		    else element.dispatch('aria trigger',detail)
	    }
    }
})