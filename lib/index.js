const wwi = {
	get copy(){ return require('./copy') },
	get modules(){ return require('./copy-modules') },
	get template(){ return require('./copy-template') }
}

const custom_elements = require('./custom-elements')
custom_elements.update()

//exports
module.exports = get_wwi()

//shared actions
function get_wwi(){
	return new Proxy(function wwi_cloud(folder){
		return new Proxy(require('./cloud')(folder),{
			get(o,name){
				if(name in wwi) return function wwi_app(){ return wwi[name](o.site) }
				if(name in o) {
					let value = o[name]
					if(typeof value === 'function') value = value.bind(o)
					return value
				}
				return null
			}
		})
		
	},{
		get(o,name){
			if(name in wwi) return wwi[name]
			if(name in o) return o[name]
			return null
		}
	})
}


//module.exports.cloud = require('./cloud')
//module.exports.template = require('./copy-template')
//module.exports.copy = require('./copy')
//module.exports.modules = require('./copy-modules')
