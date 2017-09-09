window.fxy.exports('element',(element,fxy)=>{
	const element_memory = Symbol.for('element memory')
	fxy.symbols.memory = element_memory
	
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
	
	//exports
	element.forget = forget_memory
	element.memorize = Base => class extends Base{
		get memory(){ return get_memory(this)}
		set memory(name){ return new Memory(this,name) }
	}
	element.memory = {
		[fxy.symbols.listener]:new WeakMap(),
		[fxy.symbols.actions]:new WeakMap(),
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
		get Memorized(){ return Memory[element_memory] }
	}
	
	//shared actions
	function forget_memory(element){ return Memory.delete(element) }
	function get_memory(element){
		if(Memory.has(element)) return Memory.get(element)
		return new Memory(element,element.getAttribute('memory-name'))
	}
	
})