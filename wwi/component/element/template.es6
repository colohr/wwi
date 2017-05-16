wwi.exports('element',( element, fxy ) => {
	
	const is = fxy.is
	const shadow_attached = Symbol.for('shadow dom is already attached')
	
	
	//------------template exports------------
	element.dom_template = Base => class extends Base{
		get dom_template_element(){ return this.query('dom-template') }
		get tag(){ return fxy.tag }
		render(data){
			return this.dom_template_element.render(data,this.dom_template,this.dom_style)
		}
	}
	
	element.template = Base => class extends Base {
		attach_template(template){
			if(shadow_attached in this) return this
			let shadow = this.attachShadow({mode: 'open'})
			this[shadow_attached] = true
			template = get_template(this)
			if(fxy.is.element(template, DocumentFragment)) shadow.appendChild(template)
			else if(fxy.is.element(template)) shadow.appendChild(template)
			else if(fxy.is.text(template)) shadow.innerHTML = template
			return this
		}
		get shadow() { return 'shadowRoot' in this ? this.shadowRoot : this }
		all(selector){ return Array.from( this.shadow.querySelectorAll(is.text(selector) ? selector : '*') ) }
		query(selector){ return this.shadow.querySelector(is.text(selector) ? selector : ':first-child')}
	}
	
	
	//-------shared actions----------
	function get_template(element){
		if(!('template' in element.constructor)) return null
		let template = element.constructor.template
		if(is.text(template)) return template
		else if( is.element(template, HTMLTemplateElement) ) return template.content.cloneNode(true)
		else if( is.element(template) ) return template
		else if( is.object(template) ) return template
		return null
	}
	
	
})

//template = fxy.is.element(template, DomTemplate) ? template:get_template(this)
//else if(fxy.is.instance( template, DomTemplate )) shadow.innerHTML = template.render(this)

