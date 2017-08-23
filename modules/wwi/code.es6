const π = 3.141592653589793;
(function wwi_port( ...io ){return io[0](...(io.slice(1,io.length)))})(
	function wwi_get_base( get_fxy, get_kit, get_module, load_window, window){
		let base_element = window.document.currentScript
		base_element.setAttribute('url-kit','')
		window.addEventListener('load',load_window)
		return get_fxy(base_element, get_kit, get_module, window)
	},
	function wwi_get_fxy(element, export_base, port_module, window){
		
		let base = {
			element,
			host:window.location.origin,
			modules:element.hasAttribute('modules') ? element.getAttribute('modules'):'modules',
			remote:window.location.host.includes('localhost') === false
		}
		
		//return value
		return get_modules().then(_=>export_base(port_module,window)).catch(console.error)
		function get_fxy(){ return window.fetch(`${base.host}/${base.modules}/fxy/fxy.es6`).then(response=>response.text()).then(fxy_script=>window.eval(fxy_script)(base.modules)) }
		function get_modules(){return new Promise((success,error)=>get_fxy().then(_=>get_url()).then(success).catch(error))}
		function get_url(){ return window.fetch(`${base.host}/${base.modules}/url/url.es6`).then(response=>response.text()).then(url_source=>window.eval(url_source)(base.modules,base)) }
	},
	function wwi_get_kit(port_module,window){
		
		//return value
		return  setup()
		
		//shared actions
		function setup(){
			let kit = window.kit
			let base_element = document.head.querySelector('base')
			if(base_element === null){
				base_element = document.createElement('base')
				base_element.href = window.fxy.file.url(kit.base.element.hasAttribute('path') ? kit.base.element.getAttribute('path') :'/')
				document.head.insertBefore(base_element,kit.base.element)
			}
			kit.base.element.setAttribute('wwi-port-load','')
			kit.base_element = base_element
			kit.javascript = kit.base.element.src.includes('es6') ? 'es6':'js'
			return port_module(...[ window.fxy.dom.query, window.fxy.port, window.fxy.file, window ])
		}
		
	},
	function wwi_module( query, resource, source, window){
		
		const kit_components = {
			account:{
				get firebase(){
					if(kit.has('firebase-account')) return kit.get('firebase-account')
					return 'firebase-account.js'
				}
			},
			get bower_components(){
				if(kit.has('bower')) return kit.get('bower')
				return 'bower_components'
			},
			get imports(){ return kit.has('import') ? kit.get('import') : false },
			optionals:['kit','app','polymer'],
			extensions: {
				get firebase(){
					let firebase_file = kit.get('firebase')
					if(firebase_file) return firebase_file
					return 'https://www.gstatic.com/firebasejs/4.1.1/firebase.js'
				},
				graph:'library/graph/load.es6',
				socket:'poly/socket.io.js'
			}
		}
		
		const world_wide_internet = {
			components(kit){ return kit.has('import') ? [kit.get('import')] : [] },
			get(promise_all){
				if(!window.fxy.browser.compatability.web_components) return get_eval(window.url.wwi('poly/poly.es6')).then(_=>promise_all(this.items))
				return promise_all(this.items)
			},
			items:['wwi.es6','app.es6','os/os.es6'].map(file=>window.url.wwi(file))
		}
		
		//global values
		return window_load()
		
		//shared actions
		function get_eval(file){ return window.fetch(file).then(res=>res.text()).then(text=>window.eval(text)) }
		
		function window_load(){
			
			//exports
			return window_resources().then(window_ports).then(window_finish).catch(console.error)
			
			//shared actions
			function window_finish(){
				window.fxy.service_worker()
				window.document.body.removeAttribute('unresolved')
				let app_element = window.app.element
				if(app_element) window.fxy.when(app_element.localName).then(()=>window.document.body.setAttribute('components-ported',''))
				else window.document.body.setAttribute('components-ported','')
				return window.dispatchEvent( new CustomEvent('app', { bubbles: true, detail: window.app } ))
			}
			
			function window_imports(){ return Promise.all(world_wide_internet.components(kit).map(kit_url=>resource(kit_url))) }
			
			function window_firebase(){
				return new Promise((success,error)=>{
					if(kit.has('firebase')) return get_eval(window.url.site(kit_components.account.firebase)).then(success).catch(error)
					return success()
				})
			}
			
			function window_code(){
				return new Promise((success,error)=>{
					if(kit.has('code')) {
						let codes = kit.get('code').split(',').map(item=>item.trim()).filter(item=>item.length)
						if(codes.length){
							codes = codes.map(file=>{
								if(file.includes('http')) return file
								return window.url(file)
							})
							return Promise.all(codes.map(file=>get_eval(file))).then(success).catch(error)
						}
					}
					return success()
				})
			}
			
			function window_ports(){
				
				//exports
				return finish()
				
				//shared actions
				function finish(){
					return load_library().then(_=>window_code())
					                     .then(_=>load_extensions())
					                     .then(_=>window_firebase())
					                     .then(_=>get_eval(window.url.component('component.es6')))
					                     .then(window_imports)
				}
				
				function load_extensions(){
					let extensions = []
					for(let name in kit_components.extensions){
						if(kit.has(name)){
							let extension_value = kit_components.extensions[name]
							switch(name){
								case 'firebase':
									extensions.push(resource(extension_value))
									break
								default:
									let extension_url = window.url.wwi(extension_value)
									extensions.push(get_eval(extension_url))
									break
							}
						}
					}
					return Promise.all(extensions)
				}
				
				function load_library(){ return get_eval(window.url.library('library.es6')) }
				
			}
			
			function window_resources(){
				return world_wide_internet.get(promise_all)
				//shared actions
				function promise_all(resources){
					let sources = {}
					for(let file of resources) sources[file] = null
					return new Promise((success,error)=>promise_next(()=>success(),error))
					function promise_next(done,error){
						for(let name in sources) return resource_promise(name).then(_=>{delete sources[name]; return promise_next(done,error)}).catch(error)
						return done()
					}
				}
				
				function resource_promise(item){
					return get_eval(item).then(response=>{
						if(typeof response !== 'function') return response
						return response()
					})
				}
			}
		}
		
	},
	function wwi_window_load(){
		window.addEventListener('WebComponentsReady',function(){ window.document.body.classList.toggle('web-components-ready',true) }) //console.log({WebComponentsReady:'event'})
		window.addEventListener('HTMLImportsReady',function(){ window.document.body.classList.toggle('html-imports-ready',true) }) //console.log({HTMLImportsReady:'event'})
	},this)