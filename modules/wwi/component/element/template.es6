window.fxy.exports('element',( element, fxy ) => {
	
	const is = fxy.is
	const shadow_attached = Symbol.for('shadow dom is already attached')
	const view_queries = [
		'[view]',
		'[container]',
		'[content]',
		'[button-view]'
	]
	
	//exports
	element.dom_template = Base => class extends Base{
		get dom_template_element(){ return this.query('dom-template') }
		get tag(){ return fxy.tag }
		render(data){
			return this.dom_template_element.render(data,this.dom_template,this.dom_style)
		}
	}
	
	element.template = Base => class extends Base {
		all(selector){ return Array.from( this.shadow.querySelectorAll(is.text(selector) ? selector : '*') ) }
		contains(element){ return contains_element(this,element) }
		attach_template(template){
			if(shadow_attached in this) return this
			let shadow = 'no_shadow' in this.constructor ? this:this.attachShadow({mode: 'open'})
			this[shadow_attached] = true
			template = get_template(this)
			if(fxy.is.element(template, DocumentFragment)) shadow.appendChild(template)
			else if(fxy.is.element(template)) shadow.appendChild(template)
			else if(fxy.is.text(template)) shadow.innerHTML = template
			return this
		}
		query(selector){ return this.shadow.querySelector(is.text(selector) ? selector : ':first-child')}
		get shadow() { return 'shadowRoot' in this && this.shadowRoot !== null ? this.shadowRoot : this }
		get view(){ return get_view(this) }
	}
	
	
	//shared actions
	function contains_element(container,element){
		if(contains_child_element(container,element)) return true
		let selector = fxy.selector(element)
		if(selector) return container.query(selector) !== null
		return false
	}
	
	function contains_child_element(container,element){
		if(is.element(element)){
			if('shadowRoot' in container && element.parentNode === container.shadowRoot) return true
			else if(element.parentNode === container) return true
			else if(get_children(container).includes(element)) return true
		}
		return false
	}
	
	function get_children(element){
		return Array.from(element.children)
	}
	
	function get_template(element){
		if(!('template' in element.constructor)) return null
		let template = element.constructor.template
		if(is.text(template)) return template
		else if( is.element(template, HTMLTemplateElement) ) return template.content.cloneNode(true)
		else if( is.element(template) ) return template
		else if( is.object(template) ) return template
		return null
	}
	
	function get_view(element){
		for(let selector of view_queries){
			let view = element.query(selector)
			if(view) return view
		}
		return element.shadow
	}
	
})