(function (get_transitions) { return get_transitions() })
(function () {
	
	const keys = {
		//BACKSPACE: 8,
		DOWN: 40,
		//ENTER: 13,
		LEFT: 37,
		RIGHT: 39,
		SPACE: 32,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		UP:38
	}
	
	class Transitions {
		static get animations(){ return window.fxy.require('transitions-behavior/animations') }
		static get example(){ return window.fxy.require('transitions-behavior/example') }
		static get keys(){ return keys }
		constructor(element, ...pages) {
			this.animating = false
			this.element = element
			this.end_next = false
			this.end_current = false
			
			for(let page of pages){
				page.setAttribute('transition-page','')
				page.dataset.original_class_list = page.hasAttribute('class') ? page.getAttribute('class'):''
			}

			this.constructor.animations.setup(this)
			pages[0].setAttribute('current-page','')
			this.back = _=>go_back(this)
			this.next = _=>go_next(this)
			
			this.to = index=>go_to(this,index,this.pages[index])
			this.to_page = page=>go_to(this,this.index(page),page)
			
			if(this.element.hasAttribute('tabindex') !== true) this.element.setAttribute('tabindex','0')
			this.element.onfocus = e=>this.enable()
			Transitions.active = this
			
		}
		animation(index){ return get_animation(this,index) }
		enable(){ return Transitions.active = this }
		get count() { return this.pages.length }
		get container(){ return this.query('[transition-container]') }
		example(){
			if('example_menu' in this) return this
			if(fxy.is.nothing(Transitions.example)) throw new Error(`Add an extension: "{module:'behavior',name:'TransitionExample'}" to the wwi.element to use transition examples.`)
			this.current = 0
			delete this.element.onfocus
			this.enable = ()=>this
			if(Transitions.active === this) delete Transitions.active
			this.back = (...x) => example_page(this,...x)
			this.next = (...x) => example_page(this,...x)
			return Transitions.example(this)
		}
		index(page){ return this.pages.indexOf(page) }
		notify(detail){
			this.element.dispatchEvent(new CustomEvent('page',{bubbles:true,composed:true,detail}))
		}
		get options(){ return {flip: this.element.hasAttribute('transition-flip'), direction:this.element.getAttribute('transition-direction'), type:this.element.getAttribute('transition-type')} }
		get pages() { return Array.from(this.view.querySelectorAll('[transition-page]')) }
		get pagination(){
			let transitions = this
			return {
				get back(){ return this.current.previousElementSibling || transitions.pages[transitions.count-1] },
				get current(){ return transitions.query('[current-page]') },
				get next(){ return this.current.nextElementSibling || transitions.pages[0] },
				get page(){ return transitions.page }
			}
		}
		query(selector){ return this.view.querySelector(selector) }
		get view(){ return window.fxy.is.nothing(this.element.shadowRoot) ? this.element:this.element.shadowRoot }
	}
	
	//load
	window.document.body.addEventListener('keyup',function(event){
		if(Transitions.active){
			let key = event.which
			if (key === keys.RIGHT || key === keys.SPACE || key === keys.ENTER || key === keys.DOWN || key === keys.PAGE_DOWN) {
				Transitions.active.next()
			}
			else if (key === keys.LEFT || key === keys.UP || key === keys.BACKSPACE || key === keys.PAGE_UP) {
				Transitions.active.back()
			}
		}
	})
	
	//export
	return Transitions
	
	//shared actions
	function add_page_events(transitions,current,next){
		let animation_end = 'animationend' // window.fxy.browser.prefix + 'AnimationEnd'
		current.addEventListener(animation_end,current_on_animation_end,false)
		next.addEventListener(animation_end,next_on_animation_end,false)
		transitions.end = function(){
			current.removeEventListener(animation_end,current_on_animation_end,false)
			next.removeEventListener(animation_end,next_on_animation_end,false)
			delete transitions.end_current
			delete transitions.end_next
			delete transitions.end
			return on_animation_end(transitions,current,next)
		}
		return transitions
		//shared actions
		function current_on_animation_end(){
			current.removeEventListener(animation_end,current_on_animation_end,false)
			transitions.end_current = true
			if (transitions.end_next) on_animation_end(transitions,current,next)
		}
		function next_on_animation_end(){
			next.removeEventListener(animation_end,next_on_animation_end,false)
			transitions.end_next = true
			if (transitions.end_current) on_animation_end(transitions,current,next)
		}
	}
	
	function example_page(transitions,animation_id){
		if (transitions.animating) return false
		transitions.animating = true
		let pages = transitions.pages
		let count = pages.length
		
		let current_page = pages[transitions.current]
		transitions.current = get_next_index(transitions.current,count)
		
		let next_page = pages[transitions.current]
		next_page.setAttribute('current-page','')
		
		let classes = transitions.example_menu.get_animation(animation_id)
		classes.add(current_page,'out')
		classes.add(next_page,'in')
		
		return add_page_events(transitions,current_page,next_page)
	}
	
	function get_animation(transitions,index){
		let page = transitions.pages[index]
		return page.get_animation()
	}
	
	function get_next_index(current,count){
		if (current < count - 1) current = current+1
		else current = 0
		return current
	}
	
	function go_back(transitions) {
		Transitions.active = transitions
		if (transitions.animating) transitions.end()
		transitions.animating = true
		let pagination = transitions.pagination
		let back = pagination.back
		let current = pagination.current
		let animation = back.get_animation()
		animation.dismiss(current,'back')
		animation.present(back,'back')
		return add_page_events(transitions,current,back)
	}
	
	function go_next(transitions) {
		Transitions.active = transitions
		if (transitions.animating) transitions.end()
		transitions.animating = true
		let pagination = transitions.pagination
		let next = pagination.next
		let current = pagination.current
		let animation = next.get_animation()
		animation.dismiss(current,'next')
		animation.present(next,'next')
		return add_page_events(transitions,current,next)
	}
	
	function go_to(transitions,index,page){
		if(fxy.is.text(index)) index = parseInt(index)
		if(!fxy.is.number(index) || index <= -1) return
		if(!fxy.is.element(page)) return
		if(page.hasAttribute('current-page')) return
		Transitions.active = transitions
		if (transitions.animating) transitions.end()
		transitions.animating = true
		let pagination = transitions.pagination
		let current = pagination.current
		let current_index = transitions.index(current)
		let type = index > current_index ? 'next':'back'
		let animation = page.get_animation()
		animation.dismiss(current,type)
		animation.present(page,type)
		return add_page_events(transitions,current,page)
	}
	
	function on_animation_end(transitions, out_page, in_page) {
		transitions.end_current = false //endCurrPage = false;
		transitions.next_current = false //endNextPage = false;
		reset(out_page, in_page)
		out_page.removeAttribute('current-page')
		transitions.animating = false
		transitions.notify({out_page,in_page})
		return transitions
	}
	
	function reset(out_page, in_page) {
		out_page.setAttribute('class',out_page.dataset.original_class_list)
		in_page.setAttribute('class',in_page.dataset.original_class_list)
		in_page.setAttribute('current-page','')
	}
	
})