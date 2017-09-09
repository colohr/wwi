(function(get_element){ return get_element() })
(function(){
	const eloading = Symbol.for('Element is currently loading')
	const eloads = Symbol.for('Element resource loading set')
	
	const fxy_port = new Proxy(resource,{
		get(o,name){
			switch(name){
				case 'eval':
				case 'module':
					return get_eval
					break
				case 'style':
					return port_style
			}
			if(name in o){
				let value = o[name]
				if(typeof value === 'function') return value.bind(o)
				return value
			}
			return null
		}
	})
	
	const fxy_dom = new Proxy(element,{
		get(o,name){
			switch(name){
				case 'find':
					return findit
					break
				case 'load':
				case 'module':
					return fxy_port
					break
				case 'get':
				case 'query':
					return query
					break
				case 'style':
					return get_style
			}
			if(name in o){
				let value = o[name]
				if(typeof value === 'function') return value.bind(o)
				return value
			}
			return null
		}
	})
	
	//exports
	fxy.dom = fxy_dom
    return fxy.port = fxy_port
	
	//shared actions
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
	
	function get_eval(url){ return get_promise(url).then( res => res.text() ).then( text => window.eval(text) ) }
	
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
				return
			};
			xhttp.onerror = function refineGetError(e){return reject(e)}
			xhttp.open('GET', url, true)
			return xhttp.send(null)
		})
	}
	
	function get_style(attributes,...imports){
		let value = element('style',attributes)
		if(imports.length) value.innerHTML = imports.map(item=>fxy.file.url(item)).map(item=>`@import "${item}";`).join('\n')
		return value
	}
	
	function port_style(...x){
		let attributes = x.filter(item=>fxy.is.data(item))[0] || null
		let imports = x.filter(item=>fxy.is.array(item))[0] || []
		let style = get_style(attributes,...imports)
		let files = x.filter(item=>fxy.is.text(item))
		let fetches = files.map(file=>window.fetch(fxy.file.url(file)).then(x=>x.text()))
		return Promise.all(...fetches).then(results=>{
			let html = results.filter(text=>fxy.is.text(text)).join('\n')
			style.innerHTML += html
			return style
		})
	}
	
	function query(selector){
		let el = window.document.head.querySelector(selector)
		if(el === null) el = window.document.body.querySelector(selector)
		return el
	}
	
	function resource( path, options, target ){
		
		let identity = fxy.file.identity( path instanceof URL ? path.toString() : path )
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
			let tag = 'script'
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
				case 'm4a':
				case 'mp3':
				case 'ogg':
					tag = 'audio'
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
				case 'audio':
					options.src = identity.path
					break
				case 'link':
					options.href = identity.path
					if( identity.type === 'css' ) options.rel = 'stylesheet'
					else options.rel = 'import'
					break
				case 'script':
					options.src = identity.path
					break
				default:
					break
			}
			options.id = identity.id
			return options
		}
		
	}
})