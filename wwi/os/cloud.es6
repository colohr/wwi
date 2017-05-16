wwi.exports( 'os', os => {
	Define((app,IO)=>{
		
		const doc = Symbol('Doc Parser - doc.es6')
		const edus = Symbol('Educational items for the author or others - edus.es6')
		const data = new Map()
		
		class Cloud{
			constructor(){
				this.io = new IO({
					interface:{
						webpaths:['api','graph','ql']
					}
				})
			}
			data(...x){
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
			edus(edus_url){
				return new Promise((success,error)=>{
					if(edus in this) return edus_document(edus_url,this[edus]).then(success).catch(error)
					return get_module(edus, url.os('edus.es6')).then(module => edus_document(edus_url,module))
					                                           .then(success)
					                                           .catch(error)
				})
			}
			doc(doc_url){
				return new Promise((success,error)=>{
					if(doc in this) return parse_document(doc_url,this[doc]).then(success).catch(error)
					return app.port.eval(url.os('doc.es6')).then(parser=>{
									this[doc] = parser
									return parse_document(doc_url,parser)
					          })
					          .then(success)
					          .catch(error)
				})
			}
			
		}
		
		//export cloud
		app.cloud = new Cloud()
		
		//---------------shared actions--------------
		function get_module(symbol, module_url){
			return app.port
			          .eval(module_url)
			          .then(module=>app.cloud[symbol] = module)
		}
		
		function parse_document(doc_url, module){ return module.get(doc_url); }
		function edus_document(edus_url, module){
			if( !('data' in app.cloud.edus) ) Object.defineProperty(app.cloud.edus,'data',{ get(){ return app.cloud.data(edus) } })
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
		
		
	},'IO')
})