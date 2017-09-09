const wwi = {
	get components(){ return require('./Components') },
	modules:get_modules_router,
	routers(app){
		let options = 'wwi' in app ? app.wwi:{}
		let routers = []
		for(let name in options){
			if(name in wwi) routers.push(wwi[name](options[name],app))
		}
		return routers
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
function get_modules_router(_,app){
	let wxy = require('wxy')
	let fxy = require('fxy')
	let modules = fxy.join(__dirname,'../modules')
	let router = wxy.router()
	let statics = new wxy.Static(null,modules,{maxAge:'7d'})
	router.use('/modules',statics.router)
	router.use(wxy.files({folder:modules,url:app.url}))
	return router
}