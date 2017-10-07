window.fxy.exports('element',(element,fxy) => {
	const ally_triggers =  [13,32]
	const pointers = Symbol.for('pointers data')
	const pointable = {'click': true, 'down': true, 'up': true, tap: true}
	
	class Action {
		constructor(type, is_pointer) {
			this.type = type
			if (is_pointer) this.is_pointer = is_pointer
		}
		connect(element) {
			if (!(element instanceof HTMLElement)) return element
			if (this.valid && this.eventListener) element.addEventListener(this.original_type || this.type, this.eventListener, false)
			return element
		}
		disconnect(element) {
			if (!(element instanceof HTMLElement)) return element
			if (this.valid && this.eventListener) element.removeEventListener(this.original_type || this.type, this.eventListener, false)
			return element
		}
		dispatch(detail, target, element) {
			target.dispatchEvent(this.event(detail))
			return element
		}
		event(detail) { return Listener.event(this.type, detail) }
		get eventListener() { return this.elementEventListener || null }
		set eventListener(callback) {
			const event_listener_callback = callback
			const block = this
			this.elementEventListener = function event_listener(e) {
				let is_ally = is_ally_trigger(e)
				if (block.is_pointer || is_ally) Pointer.event(is_ally ? e.detail.original : e)
				return event_listener_callback(e)
			}
			return this.elementEventListener
		}
		get valid() { return this.type && typeof this.type === 'string' }
	}
	
	class Listener {
		static disconnect(element){ return delete_listener(element) }
		static event(type,detail){ return new CustomEvent(type,{bubbles:true,composed:true,detail}) }
		constructor() {}
		callback(type, eventListener, is_pointer) {
			let block
			if (this.has_callbacks && this.callbacks.has(type)) block = this.callbacks.get(type)
			else {
				block = new Action(type, is_pointer)
				if (!block.valid) throw new TypeError('Invalid Element Callback Type: ' + type)
				if (typeof eventListener === 'function') block.eventListener = eventListener
				this.callbacks.set(type, block)
			}
			return block
		}
		get callbacks() { return get_callbacks(this) }
		delete_all(type){ return this.has(type) ? this.callbacks.delete(type):false }
		disconnect(element) {
			if (this.has_callbacks) for (let action of this.callbacks) action[1].disconnect(element)
			return element
		}
		dispatch(type, detail, target, element) {
			if (!target) target = element
			if (this.has_callbacks && this.callbacks.has(type)) return this.callback(type).dispatch(detail, target, element)
			else target.dispatchEvent(Listener.event(type, detail))
			return element
		}
		get(type){ return this.has(type) ? this.callbacks.get(type):false }
		has(type){ return this.has_callbacks && this.callbacks.has(type) }
		get has_callbacks() { return has_callbacks(this) }
		off(type, element, delete_all) {
			if (!this.has_callbacks) return this
			if (!this.callbacks.has(type)) return this
			this.callback(type).disconnect(element)
			if(delete_all === true) this.delete_all(type)
			return element
		}
		on(type, callback, element) {
			let pointers = this.pointers
			let pointer = pointers[type]
			let name = type
			if (pointer) {
				if (typeof pointer === 'string') name = pointer
				if (typeof callback !== 'function') {
					if (name !== type) pointer = pointers[name]
					if (typeof pointer === 'function') callback = pointer
				}
			}
			
			let is_pointable = pointable[type]
			if (is_pointable && 'aria' in element) {
				let aria = element.aria
				if (!element.hasAttribute('role')) aria.role = 'button'
				if (!element.hasAttribute('tabindex')) aria.tabindex = '0'
			}
			
			let custom_type = name
			if(name !== type) custom_type = type
			let callback_block = this.callback(custom_type, callback, is_pointable)
			if(name !== custom_type) callback_block.original_type = name
			return callback_block.connect( element )
		}
		
		get pointers() {
			let events = fxy.require('element/memory').Events
			return new Proxy(this,{
				get(o,name){
					if (name in events) return events[name][0]
					return o[name]
				}
			})
		}
	}
	
	//exports
	element.actions = Base => class extends Base {
		a11y_callback(e){ /*console.log('a11y event',e)*/ }
		dispatch(type, detail, target) {
			let event
			if (type instanceof CustomEvent) event = type
			if (target instanceof HTMLElement) {
				if (!detail) detail = {owner: this}
				else detail.owner = this
			}
			else if (type && typeof type === 'string') {
				if (!this.has_listener) event = Listener.event(type, detail)
				else return this.listener.dispatch(type, detail, target, this)
			}
			if (event) {
				if (target instanceof HTMLElement) target.dispatchEvent(event)
				else this.dispatchEvent(event)
			}
			return this
		}
		get has_listener() { return has_listener(this) }
		get listener() { return get_listener(this) }
		off(type, callback) {
			if (typeof callback === 'function') this.removeEventListener(type, callback, false)
			else if (this.has_listener) return this.listener.off(type, this, typeof callback === 'boolean' ? callback:true)
			return this
		}
		get on(){ return get_on(this) }
	}
	
	//exports
	element.listener = Listener
	element.pointer = Pointer
	
	//shared actions
	function a11y_callback(element,callback){
		return function a11y_event_callback(e){
			let a11y = a11y_event(e)
			if(a11y) element.dispatch('a11y',a11y)
			return callback(e)
		}
	}
	function a11y_code(event){
		let code = event.charCode || event.keyCode
		return code === 32 || code === 13
	}
	function a11y_event(event){
		let a11y = a11y_type(event.type)
		if(a11y){
			return new CustomEvent('a11y',{
				bubbles:true,
				detail:{
					a11y,
					code:a11y_code(event),
					event
				}
			})
		}
		return false
	}
	function a11y_type(type){
		switch (type){
			case 'click':
			case 'keypress':
				return type
				break;
		}
		return false
	}
	
	function delete_listener(element){
		let memory = fxy.require('element/memory')[fxy.symbols.listener]
		if (!memory.has(element)) return element
		memory.get(element).disconnect(element)
		memory.delete(element)
		return element
	}
	
	function get_callbacks(listener){
		let memory = fxy.require('element/memory')[fxy.symbols.actions]
		if (!has_callbacks(listener)) memory.set(listener, new Map())
		return memory.get(listener)
	}
	
	function get_listener(element){
		let memory = fxy.require('element/memory')[fxy.symbols.listener]
		if (!memory.has(element)) memory.set(element, new Listener())
		return memory.get(element)
	}
	
	function get_on(element){
		return new Proxy(listener_on(element),{
			deleteProperty(o,name){
				return delete o.cast[name]
			},
			get(o,name){
				return o.cast[name]
			},
			has(o,name){
				return name in o.cast
			},
			set(o,name,value){
				return o.cast[name] = value
			}
		})
	}
	
	function has_listener(element){ return fxy.require('element/memory')[fxy.symbols.listener].has(element) }
	function has_callbacks(listener){ return fxy.require('element/memory')[fxy.symbols.actions].has(listener) }
	
	function is_ally_trigger(e){
		if(e.type === 'a11y'){
			let detail = e.detail
			if('action' in detail && detail.action === 'keydown'){
				return ally_triggers.includes(detail.key.code)
			}
		}
		return false
	}
	
	function listener_on(element){
		let listener = function get_listener_on(name,action){
			if(a11y_type(name)){
				if(!element.listener.has('a11y')) element.listener.on('a11y', element.a11y_callback, element)
				return element.listener.on(name, a11y_callback(element,action), element)
			}
			return element.listener.on(name, action, element)
		}
		listener.cast = wwi.on(element)
		return listener
	}
	
	//Pointer
	function Pointer() {
		if (!this[this.Canvas]) {
			this[this.Canvas] = {
				get current() {
					return Pointer.currentCanvas
				},
				get id() {
					return this.currentCanvas ? this.currentCanvas.id : 'eventPointerCanvas'
				},
				get context() {
					return this.current ? this.current.getContext('2d') : null
				},
				get width() {
					return parseFloat(this.current.width)
				},
				get height() {
					return parseFloat(this.current.height)
				},
				clear(){
					let ctx = this.context
					if (ctx) ctx.clearRect(0, 0, this.width, this.height);
					return this;
				},
				event(e){ return Pointer.action(e) }
			};
		}
		return this[this.Canvas];
	}
	Pointer.get = function(name){
		if(Pointer.has(name)) return Pointer[pointers].get(name)
		return null
	}
	Pointer.has = function(name){
		if(pointers in Pointer) return Pointer[pointers].has(name)
		return false
	}
	Pointer.set = function add_a_custom_pointer(name,pointer){
		if(! (pointers in Pointer) ) Pointer[pointers] = new Map()
		return Pointer[pointers].set(name,pointer)
	}
	Pointer.event = function(e){
		let target = e.currentTarget
		if(target.hasAttribute('pointer')){
			let pointer_name = target.getAttribute('pointer')
			let pointer = Pointer.get(pointer_name)
			if(pointer) return pointer(e)
		}
		return e
	}


})