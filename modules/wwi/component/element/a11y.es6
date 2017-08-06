wwi.exports('element',(element,fxy)=>{
	
	const a11y_data = Symbol('a11y data')
	const a11y_actions = Symbol('a11y container type actions')
	const a11y_container = Symbol('is a11y container element')
	const a11y_type = Symbol('is a11y custom element type')
	const is_ready = Symbol('a11y type is ready')
	
	const allies = {
		get actions(){
			if(a11y_actions in this) return this[a11y_actions]
			return this[a11y_actions] = new WeakMap()
		},
		get map(){
			if(a11y_data in this) return this[a11y_data]
			return this[a11y_data] = new WeakMap()
		},
		element(e,type){
			if( !has_data(e) ) set_data(e,type)
			return get_data(e)
		}
	}
	
	const ally_types = {
		button:{
			role:'button',
			tabindex:'0',
			triggers:['click','keydown','focus','blur'],
			activates:true
		},
		group:{
			container:true,
			role:'group'
		},
		list:{
			contains:'item',
			role:'listbox',
			tabindex:'0',
			triggers:['keydown','focus','blur'],
			get activates(){
				return {
					type:'item',
					to:'activedescendant',
					on:[ 'click' ],
					triggers:['click','keydown','focus','blur']
				}
			}
		},
		menu:{
			contains:'menuitem',
			role:'menu'
		},
		item:{
			role:'option',
			active:'active',
			tabindex:'0',
			triggers:['click','keydown','focus','blur'],
			activates:true
		},
		menuitem:{
			role:'menuitem',
			tabindex:'0',
			triggers:['click','keydown','focus','blur'],
			activates:true
		}
	}
	
	class Type extends Map{
		constructor(name,container){
			super( get_type_map(name,container) )
			this[is_ready] = set_type_data(this,container)
			set_type_container(this,container)
		}
		get container(){ return this.has('container') ? this.get('container') : null }
		get contains(){ return this.has('contains') ? this.get('contains') : false }
		get name(){ return this.get('name') }
		get role(){ return this.get('role') }
		get tabindex(){ return this.tabs ? this.get('tabindex') : null }
		get tabs(){ return this.has('tabindex') }
		trigger(original){
			original.stopPropagation()
			let target = original.currentTarget
			let container = this.container
			let action = original.type
			let name = this.type.name
			let event = { action, name, original, target, clicks:'activates' in this, custom:(Array.from(this.type.actions.keys()).includes(action)) }
			if(action.includes('key')) event.key = get_ally_key(original)
			if(container === target) event.container = true
			else event.content = true
			if(event.clicks) set_activates( this, event )
			return container.dispatchEvent( new CustomEvent('a11y',{ bubbles:true,  composed:true,  detail:event }) )
		}
		trigger_binder( kind ){
			let type = kind === 'contains.triggers' ? this.get('contains') : this
			let binder = { type, container:this.container   }
			if(this.has('activates')) binder.activates = this.get('activates')
			return binder
		}
		get triggers(){ return this.has('triggers') ? this.get('triggers') : null  }
		get valid(){ return this.name in ally_types }
		//on_name(type){ return `a11y-on-${type}` }
	}
	
	class A11y extends Type{
		constructor(...x){
			super(...x)
			if( this.has('container') ){
				this.container[a11y_container] = true
				this.container.addEventListener('a11y',this.on_action.bind(this),false)
			}
		}
		get actions(){ return get_ally_actions(this) }
		get contents(){ return this.has('contains') ? get_ally_container_contents(this) : null }
		get connected(){ return is_ready in this && this.has('container') }
		add(e){
			if( this.has('contains') !== true ) return e
			if(fxy.is.element(e)){
				let contains = this.contains
				e.setAttribute('role', contains.role)
				if(contains.tabs && !e.hasAttribute('tabindex')) e.setAttribute('tabindex', contains.tabindex)
				console.log({adding:e,role:contains.role,tabindex:contains.tabs})
				let kind = 'contains.triggers'
				if( this.has(kind) && !this.contents.has(e) ){
					this.on( kind, e).contents.add(e)
				}
			}
			return e
		}
		dump(){
			if( this.has('contents') && this.contents.size === 0) this.delete('contents')
			return this
		}
		off( kind, target ){
			if( fxy.is.text(kind) && fxy.is.element(target) ){
				let binder = this.trigger_binder(kind)
				let content = this.get(kind)
				for (let type in content) {
					target.removeEventListener( type, this.trigger.bind(binder), false)
				}
			}
			else this.actions.delete( kind )
			return this
		}
		on( kind, target ){
			if( fxy.is.function( target ) ) this.actions.set( kind, target )
			else if( fxy.is.text( kind ) && fxy.is.element( target ) ){
				let binder = this.trigger_binder( kind )
				let actions = this.get( kind )
				for(let type of actions){
					target.addEventListener( type, this.trigger.bind(binder), false)
				}
			}
			return this
		}
		on_action(e){
			let event = e.detail
			let action = event.action
			let has_action = has_ally_actions(this) && this.actions.has(action)
			if( has_action ) this.actions.get(action)(event)
			//console.group(this.name+' '+action)
			//console.warn(event.type+' not set from root')
			//console.log('has_action: ',has_action)
			//console.dir(event)
			//console.groupEnd()
			return undefined
		}
		remove(e){
			if(e !== null && e instanceof HTMLElement && this.has('contents')){
				let kind = 'contains.triggers'
				if( this.has(kind) && this.contents.has(e) ) {
					this.off(kind, e).contents.delete(e)
				}
			}
			return e
		}
	}
	
	
	//==============================================
	//----------------wwi memory--------------------
	
	
	//-----------------wwi dependent----------------
	const A11yMix = Base => class extends Base{
		get [fxy.symbols.a11y.element](){
			if(allies.map.has(this)) return fxy.symbols.a11y.type
			else if(this.hasAttribute('kind') || 'kind' in this) return fxy.symbols.a11y.kind
			return fxy.symbols.a11y.is
		}
		get a11y(){ return get_data(this) }
		set a11y(name){ return set_data(this,name) }
		get ally(){ return this.a11y }
	}
	
	A11yMix.change = change_element
	A11yMix.connect = connect_element
	A11yMix.disconnect = disconnect_element
	A11yMix.is = allies.is
	
	//---------------a11y exports-------------------
	element.a11y = A11yMix
	wwi.ally = new Proxy(ally_event,{
		get(o,name){
			if(name in o) return o[name]
			return function event(e){ return ally_event(e,name)}
		}
	})
	
	function ally_event(original,name,clicks){
			let target = original.currentTarget
			let action = original.type
			return {
				action,
				name,
				original,
				target,
				get currentTarget(){return this.target},
				clicks:typeof clicks !== "boolean" ? name.includes('click'):clicks,
				custom:true,
				get key(){ return get_ally_key(this.original)},
				event(name){ return new CustomEvent(name,{bubbles:true,composed:true,detail:this}) },
				get activates_siblings(){
					return get_activates_siblings(this)
				},
				activate(){
					return get_activates_key(this)
				}
			}
	}
	
	//--------------tricycle----------------
	function change_element({el,name,old,value}){
		console.log({el,name,old,value})
		return el
	}
	function connect_element(e){
		var kind = e.hasAttribute('kind') ? e.getAttribute('kind') : null
		if(kind === null && 'kind' in e){
			kind = e.kind
			e.setAttribute('kind',kind)
		}
		if(kind) e.a11y = kind
		
		if('a11y_connected' in e) e.a11y_connected(e.a11y)
		return e
	}
	function disconnect_element(e){
		if( has_data(e) ){
			let type = get_data(e)
			let actions = delete_ally_actions(type)
			if(type.connected){
				type.container.removeEventListener('a11y',type.on_action.bind(type),false)
			}
			if( type.has('contents') ){
				let contents = type.get('contents')
				let binder = type.trigger_binder( 'contains.triggers' )
				for(let content of contents) type.remove(content)
				if('a11y_disconnected' in e) e.a11y_disconnected({type,contents})
			}
			type.dump()
		}
		return undefined
	}
	
	//-------------a11y actions-------------
	function delete_ally_actions(type){
		if(has_ally_actions(type)) {
			let actions = get_ally_actions(type)
			allies.actions.delete(type)
			return actions
		}
		return null
	}
	function get_ally_actions(type){
		if(has_ally_actions(type)) return allies.actions.get(type)
		allies.actions.set(type, new Map())
		return allies.actions.get(type)
	}
	function get_ally_container_contents(type){
		if(type.has('contents')) return type.get('contents')
		return type.set('contents',new Set())
	}
	function get_ally_key(e){
		let alt = e.altKey || null
		let code = e.keyCode || e.which || e.charCode || null
		let control = e.ctrlKey || null
		let meta = e.metaKey || null
		let name = 'code' in e ? e.code.toLowerCase().replace('key','').replace('arrow','') : null
		let shift = e.shiftKey || null
		let key = 'key' in e ? e.key:null
		let type = e.type
		let action = type.replace('key','')
		return {
			action,
			alt,
			code,
			control,
			key,
			meta,
			name,
			shift,
			type,
			get activates(){
				switch(this.name){
					case 'space':
					case 'spacebar':
					case 'enter':
						return true
						break
				}
				return false
			},
			toString(){ return `${this.action}:${this.name}` },
			valueOf(){ return this.toString() }
		}
		
	}
	
	function has_ally_actions(type){ return a11y_actions in allies && allies.actions.has(type) }
	
	//--------------activates actions-----------------
	function get_activates_key(event){
		//activate or move to element when event is from keyboard
		if('key' in event){
			let sibs = get_activates_siblings(event)
			switch (event.key.name){
				case 'down':
				case 'right':
					if(sibs.after) sibs.after.focus()
					break
				case 'up':
				case 'left':
					if(sibs.before) sibs.before.focus()
					break
				case 'enter':
				case 'space':
					return true
					break
			}
		}
		return false
	}
	function get_activates_siblings(event){
		let target = event.target
		let after = target.nextElementSibling
		let before = target.previousElementSibling
		let out = {}
		if(is_key_target(after)) out.after = after
		if(is_key_target(before)) out.before = before
		return out
		function is_key_target(e){
			if(e === null || !(e instanceof HTMLElement)) return false
			if(e.hasAttribute('tabindex')) return e.getAttribute('tabindex') !== '-1'
			return false
		}
	}
	function get_activates_target_id(event){
		var target_id = event.target.hasAttribute('id') ? event.target.getAttribute('id') : null
		if(target_id === null){
			target_id = `${event.name}-${event.original.timeStamp.toFixed(0)}`
			event.target.setAttribute('id',target_id)
		}
		return target_id
	}
	function set_activates(trigger,event){
		let activates = trigger.activates
		let target = event.target
		let key_activate = get_activates_key(event)
		//console.log({key_activate,trigger,event})
		if(typeof activates === 'object'){
			let on = activates.on || '*'
			if(on === '*' || on.includes(event.original.type) || key_activate){
				let as = activates.as || 'active' //attribute to toggle in target - if defined its the aria-`as`
				let to = activates.to //set the aria-`to` attribute in container to target id
				if(to){
					if(to in trigger.container) trigger.container[to].removeAttribute(as)
					let target_id = get_activates_target_id(event)
					trigger.container.setAttribute(`aria-${to}`,target_id)
					trigger.container[to] = target
				}
				return set_activates_attribute(event,as)
			}
		}
		if(key_activate && !event.custom){
			console.log('will trigger target.click from key')
			event.target.click()
		}
		
		return event
	}
	function set_activates_attribute(event,as){
		if(event.target.hasAttribute(as)) {
			event.target.removeAttribute(as)
			event.disactivated = true
		}else{
			event.target.setAttribute(as,'')
			event.activated = true
		}
		return event
	}
	
	//----------------data actions--------------------
	function delete_data(el){
		return allies.map.delete(el)
	}
	function get_data(el){
		return allies.map.has(el) ? allies.map.get(el):null
	}
	function has_data(el){
		return allies.map.has(el)
	}
	function set_data(el,type){
		return allies.map.set(el, new A11y(type,el))
	}
	
	//-------------type actions-----------------------
	function get_type_map(name,container){
		let map = []
		name = typeof name === 'string' ? name : 'nil'
		map.push(['name', name])
		if( container instanceof HTMLElement) map.push(['container',container])
		return map
	}
	function set_type_data(type,container){
		let data = type.valid ? ally_types[type.name] : {}
		for(let name in data) set_type_value(name,data[name],type)
		return true
	}
	function set_type_value(name,value,type){
		switch (name){
			case 'contains':
				type.set('contains', new Type(value))
				break
			case 'triggers':
				type.set('triggers', new Set(value))
				break
			case 'activates':
				type.set('activates',value)
				if(typeof value === 'object' && value.triggers) type.set('contains.triggers',new Set(value.triggers || []))
				break
			default:
				type.set(name,value)
				break
		}
		return type
	}
	function set_type_container(type,container){
		if(container instanceof HTMLElement){
			container.setAttribute('role',type.role)
			if(type.tabs) container.setAttribute('tabindex',type.tabindex)
			if(type.has('triggers')){
				let binder = type.trigger_binder()
				for(let name of type.triggers) {
					container.addEventListener(name, type.trigger.bind(binder), false)
				}
			}
		}
		return type
	}
	
	
})
