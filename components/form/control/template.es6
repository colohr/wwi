wwi.exports('data',(data_export,fxy)=>{
	
	const data_template = Symbol('data template')
	
	class Template{
		constructor(element){
			this.element = element
			this.item = function(...x){
				let item = data_export.item(...x)
				let templates = get_item_template(this.template_elements,item)
				for(let name in templates){
					element.appendChild(templates[name])
				}
				return templates
			}
		}
		get template_elements(){ return get_template_elements(this.element) }
		
	}
	
	
	//exports
	data_export.template = Base => class extends Base{
		get template(){
			if(data_template in this) return this[data_template]
			return this[data_template] = new Template(this)
		}
	}
	
	
	//shared actions
	//function add_containers(element,containers,item){
	//	let data = item.element
	//	for(let name in containers){
	//		let container = containers[name]
	//		if(fxy.is.element(container)) {
	//			element.appendChild(container)
	//			if(name in data) set_container(container,data[name])
	//			element.item = item
	//		}
	//	}
	//	return containers
	//}
	
	function get_template_elements(element){
		return (document.importNode(element.slots.template.item.content, true)).children
	}
	
	function get_item_template(templates,item){
		let item_template = {}
		let data = item.element
		for(let i=0;i<templates.length;i++){
			let element = templates.item(i)
			let name = element.localName.includes('-') ? fxy.id._(element.localName):element.localName
			element.data_name = name
			element.item = item
			item_template[name] = name in data ? set_item_template_element(element,data[name]):element
		}
		return item_template
	}
	
	function set_item_template_element(container,data){
		for(let i in data){
			let value = data[i]
			let name = i
			if( !(name in container) ) name = fxy.id.code(name)
			if(name in container) {
				if(fxy.is.array(value) !== true) value = [value]
				if(typeof container[name] === 'function') container[name](...value)
				else container[name] = value
			}
			else container.setAttribute(fxy.id.dash(i),value)
		}
		return container
	}
	
	
	
	//const Template = {
	//	inputs:{
	//		email:{
	//			placeholder:'Type in your email...'
	//		},
	//		password:{
	//			placeholder:''
	//		}
	//	}
	//}
	//
	//class TemplateDesign{
	//	constructor(company_design){
	//		if(fxy.is.data(company_design)){
	//			for(let name in company_design){
	//				if(name in Template) this[name] = Object.assign(Template[name],company_design[name])
	//				else this[name] = company_design[name]
	//			}
	//		}
	//		else Object.assign(this,Template)
	//	}
	//	share(id){
	//		this[share_id] = id
	//		TemplateDesign[this[share_id]] = this
	//		return this
	//	}
	//}
	//
	//data_form.design = data => new TemplateDesign(data)
	//data_form.template = id => TemplateDesign[id]
	//data_form.templates = Template
	
})