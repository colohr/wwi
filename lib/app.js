const express = require('express')
const compress = require('compression')
const index = require('./run')

module.exports = app_exports


function app_exports(...x){
	const app = create(...x)
	const proxy = new Proxy(app,{
		get(o,name){
			switch(name){
				case 'template':
					return app_template
					break
				case 'add_static':
				case 'static':
					return add_app_static
					break
				case 'start':
				case 'listen':
					return app_start
					break
				case 'info':
					return o.info
					break
			}
			if(name in o){
				let value = o[name]
				if(typeof value === 'function') value.bind(o)
				return value
			}
			return null
		}
	})
	
	//value
	return proxy
	
	//shared actions
	function app_start(){
		return start(app.cloud,app.port,app.url)
	}
	
	function add_app_static(...x){
		add_static(app.cloud,...x)
		return proxy
	}
	
	function app_template(directory){
		return template(directory || app.directory).then(_=>proxy)
	}
}

function create(directory,port=2222,public_static=true){
	const cloud = express()
	cloud.use(compress())
	if(public_static) add_static(cloud,directory)
	
	return {
		cloud,
		directory,
		port,
		url:`http://localhost:${port}`
	}
}


function template(publics){
	return new Promise((success,error)=>{
		return index.template(publics).then(success).catch(error)
	})
}

function add_static(app,...x){
	let routes = []
	if(x.length === 1) routes = [express.static(x[0])]
	else routes = [x[0],express.static(x[1])]
	return app.use(...routes)
}

function start(app,port,url){
	return new Promise(success=>{
		return app.listen(port,()=>{
			return success(url)
		})
	})
}
