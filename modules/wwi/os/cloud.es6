wwi.exports( 'os', operating_system => {

		const cloud_graph = Symbol('Cloud Graph Interface')
		const doc = Symbol('Doc Parser - doc.es6')
		const edus = Symbol('Educational items for the author or others - edus.es6')
		const task_module = Symbol('Task Module')
		const disable_storage = Symbol.for('disable storage')
		const app_cloud_doc_data_name = Symbol.for('app.cloud.doc.data name')
		const data = new Map()
		
		
		class Cloud{
			constructor(){}
			
			edus(edus_url){ return load_edus(this,edus_url)
				//return new Promise((success,error)=>{
				//	if(edus in this) return load_edus_file(edus_url,this[edus]).then(success).catch(error)
				//	return get_module(edus, url.os('edus.es6')).then(module => load_edus_file(edus_url,module)).then(success).catch(error)
				//})
			}
			data(...x){ return cloud_data(...x) }
			doc(doc_url, ...options){ return load_doc(this, doc_url, ...options)
				//return new Promise((success,error)=>{
				//	if(doc in this) return load_doc_file(doc_url,this[doc],...options).then(success).catch(error)
				//	return get_module(doc, url.os('doc.es6')).then(module => load_doc_file(doc_url,module,...options)).then(success).catch(error)
				//})
			}
			get graph(){ return get_graph(this) }
			task(file){ return load_task(this,file) }
			
		}
		
		//export cloud
		app.cloud = new Cloud()
		
		//---------------shared actions--------------
		
		class StorageReference{
			constructor(url,module){
				this.name = module[app_cloud_doc_data_name]
				this.url  = url
			}
		}
		
		function cloud_data(...x){
			if(x.length === 0) return data
			let symbol = x[0]
			if(symbol && !data.has(symbol)) data.set(symbol,new Map())
			let name = x[1]
			if(name){
				if(x.length === 3) data.get(symbol).set(name,x[2])
				return data.get(symbol).get(name)
			}
			return data.get(symbol)
		}
		function get_data_proxy_from_map(data_map){
			return new Proxy({},{
				get(o,name){
					if(name in data_map){
						if(typeof data_map[name] === 'function') return data_map[name].bind(data_map)
					}
					if(data_map.has(name)) {
						let value = data_map.get(name)
						if(value instanceof StorageReference && data_map.has(value.url)) value = data_map.get(value.url)
						if(value instanceof Map) return get_data_proxy_from_map(value)
						return value
					}
					return null
				},
				set(o,name,value){
					return data_map.set(name,value)
				},
				has(o,name){
					if(name in data_map) return true
					else if(data_map.has(name)) return true
					return false
				}
			})
		}
		
		function get_graph(cloud){
			if(cloud_graph in cloud) return cloud[cloud_graph]
			let Graph = fxy.require('os/Graph')
			if(Graph !== null) return cloud[cloud_graph] = new Graph(get_graph_options())
			else {
					throw new Error(`Include the graph extension by adding a
					graph || graph='webpaths:subpath,graph,ql' or {"interface":{"webpaths":["subpath"...]}} json string
					attribute to the port.es6 script tag to include graph`);
			}
			function get_graph_options(){
				let default_graph_options = {"interface":{"webpaths":["graph","ui"]}}
				var graph_options = window.app.kit.get('graph').trim()
				if(graph_options.length <= 0) return default_graph_options
				else if(fxy.is.json(graph_options)) return JSON.parse(graph_options)
				let webpaths
				if(graph_options.includes(':')) webpaths = graph_options.split(':')[1]
				else webpaths = graph_options
				default_graph_options.webpaths = webpaths.split(',').map(path=>path.trim()).filter(path=>path.length > 0)
				return default_graph_options
			}
		}
		
		function get_module(symbol, module_url){ return app.port.eval(module_url).then(module=>app.cloud[symbol] = module) }
		
		function load_edus(cloud, edus_url){
			return new Promise((success,error)=>{
				if(edus in cloud) return load_edus_file(edus_url,cloud[edus]).then(success).catch(error)
				return get_module(edus, url.os('edus.es6')).then(module => load_edus_file(edus_url,module)).then(success).catch(error)
			})
		}
		
		function load_edus_file(edus_url, module){
			if( !('data' in app.cloud.edus) ) Object.defineProperty(app.cloud.edus,'data',{ get(){ return get_data_proxy_from_map(app.cloud.data(edus)) } })
			let edus_module = module({
				app:window.app,
				fxy:window.fxy,
				url:url.edus(edus_url)
			})
			return edus_module.then(result=>{
				app.cloud.data(edus,result.name,result.value)
				return result
			})
		}
		
		function load_doc(cloud, doc_url, ...options){
			return new Promise((success,error)=>{
				if(doc in cloud) return load_doc_file(doc_url,cloud[doc],...options).then(success).catch(error)
				return get_module(doc, url.os('doc.es6')).then(module => load_doc_file(doc_url,module,...options)).then(success).catch(error)
			})
		}
		
		function load_doc_file(doc_url, module, ...options){
			if( !('data' in app.cloud.doc) ) Object.defineProperty(app.cloud.doc,'data',{ get(){ return  get_data_proxy_from_map(app.cloud.data(doc)) } })
			return new Promise((success,error)=>{
				if( !options.includes('disable storage') && app.cloud.doc.data.has(doc_url) ) {
					let data_value = app.cloud.doc.data.get(doc_url)
					return data_value instanceof Error ? error(data_value):success(data_value)
				}
				return module.get(doc_url, ...options).then(doc_result=>{
					if( !(disable_storage in doc_result) ) {
						if(app_cloud_doc_data_name in doc_result){
							let reference = new StorageReference(doc_url,doc_result)
							app.cloud.data(doc,reference.name,reference)
						}
						app.cloud.data(doc,doc_url,doc_result)
					}
					return success(doc_result)
				}).catch(e=>{
					console.error({doc_error:e})
					app.cloud.data(doc,doc_url,e)
					return error(e)
				})
			})
		}
		
		function load_task(cloud,file){
			let info = get_file_info()
			return new Promise((success,error)=>{
				if(task_module in cloud) return cloud[task_module](info).then(success).catch(error)
				return get_module(task_module, url.os('task.es6')).then(module => module(info)).then(success).catch(error)
			})
			//shared actions
			function get_file_info(){
				let type = window.app.source.type(file)
				let info = {type}
				if(type) {
					info.file = window.app.source.file(file)
					info.name = info.file.replace(`.${type}`,'')
					info.url = file.indexOf('http') ? file:window.url(file)
				}
				else {
					type = 'es6'
					info.file = `${file}.${type}`
					info.name = file
					info.type = type
					info.url = window.url('tasks',info.file)
				}
				return info
			}
		}
		
		
		
	
})