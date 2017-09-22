const π = 3.141592653589793;
(function wwi_port( ...io ){return io[0](...(io.slice(1,io.length)))})(
function wwi_get_base( get_fxy, get_kit, get_module, load_window, window){
	let element = window.document.currentScript
	element.setAttribute('url-kit','')
	window.addEventListener('load',load_window)
	return get_fxy(element, get_kit, get_module, window)
},
function wwi_get_fxy(element, export_base, port_module, window){
	let data = {
		element,
		host:window.location.origin,
		modules:get_modules_location(),
		location:get_location(),
		remote:window.location.host.includes('localhost') === false
	}
	data.base_element = get_base()
	//return value
	return get_modules().then(_=>export_base(port_module,window)).catch(console.error)
	//shared action
	function get_fxy(){ return window.fetch(`${data.location}/${data.modules}/fxy/fxy.es6`).then(response=>response.text()).then(fxy_script=>window.eval(fxy_script)(`${data.location}/${data.modules}`)) }
	function get_modules(){return new Promise((success,error)=>get_fxy().then(_=>get_url()).then(success).catch(error))}
	function get_url(){ return window.fetch(`${data.location}/${data.modules}/url/url.es6`).then(response=>response.text()).then(url_source=>window.eval(url_source)(data.modules,data)) }
	
	function get_location(){
		let host = window.location.host
		let path = window.location.pathname
		let paths = path.split('/').filter(item=>item.length)
		if(paths.length){
			let last = paths[paths.length-1]
			if(last.includes('.')) paths.filter(item=>item===last)
		}
		paths.unshift(host)
		return `${window.location.protocol}//${paths.join('/')}`
	}
	function get_modules_location(){
		let value = 'modules'
		if(element.hasAttribute('modules')) value = element.getAttribute('modules')
		return value.split('/').filter(item=>item.length).join('/')
	}
	function get_base(){
		let base_element = window.document.head.querySelector('base')
		if(base_element === null){
			base_element = window.document.createElement('base')
			base_element.href = data.location
			window.document.head.insertBefore(base_element,element)
		}
		return base_element
	}
},
function wwi_get_kit(port_module,window){
	//return value
	return  setup()
	//shared actions
	function setup(){
		let kit = window.kit
		kit.base.element.setAttribute('wwi-port-load','')
		kit.javascript = kit.base.element.src.includes('es6') ? 'es6':'js'
		return port_module(...[ window.fxy.dom.query, window.fxy.port, window.fxy.file, window ])
	}
},
function wwi_module( query, resource, source, window){
	const kit_components = {
		get imports(){ return kit.has('import') ? kit.get('import') : false },
		get firebase(){
			let firebase_file = kit.get('firebase')
			if(firebase_file) return firebase_file
			return 'https://www.gstatic.com/firebasejs/4.3.1/firebase.js'
		},
		get firebase_account(){
			if(kit.has('firebase-account')) return kit.get('firebase-account')
			return 'firebase-account.js'
		}
	}
	
	const world_wide_internet = {
		components(kit){ return kit.has('import') ? [kit.get('import')] : [] },
		get(promise_all){
			if(!window.fxy.browser.compatability.web_components) return get_eval(window.url.wwi('poly/poly.es6')).then(_=>promise_all(this.items))
			return promise_all(this.items)
		},
		items:['wwi.es6','app.es6'].map(file=>window.url.wwi(file))
	}
	
	//global values
	return window_load()
	//shared actions
	function get_eval(file){ return window.fetch(file).then(res=>res.text()).then(text=>window.eval(text)).catch(e=>{ console.warn(file); console.error(e) }) }
	
	function window_load(){
		//exports
		return window_resources().then(window_ports).then(window_finish).catch(console.error)
		//shared actions
		function window_code(){
			return new Promise((success,error)=>{
				if(kit.has('code')) {
					let codes = kit.get('code').split(',').map(item=>item.trim()).filter(item=>item.length)
					if(codes.length){
						codes = codes.map(file=>{
							if(file.includes('http')) return file
							return window.url(file)
						})
						return Promise.all(codes.map(file=>window.fxy.port(file,{defer:'',async:''}))).then(success).catch(error)
					}
				}
				return success()
			})
		}
		
		function window_finish(){
			world_wide_internet.components(kit).map(kit_url=>resource(kit_url))[0].then(()=>load_rest())
			window.fxy.service_worker()
			window.document.body.removeAttribute('unresolved')
			let app_element = window.app.element
			if(app_element) window.fxy.when(app_element.localName).then(()=>window.document.body.setAttribute('components-ported',''))
			else window.document.body.setAttribute('components-ported','')
			return window.dispatchEvent( new CustomEvent('app', { bubbles: true, detail: window.app } ))
			//shared actions
			function load_rest(){
				if(kit.has('firebase')){
					window.fxy.port(kit_components.firebase,{async:'',defer:''}).then(()=>{
						if(kit.has('firebase-account')) window.fxy.port(window.url.site(kit_components.firebase_account),{async:'',defer:''}).catch(console.error)
					}).catch(console.error)
				}
			}
		}
		
		function window_ports(){
			//exports
			return  window_code().then(_=>get_eval(window.url.component('component.es6')))
		}
		
		function window_resources(){
			return world_wide_internet.get(promise_all)
			//shared actions
			function promise_all(resources){
				let sources = {}
				for(let file of resources) sources[file] = null
				return new Promise((success,error)=>promise_next(()=>success(),error))
				function promise_next(done,error){
					for(let name in sources) return get_eval(name).then(response=>typeof response === 'function'?response():response).then(()=>{delete sources[name]; return promise_next(done,error)}).catch(error)
					return done()
				}
			}
		}
	}
},
function wwi_window_load(){
	window.addEventListener('HTMLImportsReady',function(){ window.document.body.classList.toggle('html-imports-ready',true) }) //console.log({HTMLImportsReady:'event'})
	window.addEventListener('WebComponentsReady',function(){ window.document.body.classList.toggle('web-components-ready',true) }) //console.log({WebComponentsReady:'event'})
},this)