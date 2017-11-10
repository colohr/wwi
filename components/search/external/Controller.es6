(function(get_search){ return get_search() })
(function(){
	return function export_search(search,fxy){
		
		const Controller = Base => class extends Base{
			get search(){ return get_search(this) }
		}
		
		//exports
		return Controller
		
		//shared actions
		function get_search(element){
			return new Proxy(element,{
				get:get_value,
				has:has_value,
				set(o,name,value){
					o[name] = value
					return true
				}
			})
		}
		
		function get_value(element,name){
			let value = null
			let field = get_search_field(element)
			switch(name){
				case 'field':
					value = field
					break
				case 'results':
					value = get_search_results(element,field)
					break
				default:
					if(value === null && name in field){
						value = field[name]
						if(typeof value === 'function' && typeof value.bind === 'function') {
							value = value.bind(field)
						}
					}
					break
			}
			return value
		}
		
		function get_search_results(element,field){
			if('results' in field) return field.results
			field.results = document.createElement('search-results')
			field.results.setAttribute('id','search-results-0')
			field.results.controller=element
			window.document.body.appendChild(field.results)
			return field.results
		}
		
		function get_search_field(element){
			let search_element = element.query('search-component')
			if(search_element === null) search_element = create_element()
			//return value
			return search_element
			//shared actions
			function create_element(){
				search_element = document.createElement('search-component')
				search_element.slot = 'right'
				//search_element.on.search = e => element.search.action({event:e,container:element})
				search_element.button = document.createElement('navigator-search')
				element.view.appendChild(search_element.button)
				let buttons = get_buttons()
				for(let button of buttons) search_element.appendChild(button)
				element.view.appendChild(search_element)
				return search_element
			}
			function get_buttons(){
				let clear_button = document.createElement('navigator-clear')
				clear_button.setAttribute('up','')
				clear_button.setAttribute('search-close-button','')
				clear_button.slot = 'close-button'
				return [clear_button]
			}
		}
		
		function has_value(element,name){
			if(name === 'field') return true
			let field = get_search_field(element)
			if(name in field) return true
			return false
		}
		
		
	}
})