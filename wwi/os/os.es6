(function(window,factory){return factory(window)})(window,function(window){
	window.os = new Proxy({
		description:'log dir(IO) to see actual os object',
		get(name){
			switch(name){
				case 'cloud':
					return  'app' in window &&
							'cloud' in window.app  ?
							 window.app.cloud : null
				case 'edus':
					return  'app' in window &&
							'cloud' in window.app  ?
							 window.app.cloud.edus : null
				case 'io':
				case 'os':
					return window.IO
				case 'module':
					name = 'Module'
					break
				case 'site':
					name = 'Site'
					break
			}
			return 'IO' in window &&
				    name in window.IO ?
					window.IO[name] : null
		}
	},{
		get(o,name){ return o.get(name) },
		has(o,name){ return o.get(name) !== null }
	})
	
	return function( { kit, port, source  } ){
		return Promise.all( [
				'io.es6',
				'browser.es6',
				'database.es6',
				'module.es6',
				'site.es6',
				'cloud.es6' // doc.es6, edus.es6
			].map( file => source.url( kit.dir, 'os', file ) )
		     .map( url => port.eval(url) ) )
	}
})