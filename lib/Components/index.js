const create = require('./create')
//exports
module.exports = new Proxy(get_router,{
	get:get_value,
	has:has_value
})

//shared actions
function get_router(options,app){ return create.collection(options,app) }

function get_value(o,name){
	if(name in o) return o[name]
	if(name in create.components) return create.components[name]
	switch(name){
		case 'Components':
			return require('./Components')
			break
		case 'Collection':
			return require('./Collection')
			break
		case 'wwi':
			return create.components
			break
	}
	return null
}

function has_value(o,name){
	if(name in o) return true
	else if(name in create.components) return true
	if(['Components','Collection','wwi'].includes(name)) return true
	return false
}



