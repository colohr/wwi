(function (window, factory) {return factory(window)})(window, function (window) {
	if (!('URL' in window)) {
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	}
	if (!('requestAnimationFrame' in window)) {
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	}
	if (!('cancelAnimationFrame' in window)) {
		window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
	}
	return function ({kit, port, source}) {
		return Promise.all(['lodash.js', 'webcomponents/webcomponents.es6']
			.map(file => source.url(kit.dir, 'poly', file))
			.map(url => {
				return port.eval(url).then(evaluation=>{
					if (typeof evaluation === 'function') return evaluation({kit, port, source})
					return evaluation
				})
			}))
	}
})