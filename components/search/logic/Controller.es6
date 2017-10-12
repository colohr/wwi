window.fxy.exports('search',(search,fxy)=>{
	
	class Controller{
		constructor(field){
			this.field = field
		}
		action({event,container}){
			if('actions' in this){
				if('data' in this.actions){
					let matches = this.data(this.actions.data)
					return get_result_elements(this,matches,container)
				}
			}
			return this
		}
		data(data){
			let keywords = this.keywords
			if(keywords.length) return search_data(data,...keywords)
			return {}
		}
		get keywords(){ return this.field.keywords }
		text(...values){
			let keywords = this.keywords
			return values.filter(item=>{
				let matches = search_value(item,...keywords)
				return matches.length > 0
			})
		}
		
	}
	
	//exports
	search.Controller = Controller
	//shared actions
	function get_result_elements(controller,results,container_element) {
		let container = controller.results
		if(container) {
			container.removeAttribute('has-results')
			container.innerHTML = ''
		}
		let items = []
		for(let key in results) {
			let result_value = results[key]
			for(let i of result_value) items.push(get_item(`${key}`,i))
		}
		if(container) {
			
			if(items.length){
				container.setAttribute('has-results','')
				items.forEach(item=>container.appendChild(item))
			}
			
		}
		container_element.dispatch('search changed',items)
		console.log({container_element})
		controller.matches = items
		return controller
		//shared actions
		function get_item(name,data){
			let element = null
			if('item' in controller.actions) element = controller.actions.item(name,data)
			else {
				element = document.createElement('li')
				element.setAttribute('name',name)
				element.data = data
				element.innerHTML = get_default_html(data)
			}
			element.setAttribute('result-item','')
			return element
		}
		function get_default_html(data){
			let html = ''
			for(let name in data){
				let value = data[name]
				if(fxy.is.data(value)) html += `<div style="padding: 0 10px 5px 10px;position: relative;display: inline-block;vertical-align: top;"><h3 style="margin-bottom:3px;margin-top:3px;">${name}</h3><div style="margin:5px">${get_default_html(value)}</div></div>`
				else html += `<div style="padding:5px"><b>${name}:</b><span style="margin-left:6px">${value}</span></div>`
			}
			return html
		}
	}
	
	function get_text(value){
		if(fxy.is.text(value)) return value.toLowerCase()
		else if(fxy.is.number(value)) return value+''
		if(fxy.is.data(value) || fxy.is.array(value)){
			try{
				return JSON.stringify(value).toLowerCase()
			}catch(e){
				return null
			}
		}
		return null
	}
	
	function search_data(data,...keywords){
		let matches = {}
		for(let name in data){
			let value = search_value(data[name],...keywords)
			if(value.length) matches[name] = value
		}
		return matches
	}
	
	function search_value(value,...keywords){
		let text = get_text(value)
		let matches = []
		if(text === null) return matches
		for(let keyword of keywords){
			if(text.includes(keyword)) matches.push(value)
		}
		return matches
	}
	
})