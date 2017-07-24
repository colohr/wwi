wwi.exports('element',(element,fxy)=>{
	
	const element_memory = Symbol.for('element memory')
	fxy.symbols.memory = element_memory
	
	const Mixins = {}
	
	class Memory extends Map{
		static delete(e){
			if(this.has(e)) this[element_memory].delete(e)
			return e
		}
		static get(e){
			if(this.has(e)) return this[element_memory].get(e)
			return null
		}
		static has(e){
			if(element_memory in this) return this[element_memory].has(e)
			return false
		}
		static set(e,memory){
			if( !(element_memory in this) ) this[element_memory] = new WeakMap()
			if(this.has(e)) this.delete(e)
			return this[element_memory].set(e,memory)
		}
		constructor(e,name){
			super()
			if(typeof name !== 'string') name = `memory ${Date.now()}`
			this.name = name
			Memory.set(e,this)
		}
		getset(name,type){
			if(this.has(name)) return this.get(name)
			if(typeof type === 'function') this.set(name,new type())
			else this.set(name,new Map())
			return this.get(name)
		}
	}
	
	const ForgetMemory = (e)=>{ return Memory.delete(e) }
	const Memorize = Base => class extends Base{
		get memory(){
			if(Memory.has(this)) return Memory.get(this)
			return new Memory(this,this.getAttribute('memory-name'))
		}
		set memory(name){ return new Memory(this,name) }
	}
	
	const memory = {
		Attribute:AttributeMap,
		Events:{
			animationstart: ['animationstart', 'AnimationStart'],
			animation: ['animationiteration', 'AnimationIteration'],
			animationend: ['animationend', 'AnimationEnd'],
			blur: ['blur', null],
			click: ['click', null],
			down: ['mousedown', null],
			drag: ['dragmove', null],
			end: ['dragend', null],
			enter: ['mouseenter', null],
			focus: ['focus', null],
			leave: ['mouseleave', null],
			move: ['mousemove', null],
			over: ['dragover', null],
			start: ['dragstart', null],
			tap: ['tap', null],
			transitionend: ['transitionend', 'TransitionEnd'],
			up: ['mouseup', null],
		},
		Types:{
			Data(el){
				return new Proxy({
					element:el,
					get valid(){ return this.element instanceof HTMLElement },
					get data(){ return this.valid ? this.element.dataset : {} },
					get attributes(){ return AttributeMap(this.element) }
				},{
					get(o,p){
						if(p === 'data') return o.data;
						if(!p.includes('-') && o.valid && o.element.hasAttribute(p)) {
							return o.element.getAttribute(p);
						}
						let a = o.attributes;
						if(a.has(p)) return a.get(p);
						return null;
					},
					set(o,p,v){
						if(typeof p === 'string'){
							if(o.valid){
								let data = AttributeMap.data(v);
								let value = data.attribute(p)
								if(value === null) o.element.removeAttribute(p)
								else o.element.setAttribute(p,value)
							}
						}
						return true;
					}
				})
			}
		},
		get Memorized(){ return Memory[element_memory] }
	}
	memory[fxy.symbols.Listener] = new WeakMap()
	memory[fxy.symbols.Callbacks] = new WeakMap()
	
	element.memorize = Memorize
	element.forget = ForgetMemory
	element.memory = memory
	element.mixins = Mixins
	
	//------------shared actions---------
	
	function AttributeMap(el){
		let m = new Map()
		if(el instanceof HTMLElement){
			let attr = el.attributes;
			for(var i=0;i<attr.length;i++){
				let a = attr[i];
				m.set(a.name,a.value)
			}
		}
		return m
	}
	
	AttributeMap.value = function(x,name){
		var value = x;
		if(typeof x === 'boolean'){
			if(name.includes('aria') || name.includes('-')) value = x+''
			else if(x === true) value = ''
			else value = null
		}
		return value
	}
	
	AttributeMap.data = function(x){
		return {
			value:x,
			get valid(){ return fxy.is.element_data(this.value) },
			get type(){
				var type = typeof this.value
				if(this.value === null) type = 'null'
				if(type === 'string' && this.valid) type = 'object-string'
				return type;
			},
			get stringifiable(){ return this.type === 'object' },
			get parsable(){ return this.type === 'object-string' },
			get dom(){ return this.stringifiable ? JSON.stringify(this.value) : this.value },
			get json(){
				if(this.jsondata) return this.jsondata
				if(this.parsable) this.jsondata = JSON.parse(this.value)
				return this.jsondata ? this.jsondata : this.value
			},
			attribute(name){
				if(name.includes('data-')) return this.dom
				return AttributeMap.value(this.value,name)
			}
		}
	}
	
	
	
	
	//	element.types = Types

})

//const ElementSymbols = {
//	Listener: Symbol(' element listener '),
//	Callbacks: Symbol(' element callbacks '),
//	Properties: Symbol(' element properties '),
//	Canvas: Symbol(' element canvas '),
//	AttributeData: Symbol(' element attributes '),
//	get Pointer() {
//		return this.getPointer();
//	},
//	Events: {
//		animationstart: ['animationstart', 'AnimationStart'],
//		animation: ['animationiteration', 'AnimationIteration'],
//		animationend: ['animationend', 'AnimationEnd'],
//		blur: ['blur', null],
//		click: ['click', null],
//		down: ['mousedown', null],
//		drag: ['dragmove', null],
//		end: ['dragend', null],
//		enter: ['mouseeneter', null],
//		focus: ['focus', null],
//		leave: ['mouseleave', null],
//		move: ['mousemove', null],
//		over: ['dragover', null],
//		start: ['dragstart', null],
//		tap: ['tap', null],
//		transitionend: ['transitionend', 'TransitionEnd'],
//		up: ['mouseup', null],
//	},
//	Pointable: {'click': true, 'down': true, 'up': true, tap: true},
//	Methods: {
//		dragover(e){
//			e.preventDefault()
//		}
//	},
//	Restyle: {
//		types: [
//			{
//				keys: 'drag start',
//				pointable: true,
//				css: {
//					userSelect: 'none'
//				}
//			}
//		],
//		clientType(client, type){
//			let css = type.css;
//			let o = {}
//			for (let key in css) {
//				let v = client.vendor(window.document.body.style, key);
//				if ('value' in v) {
//					o[v.key] = css[key]
//				} else {
//					o[key] = css[key]
//				}
//			}
//			return o;
//		},
//		event(type, element){
//			if (typeof type !== 'string' || !(element instanceof HTMLElement)) return element;
//			let types = this.types;
//			let client = window.app && window.app.client ? window.app.client : null;
//			let isPointer = type in ElementSymbols.Pointable
//			types.forEach((T) => {
//				let has = (isPointer && T.pointable) || T.keys.includes(type)
//				console.log('isPointer ' + isPointer, 'pointable ' + T.pointable)
//				if (has) {
//					console.log('RESTYLE', T, type, element)
//					let css = client ? this.clientType(client, T) : T.css;
//					Object.assign(element.style, css);
//				}
//			});
//			return element;
//		}
//	}
//}