wwi.exports('data',(data_form,fxy)=>{
	
	class Invalid extends Error{
		constructor(data){
			super(`Invalid`)
			this.data = data
		}
		get element(){ return this.data.element }
		get input(){ return this.element }
		get name(){ return this.data.name }
		get required(){ return this.data.required }
	}
	
	const Validate = Base => class extends Base{
		get valid(){ return 'account' in this }
		validate(){
			let data = {}
			let form = this
			let elements = form.valuables
			let invalid = false
			delete this.invalid
			for(let element of elements){
				let name = get_name(form,element)
				let required = element.hasAttribute('required')
				let type = get_as_type(element)
				let is_valid = get_validator(this,{name,required,type})
				if(is_valid(element.value)) data[name] = element.value
				else{
					invalid = true
					data[name] = new data_form.Invalid({name,type,required,element})
				}
			}
			if(invalid){
				delete form.account
				this.invalid = data
			}
			else this.account = data
			return data
		}
		submit(e){
			e.preventDefault()
			let data = this.validate()
			if(this.valid) this.dispatch('valid',data)
			else this.dispatch('invalid',data)
		}
	}
	
	const Inputs = Base => class extends Validate(Base){
		button(name){
			let selector = get_button_selector(this.getAttribute('button-selector'))
			return this.query(`${selector.start}${name}${selector.end}`)
		}
		connect_inputs(){
			let valuables =this.valuables
			for(let i of valuables){
				i.addEventListener('change',(e)=>{
					console.log('change',e)
				})
			}
			return this
		}
		get fields(){
			let selector = this.hasAttribute('fields-selector') ? this.getAttribute('fields-selector') : 'label'
			return this.all(selector)
		}
		input(name){
			let selector = get_input_selector(this.getAttribute('button-selector'))
			return this.query(`${selector.start}${name}${selector.end}`)
		}
		
		get valuables(){ return this.all('[validate]') }
	}
	
	//exports
	data_form.Inputs = Inputs
	
	//shared actions
	function get_as_type(element){
		if(element.hasAttribute('as')) return element.getAttribute('as')
		if(element.hasAttribute('type')) return element.getAttribute('type')
		return 'text'
	}
	
	function get_button_selector(value){ return get_selectors(value,['[',']']) }
	
	function get_input_selector(value){ return get_selectors(value) }
	
	function get_name(form,element){
		let name = element.getAttribute('name')
		if(!name) name = element.getAttribute('id')
		return name
	}
	
	function get_selector(value,default_selector=['#']){
		let selector = default_selector
		if(fxy.is.text(value)) {
			switch(value){
				case 'name':
					selector = ['[name="', '"]']
					break;
				case 'id':
					selector = ['#']
					break;
				default:
					selector = value.split(',')
			}
		}
		return selector
	}
	
	function get_selectors(selectors,defaults){
		return new Proxy(get_selector(selectors,defaults),{
			get(o,name){
				if(name in o) return o[0]
				if(name === 'start') return o[0]
				else if(name === 'end' && fxy.is.text(o[1])) return o[1]
				return ''
			}
		})
	}
	
	function get_validator(form,{type,name,required}){
		let validator = null
		let types = type.includes('>') ? type.split('>'):null
		type = types ? types[0]:type
		let count = types  && types.length > 1 ? parseFloat(types[1]):0
		if('validators' in form){
			if(name in form.validators) validator = form.validatros[name]
			else if(type in form.validators) validator = form.validators[type]
		}
		if(!validator && type in fxy.is) validator = fxy.is[type]
		return function value_validator(value){
			let valid = true
			if(required) valid = false
			if(validator) valid = validator(value)
			if(valid && count){
				if(typeof value === 'string') valid = value.length > count
				else if(typeof value === 'number') valid = value > count
			}
			return valid
		}
	}
	
	
	
	
	
})