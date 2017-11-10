(function wwi_static(load,...x){ return load(...x) })(
function load_static(window){
	class Semantic{
		constructor(semantics){
			let typed = all('[wwi-type]')
			let types = Array.from(new Set(typed.map(e=>e.wwi_type)))
			window.addEventListener('fxy',e=>{
				if('fxy' in semantics) semantics.fxy(this)
				Promise.all(types.map(name=>fxy.port(window.url.types(`${name}.js`)))).then(()=>{
					if('Type' in semantics){
						let wwi_types = fxy.modules['wwi-types']
						for(let container of typed) semantics.Type(wwi_types[container.wwi_type],container,this)
					}
				})
			})
		}
		get all(){ return all }
		get footer(){ return query('footer') }
		get query(){ return query }
		get header(){ return query('header') }
		get navigation(){ return query('nav') }
		get sections(){ return all('section') }
	}
	 //exports
	 return (function window_static(semantics){
	 	if(typeof semantics === 'object' && semantics !== null){
		    let semantic = new Semantic(semantics)
		    let wwis = all('[wwi]')
		    for(let element of wwis) semantic[element.wwi] = element
		    if('ready' in semantics) semantics.ready(semantic)
		    return window.addEventListener('wwi',function wwi_loaded(){
			    window.wwi.semantic = semantic
			    delete window.semantic
			    if('wwi' in semantics) semantics.wwi(semantic)
		    })
	    }
		return null
	})(window.semantic)
	//shared actions
	function all(selector,element = window.document){ return dom(...Array.from(element.querySelectorAll(selector || "body > *"))) }
	function dom(...elements){
		return elements.map(get_dom)
		//shared actions
		function get_dom(element){
			if(!element) return element
			return new Proxy(element,{deleteProperty:remove, get, has, set})
			//shared actions
			function attribute(e,name,value){
				let output = null
				if(typeof name === 'string'){
					name = name.replace(/_/g,'-')
					if((typeof value === "boolean" || value === null) && name.indexOf('aria-') !== 0){
						if(value === false || value === null) e.removeAttribute(name)
						else e.setAttribute(name,'')
					}
					else if(typeof value !== "undefined") e.setAttribute(name,value)
					if(e.hasAttribute(name)) {
						output = e.getAttribute(name)
						if(output === '' || output === 'true') output = true
						else if(output === 'false') output = false
					}
				}
				return output
			}
			function get(e,name){
				let value = null
				if(name in e) value = e[name]
				else if(name === 'all' || name === 'query'){
					if(name === 'all') return selector=>all(selector,e)
					else return selector=>query(selector,e)
				}
				if(typeof value === 'function') value = value.bind(e)
				else if(value === null) value = attribute(e,name)
				return value
			}
			function has(e,name){
				if(name in e) return true
				else if(typeof name === 'string' && e.hasAttribute(name.replace(/_/g,'-'))) return true
				return false
			}
			function set(e,name,value){
				if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) attribute(e,name,value)
				else e[name] = value
				return true
			}
			function remove(e,name){
				if(name in e) delete e[name]
				else attribute(e,name,null)
				return true
			}
		}
	}
	function query(selector,element = window.document){ return dom(element.querySelector(selector || "body > *"))[0] }
	
}, this)