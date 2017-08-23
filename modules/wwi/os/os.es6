(function(window,factory){return factory(window)})(window,function(window){
	window.os = new Proxy({
		names:['browser','cloud','edus','io','graph','fxy.modules.os[*]'],
		get(name){
			switch(name){
				case 'browser':
					return window.fxy.browser
					break
				case 'cloud':
					return  'app' in window &&
					'cloud' in window.app  ?
						window.app.cloud : null
				case 'edus':
					return  'app' in window &&
					'cloud' in window.app  ?
						window.app.cloud.edus : null
				case 'io':
					return 'io' in window ? window.io:null
				case 'graph':
					name = 'Graph'
					break
			}
			return window.fxy.modules.os[name]
		}
	},{
		get(o,name){ return o.get(name) },
		has(o,name){ return o.get(name) !== null }
	})
	
	return function(){
		return Promise.all( [
			//'io.es6',
			//'browser.es6',
			//'database.es6',
			//'module.es6',
			'cloud.es6' // doc.es6, edus.es6
			//'library.es6'
		].map( file => window.fxy.file.url( window.kit.dir, 'os', file ) )
		 .map( url => window.fxy.port.eval(url) ) )
	}
})