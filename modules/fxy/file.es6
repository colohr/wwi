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
		clean( path ){
			return this.parts( path ).join('/')
		},
		clear( x ){
			return x.replace( regular_expressions.host, '')
			        .replace( regular_expressions.https, '')
			        .replace( regular_expressions.http, '')
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
				if(parts.length > 1) return last
			}
			return ''
		},
		identity(path , ...custom_types){
			let name = this.file( path )
			return identify( name, path, this.type(name, custom_types) )
		},
		get host(){ return host },
		join( ...x ){
			return this.path( x.join('/') )
		},
		last( path ){
			let parts = Array.isArray(path) ? path : this.parts(path)
			let count = parts.length
			return count > 0 ? parts[ count-1 ] : false
		},
		get name(){ return this.file },
		get parts(){ return get_parts },
		path(x){ return this.clean(this.clear(x)).trim() },
		get regular_expressions(){ return regular_expressions },
		get type(){ return get_type },
		get types(){ return types },
		url( ...paths ){ return `${host}/${ this.join(...paths) }` }
	}
	
    //exports
    return fxy.file = fxy_file
	
	//shared actions
	function get_parts(path){
		if(typeof path !== 'string') return []
		return path.trim()
		           .split('/')
		           .map(part=>part.trim())
		           .filter(part=>part.length)
	}
	
	function get_type(name, ...customs){
		let valids = types.filter(type=>name.includes(`.${type}`))
		if(valids.length) return valids[0]
		if(customs.length) valids = customs.filter(type=>name.includes(`.${type}`))
		return valids.length ? valids[0]:''
	}
	
	function identify(...x){
		return {
			get id(){
				let dir = fxy_file.dir(this.path).split('/').join('-')
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