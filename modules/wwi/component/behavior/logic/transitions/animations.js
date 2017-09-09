(function(get_list){ return get_list() })
(function(){
	
	let animated = Symbol.for('animated')
	
	class Animated{
		constructor(animation){
			this.animation = animation
		}
		back(name){ return this.animation.back.classes[`${name}_class`] }
		dismiss(element,name){
			let animation = this[name]('out')
			return this.set(element,animation)
		}
		next(name){ return this.animation.next.classes[`${name}_class`] }
		present(element,name){
			let animation = this[name]('in')
			element.setAttribute('current-page','')
			return this.set(element,animation)
		}
		set(element,classes){
			element.setAttribute('class',classes)
			return element
		}
	}
	
	
	class Animation{
		constructor(back,next){
			this.next = next
			this.back = back
		}
	}
	
	
	class Animations extends Map{
		constructor(data){
			super()
			for(let item of data.list) this.set(item.id,item)
		}
		animation(type,direction,flip){
			let value = []
			for(let animation of this.values()){
				if(animation.type === type){
					if(animation.direction === direction){
						value.push(animation)
					}
				}
			}
			if(value.length === 1) value[1] = value[0]
			if(!flip) value = value.reverse()
			return new Animation(...value)
		}
		get count(){ return this.size }
		element(page,option){
			let type = page.hasAttribute('transition-type') ? page.getAttribute('transition-type'):option.type
			let direction = page.hasAttribute('transition-direction') ? page.getAttribute('transition-direction'):option.direction
			let animation = this.animation(type,direction,option.flip)
			page[animated] = new Animated(animation)
			page.get_animation = function get_animation(){ return this[animated] }
			return page
		}
		setup(transitions){
			let pages = transitions.pages
			let options = transitions.options
			for(let page of pages) this.element(page,options)
			return transitions
		}
		get types(){ return get_types(this) }
	}
	
	
    //exports
    return data => new Animations(data)
	//shared actions
	function get_types(animations){
		let types = {}
		for(let animation of animations.values()){
			if(!(animation.type in types)) types[animation.type] = {}
			if(!(animation.direction in types[animation.type])) types[animation.type][animation.direction] = true
		}
		return types
	}
})





