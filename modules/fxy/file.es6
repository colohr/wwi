(function(get_source){ return get_source() })
(function(){
	
	const regular_expressions = {
		host:new RegExp(window.location.host,'g'),
		http:new RegExp('http://','g'),
		https:new RegExp('https://','g'),
		port:new RegExp('wwi/port.')
	}
	
	const types = [
		'css',
		'es6',
		'gif',
		'html',
		'ico',
		'jpg',
		'json',
		'js',
		'm4a', //aac
		'mp3',
		'ogg',
		'png',
		'svg',
		'wav',
		'xml'
	]
	
	const host = `${window.location.protocol}//${window.location.host}`
	
	const fxy_file = {
		clean,
		clear,
		dir:get_folder,
		file:get_file,
		folder:get_folder,
		identity:get_identity,
		get host(){ return host },
		join,
		last:get_last,
		name:get_file,
		parts:get_parts,
		path:get_path,
		get regular_expressions(){ return regular_expressions },
		type:get_type,
		get types(){ return types },
		url:get_url
	}
	
    //exports
    return fxy.file = fxy_file
	
	//shared actions
	function clean(value){
		return get_parts(value).join('/')
	}
	
	function clear(value){
		return value.replace(regular_expressions.host, '')
		            .replace(regular_expressions.https, '')
		            .replace(regular_expressions.http, '')
	}
	
	function get_file(value){
		let last = get_last(value)
		if(last.includes('.')){
			let parts = last.split('.')
			if(parts.length > 1) return last
		}
		return ''
	}
	
	function get_folder(value){
		let path = get_path(value)
		let file = get_file(path)
		if(file) return path.replace(file,'').trim()
		return path
	}
	
	function get_identity(value,...custom_types){
		let name = get_file(value)
		return identify(name, value, get_type(name, custom_types))
	}
	
	function get_last(value){
		let parts = Array.isArray(value) ? value:get_parts(value)
		let count = parts.length
		return count > 0 ? parts[count-1]:false
	}
	
	function get_parts(path){
		if(typeof path !== 'string') return []
		return path.trim()
		           .split('/')
		           .map(part=>part.trim())
		           .filter(part=>part.length)
	}
	
	function get_path(value){
		return clean(clear(value)).trim()
	}
	
	function get_type(name, ...customs){
		let valids = types.filter(type=>name.includes(`.${type}`))
		if(valids.length) return valids[0]
		if(customs.length) valids = customs.filter(type=>name.includes(`.${type}`))
		return valids.length ? valids[0]:''
	}
	
	function get_url(...x){
		let value = join(...x)
		return `${host}/${value}`
	}
	
	function join(...x){
		return get_path(x.join('/'))
	}
	
	function identify(...x){
		return {
			get id(){
				let dir = get_folder(this.path).split('/').join('-')
				let el_id = `${dir+this.name.toLowerCase().replace('.min','').replace(`.${this.type}`,`-${this.type}`)}`
				if(el_id.includes('.')) return el_id.replace(/\./g,'_')
				return el_id
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
})