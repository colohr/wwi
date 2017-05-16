const π = 3.141592653589793;
(function wwi_port( ...io ){return io[0](...(io.slice(1,3)))})(
function wwi_port_base( port_module, window  ){
	
	const eloading = Symbol.for('Element is currently loading')
	const eloads = Symbol.for('Element resource loading set')
	const file = {
		types:['es6','js','html','json','css','png','svg','jpg','gif','ico','xml'],
		regs:{
			host:new RegExp(window.location.host,'g'),
			http:new RegExp('http://','g'),
			https:new RegExp('https://','g'),
			port:new RegExp('wwi/port.')
		}
	}
	
	const host = `${window.location.protocol}//${window.location.host}`
	
	const source = {
		clean( path ){
			return this.parts( path ).join('/')
		},
		clear( x ){
			return x.replace( file.regs.host, '')
			        .replace( file.regs.https, '')
			        .replace( file.regs.http, '')
		},
		dir( x ){
			let path = this.path( x )
			let file = this.file( path )
			if(file) return path.replace( file, '').trim()
			return path
		},
		file(path){
			let last = this.last( path )
			if(last.includes('.')){
				let parts = last.split('.')
				if(parts.length > 1 && file.types.includes(parts[1])) return last
			}
			return false
		},
		identity( path ){
			let name = this.file( path )
			let type = file.types.filter( type => { return name.includes(type) })[0]
			return identify( name, path, type )
		},
		join( ...x ){
			return this.path( x.join('/') )
		},
		last( path ){
			let parts = Array.isArray(path) ? path : this.parts(path)
			let count = parts.length
			return count > 0 ? parts[ count-1 ] : false
		},
		parts( path ){
			return  typeof path === 'string' ?
					path.trim().split('/').map( part => part.trim() )
				    .filter( part => { return part.length > 0 }) : []
		},
		path( x ){
			return this.clean( this.clear(x) ).trim()
		},
		url( ...paths ){
			return `${host}/${ this.join(...paths) }`
		}
	}
	
	//--------port action-------
	const ios = setup({
		host,
		remote:window.location.host.includes('localhost') === false
	})
	return port_module( ...ios )
	
	
	//----------shared actions---------
	function element( tag, options ){
		let el = window.document.createElement(tag)
		if( options ) for( let name in options ) el.setAttribute( name,options[name] )
		return el
	}
	
	function findit( type ){
		let found
		if(type in file.regs) {
			let scripts = Array.from( window.document.scripts )
			found = scripts.filter( script => {
			              	return file.regs[type].test( script.src )
			              } )[0]
		}
		return found || null
	}
	
	function identify(...x){
		return {
			get id(){
				let dir = source.dir(this.path).split('/').join('-')
				return `${dir+this.name.toLowerCase().replace('.min','').replace(`.${this.type}`,`-${this.type}`)}`
			},
			name:x[0],
			path:x[1],
			get selector(){
				let tag = 'tag' in this ? this.tag:''
				return `${tag}#${this.id}`
			},
			type:x[2] || ''
		}
	}
	
	function query(selector){
		var el = window.document.head.querySelector(selector)
		if(el === null) el = window.document.body.querySelector(selector)
		return el
	}
	
	function resource( path, options, target ){
		
		let identity = source.identity( path instanceof URL ? path.toString() : path )
		identity.tag = element_tag( identity.type )
		
		return element_load( identity, options, target )
		
		//---------------source actions---------------
		function element_add_load( el, selector, target ){
			let loads = eloads in window ? window[eloads] : window[eloads] = new Set()
			target = target ? target : 'rel' in el ?  window.document.head : window.document.body
			loads.add(selector)
			target.appendChild( el )
			return true
		}
		
		function element_exists( selector ){
			return {
				get dom(){ return this.element !== null },
				element:query(selector),
				get error(){
					if(this.dom && 'error' in this.element) return this.element.error
					return false
				},
				get loading(){ return element_loading(this.selector) },
				promise(success,error){
					let e = this.loading ? eloading : this.error ? this.error : this.element
					if( e ) {
						if( e instanceof Error ) error( e )
						else success( e )
						return false
					}
					return true
				},
				selector
			}
		}
		
		function element_load( identity , options,  target ){
			return new Promise(( success, error )=>{
				let selector = identity.selector
				let exists = element_exists( selector )
				if( exists.promise( success, error ) ){
					options = element_options( options, identity )
					let el = element( identity.tag, options )
					el.setAttribute('from-wwi-port','')
					el.onload = () => {
						el.setAttribute('did-load','')
						element_loaded(selector)
						return success( el )
					}
					el.onerror = (e)=>{
						el.error = e
						element_loaded(selector)
						return error(el.error)
					}
					return element_add_load( el ,selector, target )
				}
				return true
			})
		}
		
		function element_loaded(selector){
			if(eloads in window){
				window[eloads].delete(selector)
				if(!window[eloads].size) delete window[eloads]
			}
			return true
		}
		
		function element_loading( selector ){
			if( eloads in window ) return window[eloads].has( selector )
			return false
		}
		
		function element_tag( type ){
			var tag = 'script'
			switch(type){
				case 'css':
				case 'html':
					tag = 'link'
					break
				case 'gif':
				case 'jpg':
				case 'png':
					tag = 'img'
					break
				case 'svg':
					tag = 'svg'
					break
				case 'xml':
					tag = 'xml'
					break
				default: break
			}
			return tag
		}
		
		function element_options( options , identity ){
			options = typeof options !== 'object' ? {} : options
			Object.assign( {async:true,defer:false}, options )
			switch( identity.tag ){
				case 'script':
					options.src = identity.path
					break
				case 'link':
					options.href = identity.path
					if( identity.type === 'css' ) options.rel = 'styesheet'
					else options.rel = 'import'
					break
				default:
					break
			}
			options.id = identity.id
			return options
		}
		
	}
	
	function setup( base ){
		
		resource.loading = eloading
		base.element = get_element()
		base.javascript = get_js_type( base.element.src )
		return [ base, element, file, find, query, resource, source, window ]
		
		//----------base actions--------
		function get_js_type( src ){ return src.includes('es6') ? 'es6':'js' }
		function get_element(){
			let el = findit('port')
			if( !el.hasAttribute('wwi-port-load') ) el.setAttribute('wwi-port-load','')
			return el
		}
		
	}
	
},
function wwi_port_module( base, element, find, file, query, resource, source, window ){
	
	//const script_element = Symbol.for('The script source element in the main document')
	const world_wide_internet = {
		items:new Map([ ['poly','poly'], ['wwi',''], ['app', ''], ['os','os'] ]),
		folder:'wwi',
		components(kit){
			let user_elements = kit.has('import') ? kit.get('import') : false
			let components = [
				source.url( kit.host, kit.path, kit.modules, this.folder, 'component/index.html' )
			]
			if(user_elements) components.push(user_elements)
			return components
		},
		resources(kit){
			if(this.has) return this.items
			for(let info of this.items){
				let item = {
					name:info[0],
					folder:info[1],
					url: source.url( kit.host, kit.path, kit.modules, this.folder, info[1], `${info[0]}.es6`)
				}
				this.items.set( item.name,  item )
				this.has = true
			}
			return this.items
		}
	}
	
	const kit = {
		get dir(){ return source.dir( base.element.getAttribute('src') ) },
		get edus(){ return this.has('edus') },
		get(name){ return this.selfie.getAttribute(name) },
		has(name){ return this.selfie.hasAttribute(name) },
		get host(){ return source.host },
		get modules(){ return this.get('modules') || '' },
		get path(){ return this.get('path') || this.dir },
		get selfie(){ return base.element },
		set(name,value){ return this.selfie.setAttribute(name,value) },
		site:{
			cloud:window.location.href,
			host:source.is_remote ? source.host:'http://localhost',
			path:window.location.pathname,
			secure:window.location.protocol === 'https:',
			url:source.host,
		},
		url(...x){
			x.unshift(this.dir)
			return source.url( ...x )
		}
	}
	
	window.url = new Proxy({
		folders:{
			edus:'edus',
			elements:'custom-elements',
			modules:'modules',
			wwi:'modules/wwi'
		},
		url(folder, path){
			let folder_paths = [kit.path, folder]
			//add the path to the folder paths if it exists
			if(path) folder_paths.push(path)
			return function url_from_kit_path(...x){
				if(x.length){
					let last = x[x.length - 1]
					if(last[last.length-1] === '.'){
						x[x.length - 1] = last.replace('.','')
						x.push(`${x[x.length - 1]}.es6`)
					}
				}
				//paths for the source url
				let paths = [].concat(folder_paths).concat(x)
				return source.url(...paths)
			}
		}
	},{
		get(o,name){
			name = name === 'vally' ? 'va11y' : name
			if(name in o.folders) return o.url(o.folders[name])
			//default that is the kit.path/modules/wwi
			return o.url(o.folders.wwi, name)
		}
	})
	
	const components = {
		get bower_components(){
			if( kit.has('bower') ) return kit.get('bower')
			return 'bower_components'
		},
		get imports(){
			return kit.has('import') ? kit.get('import') : false
		},
		optionals:['kit','app','polymer'],
	}
	
	
	//readd - webcomponentsjs/webcomponents-loader.js
	window.addEventListener('load',window_load)
	
	//-----------shared actions----------
	
	function get_eval(url){
		return get_promise(url).then( res => res.text() ).then( text => window.eval(text) )
	}
	
	function get_promise(url){
		return new Promise(function(resolve,reject){
			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function refineGetFunc(e){
				if (e.target.readyState === XMLHttpRequest.DONE) {
					if (e.target.status === 200){
						return resolve({
							responseText:e.target.responseText,
							text(){return new Promise((r)=>{return r(this.responseText)})}
						})
					}
					else reject(new Error('Status: '+e.target.status))
				}
				return;
			};
			xhttp.onerror = function refineGetError(e){return reject(e)};
			xhttp.open('GET', url, true);
			return xhttp.send(null);
		})
	}
	
	function get_service_worker(){
		if (kit.has('service-worker')) return navigator.serviceWorker.register(kit.get('service-worker'))
		return null
	}
	
	
	//----------------window actions---------------
	function window_load(){
		
		window.addEventListener('WebComponentsReady',function(){ window.document.body.classList.toggle('web-components-ready',true) }) //console.log({WebComponentsReady:'event'})
		window.addEventListener('HTMLImportsReady',function(){ window.document.body.classList.toggle('html-imports-ready',true) }) //console.log({HTMLImportsReady:'event'})
		
		//---------port--------------
		return window_resources().then(window_ports).then(window_finish).catch(console.error)
		
		//---------port actions-----------
		function window_finish(){
			//backwards compatability with previous app.es6 window.app
			//it notifies all things waiting for the app to be loaded
			window.app.ready('application', null)
			window.document.body.setAttribute('apploaded', '')
			
			//add some "finished" attributes to the body
			window.document.body.removeAttribute('unresolved')
			window.document.body.setAttribute('components-ported','')
	
			return window.dispatchEvent( new CustomEvent('app', { bubbles: true, detail: window.app } ))
		}
		
		function window_imports(){ return Promise.all( world_wide_internet.components(kit).map( url => resource(url) ) ) }
		
		function window_ports(resources){
			
			for(let item of resources.values()){
				switch(item.name){
					case 'os':
						for(let name in item.data) IO[name] = item.data[name]
						break
					case 'app':
						item.data.kit = kit
						item.data.source = source
						item.data.port = resource
						item.data.port.eval = get_eval
						break
				}
			}
			
			let wwis = [
				window.url.component('component.es6'),
				// window.url.vally('va11y.es6')
			]
		
			return window.app
			             .port
			             .eval(wwis[0])
			             .then(()=>wwis[1])
			             .then(next=>get_eval(next))
			             .then(window_imports)
			
		}
		
		function window_resources(){
			let resources = world_wide_internet.resources(kit)
			return Promise.all(Array.from(resources.values()).map(resource_promise)).then(responses=>resources)
			
			//-----------resources actions-----------
			function resource_promise(item){
				let responder = { item, kit, port:{ base, eval: get_eval, resource } , source }
				return get_eval(item.url).then( response => {
					let type = typeof response
					if(type !== 'function') return parsificate_the_itemism( item, response, type )
					return response(responder).then(data=>parsificate_the_itemism( item, data, typeof data ))
				})
			}
			function parsificate_the_itemism(item,response,type){
				if(type === 'object') response = valid(response)
				if( save( response ) ) item.data = response
				return item
				//--------parsification actions------------
				function valid(x){
					if(save(x) && !Array.isArray(x)) return x
					let array = Object.keys(x).map(key=>x[key]).filter(value => save(value))
					if(array.length <= 1) return array[0]
					return valids(array)
				}
				function valids(x){ let o = {}; x.forEach((v,i)=>{ o[valid_key(v)] = v }); return o }
				function valid_key(x,i){ if(typeof x === 'function') return x.name; if(typeof x === 'object') return x.constructor.name.toLowerCase(); return i }
				function save(x){
					return (typeof x === 'object' && !empty_data(x)) || typeof x === 'function'
					function empty_data(x){ if(x instanceof Map) return false; return Object.keys(x).length <= 0 }
				}
			}
		}
		
		
	}
	
}, this)



