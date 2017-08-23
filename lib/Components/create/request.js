const fxy = require('fxy')
const wwi_components = require('./components')

//exports
module.exports = get_component_request

//shared actions
function get_component_request(collection){
	return function component_responder(request,response){
		let inputs = get_inputs(request)
		let component = get_component(inputs)
		if(component !== null){
			if(component.error) return response.send(get_error_message(inputs,component.error))
			let content = collection.render(component)
			return response.send(content)
			//return response.sendFile(component.file)
		}
		return response.send(get_error_message(inputs))
	}
	//shared actions
	function get_inputs(request){
		let inputs = request.params
		if(fxy.is.data(inputs)) return inputs
		return {}
	}
	function get_component({component}){
		if(fxy.is.text(component) !== true) return null
		component = component.trim()
		if(component.length <= 0) return null
		let component_value = collection.find(component)
		if(component_value === null) component_value = wwi_components.find(component)
		return component_value
	}
}

function get_error_message(inputs,error){
	if(error && error instanceof Error) return `<h1 style="color:crimson">${error.message}</h1>`
	return `<h1 style="color:crimson">Component: "${inputs.component}" was not found.</h1>`
}
