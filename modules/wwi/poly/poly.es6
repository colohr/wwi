(function (window, factory) {return factory(window)})(window, function (window) {
	let fxy = window.fxy
	return fxy.port.eval(window.url.wwi.poly('webcomponents/webcomponents.es6'))
	          .then(value=>{
	             if (typeof value === 'function') return value({get kit(){ return window.kit }, get port(){ return fxy.port }, get source(){ return fxy.file }})
	             return value
             })
})