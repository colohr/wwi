(function(get_url){ return get_url() })
(function(){
	const site = {
		get address(){ return window.location.origin.replace(`:${window.location.port}`,'') },
		get folder(){ return window.app.kit.has('folder') ? window.app.kit.get('folder'):'' }
	}
	
	class ModuleUrl{
		static get(...x){ return new ModuleUrl(null,null,...x) }
		constructor(address,folder,...items){
			this.items = items
			this.address = fxy.is.nothing(address) ? get_url_value('address',this.items):address
			this.folder = fxy.is.nothing(folder) ? get_url_value('folder',this.items):folder
			this.port = get_url_value('port',this.items)
		}
		get parts(){ return get_url_parts(this) }
		//prototype
		toString(){ return get_url_text(this) }
	}
	
	//exports
	return ModuleUrl
	
	//shared actions
	function add_slash(value){
		let count = value.length
		let last_character = value.charAt(count-1)
		if(last_character !== '/') value += '/'
		return value
	}
	
	function get_url_text(fxy_url){ return fxy_url.parts.join('') }
	
	function get_url_parts(fxy_url){
		let parts = [fxy_url.address]
		if(fxy_url.port) parts.push(add_slash(fxy_url.port))
		else parts = [add_slash(fxy_url.address)]
		parts.push(fxy_url.folder)
		return parts.filter(part=>fxy.is.text(part))
		            .map(part=>part.trim())
		            .filter(part=>part.length>0)
	}
	
	function get_url_value(type,items){
		let value = ''
		switch(type){
			case 'address':
				value = get_address(...items)
				break
			case 'folder':
				value = get_folder(...items)
				break
			case 'port':
				value = get_port(...items)
				break
		}
		return value
		
		//shared actions
		function get_address(...parts){
			let host = parts.filter(part=>window.fxy.is.text(part) && part.includes('http'))[0]
			if(window.fxy.is.nothing(host)) host = site.address
			if(site.folder && host.includes(site.address)){
				if(host.includes(site.folder) === false) {
					host = add_slash(host)
					host += site.folder
				}
			}
			return host
		}
		
		function get_folder(...parts){
			return parts.filter(part=>window.fxy.is.text(part) && !part.includes('http'))
			            .filter(part=>window.fxy.is.numeric(part) === false)
			            .join('/')
		}
		
		function get_port(...parts){
			let port = parts.filter(part=>window.fxy.is.numeric(part))[0]
			if(window.fxy.is.nothing(port)) return ''
			return `:${port}`
		}
		
	}
	
	
	
})