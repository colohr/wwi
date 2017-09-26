const fxy = require('fxy')
const modules_folder = fxy.join(__dirname,'../modules')
const components_folder = fxy.join(__dirname,'Components/components')

const wwi = {
	get components(){ return require('./Components') },
	modules:get_modules_router,
	routers(options,cloud){
		if(!('wwi' in options)) options.wwi = {}
		let routers = []
		for(let name in options.wwi){
			if(name in wwi) {
				routers.push(wwi[name](options,cloud))
			}
		}
		return routers
	},
	copy(folder){
		return {
			modules(name){
				let to = fxy.join(folder,name)
				if(fxy.exists(to) && fxy.list(to).length === 0) {
					return fxy.copy_folder(modules_folder,to)
				}
				throw new Error(`The target folder for wwi is not empty.`)
			},
			components(name){
				let to = fxy.join(folder,name)
				if(fxy.exists(to) && fxy.list(to).length === 0) {
					return fxy.copy_folder(components_folder,to)
				}
				throw new Error(`The target folder for wwi is not empty.`)
			}
		}
	}
}


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

//shared actions
function get_modules_router(options){
	let wxy = require('wxy')
	let fxy = require('fxy')
	let modules = fxy.join(__dirname,'../modules')
	let router = wxy.router()
	let statics = new wxy.Static(null,modules,{maxAge:'7d'})
	router.use('/modules',statics.router)
	router.use('/modules/design',require('./design')(options.url))
	router.use(wxy.files({folder:modules,url:options.url}))
	return router
}