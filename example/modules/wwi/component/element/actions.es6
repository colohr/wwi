wwi.exports('element',(element,fxy) => {
	const ally_triggers =  [13,32]
	const ElementSymbols = fxy.symbols
	const pointers = Symbol.for('pointers data')
	const Memory = fxy.require('element/memory')
	
	class Listener {
		
		static get Pointer() {
			return ElementSymbols.Pointer
		}
		
		static get Events() {
			return Memory.Events
		}
		
		static get Methods() {
			return ElementSymbols.Methods
		}
		
		static get Pointable() {
			return ElementSymbols.Pointable
		}
		
		static get Restyle() {
			return ElementSymbols.Restyle
		}
		
		static Pointers(element) {
			return new Proxy({
				element,
				events: this.Events,
				methods: this.Methods,
				pointable: this.Pointable,
			}, {
				get(o, p){
					if (p in o.events) return o.events[p][0]
					if (p in o.methods) return o.methods[p]
					return o[p]
				}
			})
		}
		
		static Has(element) {
			return Memory[ElementSymbols.Listener].has(element)
		}
		
		static Listener(element) {
			if (!Memory[ElementSymbols.Listener].has(element)) Memory[ElementSymbols.Listener].set(element, new Listener())
			return Memory[ElementSymbols.Listener].get(element)
		}
		
		static Delete(element) {
			if (!Memory[ElementSymbols.Listener].has(element)) return element
			Memory[ElementSymbols.Listener].get(element).disconnect(element)
			Memory[ElementSymbols.Listener].delete(element)
			return element
		}
		
		static HasCallbacks(listener) {
			return Memory[ElementSymbols.Callbacks].has(listener)
		}
		
		static Callbacks(listener) {
			if (!this.HasCallbacks(listener)) Memory[ElementSymbols.Callbacks].set(listener, new Map())
			return Memory[ElementSymbols.Callbacks].get(listener)
		}
		
		static event(type,detail){
			return new CustomEvent(type,{bubbles:true,composed:true,detail})
		}
		
		constructor() {}
		
		callback(type, eventListener, isPointer) {
			var block
			if (this.has_callbacks && this.callbacks.has(type)) block = this.callbacks.get(type)
			else {
				block = new Listener.Callback(type, isPointer)
				if (!block.valid) throw new TypeError('Invalid Element Callback Type: ' + type)
				if (typeof eventListener === 'function') block.eventListener = eventListener
				this.callbacks.set(type, block)
			}
			return block
		}
		
		get callbacks() { return this.constructor.Callbacks(this) }
		
		delete_all(type){
			if(this.has(type)) return this.callbacks.delete(type)
			return false
		}
		
		disconnect(element) {
			if (this.has_callbacks) {
				for (let cb of this.callbacks) cb[1].disconnect(element)
			}
			return element;
		}
		
		dispatch(type, detail, target, element) {
			if (!target) target = element
			if (this.has_callbacks && this.callbacks.has(type)) return this.callback(type).dispatch(detail, target, element)
			else target.dispatchEvent(Listener.event(type, detail))
			return element
		}
		
		get(type){
			if(this.has(type)) return this.callbacks.get(type)
			return false
		}
		
		has(type){ return this.has_callbacks && this.callbacks.has(type) }
		
		get has_callbacks() { return this.constructor.HasCallbacks(this) }
		
		off(type, element, delete_all) {
			if (!this.has_callbacks) return this
			if (!this.callbacks.has(type)) return this
			this.callback(type).disconnect(element)
			if(delete_all === true) this.delete_all(type)
			return element
		}
		
		on(type, callback, element) {
			let pointers = this.pointers
			var pointer = pointers[type]
			var name = type
			if (pointer) {
				if (typeof pointer === 'string') name = pointer
				if (typeof callback !== 'function') {
					if (name !== type) pointer = pointers[name]
					if (typeof pointer === 'function') callback = pointer
				}
			}
			
			let isPointer = pointers.pointable[type]
			if (isPointer && 'aria' in element) {
				let aria = element.aria
				if (!element.hasAttribute('role')) aria.role = 'button'
				if (!element.hasAttribute('tabindex')) aria.tabindex = '0'
			}
			
			var custom_type = name
			if(name !== type) custom_type = type
			let callback_block = this.callback(custom_type, callback, isPointer)
			if(name !== custom_type) callback_block.original_type = name
			return callback_block.connect( this.restyle.event(custom_type, element) )
		}
		
		get pointers() { return this.constructor.Pointers(this) }
		
		get restyle() { return this.constructor.Restyle }
		
	}
	
	Listener.Callback = class ElementCallbackBlock {
		
		constructor(typeName, isPointer) {
			this.type = typeName;
			if (isPointer) this.isPointer = isPointer
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
			target.dispatchEvent( this.event(detail) )
			return element
		}
		
		event(detail) { return Listener.event(this.type, detail) }
		
		get eventListener() { return this.elementEventListener || null }
		
		set eventListener(callback) {
			const eventListenerCallback = callback
			const block = this
			this.elementEventListener = function eventListener(e) {
				let is_ally = is_ally_trigger(e)
				if (block.isPointer || is_ally) {
					Pointer.event(is_ally ? e.detail.original : e)
				}
				return eventListenerCallback(e)
			}
			return this.elementEventListener
		}
		
		get valid() { return this.type && typeof this.type === 'string' }
		
	}
	
	
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
		
		get has_listener() { return Listener.Has(this) }
		
		get listener() { return Listener.Listener(this) }
		
		off(type, callback) {
			if (typeof callback === 'function') this.removeEventListener(type, callback, false)
			else if (this.has_listener) return this.listener.off(type, this, typeof callback === 'boolean' ? callback:true)
			return this
		}
		get on(){
			return get_on(this)
		}
		
	}
	
	
	element.listener = Listener
	element.pointer = Pointer
	
	
	
	//----------shared actions--------
	
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
	
	function is_ally_trigger(e){
		if(e.type === 'a11y'){
			let detail = e.detail
			if('action' in detail && detail.action === 'keydown'){
				return ally_triggers.includes(detail.key.code)
			}
		}
		return false
	}
	
	
	//--------------pointer-----------------
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


//on(key, callback) {
//	if(a11y_type(key)){
//		if(!this.listener.has('a11y')) this.listener.on('a11y', this.a11y_callback, this)
//		return this.listener.on(key, a11y_callback(this,callback), this)
//	}
//	return this.listener.on(key, callback, this)
//}