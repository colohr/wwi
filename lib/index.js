const fxy = require('fxy')
const modules_folder = fxy.join(__dirname,'../modules')
const components_folder = fxy.join(__dirname,'../components')

const wwi = {
	app(wwi_cloud_or_folder_or_data_containing_wxy_cloud_options){
		return get_app(wwi_cloud_or_folder_or_data_containing_wxy_cloud_options)
	},
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
function get_app(x){
	const Cloud = require('wxy').Cloud
	const cloud = fxy.is.data(x) && x instanceof Cloud ? x:get_cloud(x)
	const start_app = cloud.start.bind(cloud)
	cloud.start = ()=>start_app().then(()=>set_routers())
	return cloud
	
	//shared actions
	function set_routers(){
		const routers = wwi.routers(cloud.options,cloud)
		for(let router of routers) cloud.use(router)
		return cloud
	}
	//if(cloud.options.wwi.after){}
	//return set_routers()
	
}

function get_cloud(x){ return require('./cloud')(x) }

function get_modules_router(options,cloud){
	let wxy = require('wxy')
	let fxy = require('fxy')
	let modules = fxy.join(__dirname,'../modules')
	let router = wxy.router()
	let cache = wxy.cache(options.cache || cloud.options.cache)
	let statics = new wxy.Static(null,modules,cache.headers)
	if(cloud.mini){
		router.use('/modules',(request,response,next)=>{
			if(request.es_file){
				let file = fxy.join(__dirname,'../',request.es_file)
				let item = request.mini.has(file) ? request.mini.get(file):request.mini.file(file)
				response.set('Content-Type', 'application/javascript')
				response.set('Cache-Control', `public, ${cache.control}`)
				return response.send(item.mini)
			}
			return next()
		})
	}
	router.use('/modules',statics.router)
	router.use('/modules/design',require('./design')(options.url))
	router.use(wxy.files({folder:modules,url:options.url}))
	return router
}

function get_wwi(){
	return new Proxy(get_cloud,{
		get(o,name){
			if(name in wwi) return wwi[name]
			if(name in o) {
				let value = o[name]
				if(typeof value === 'function') value = value.bind(o)
				return value
			}
			return null
		}
	})
}