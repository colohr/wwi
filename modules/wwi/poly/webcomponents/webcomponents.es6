(function(webcomponents){ return webcomponents() })
(function(){
    return function get_webcomponents({kit}){
	    window.WebComponents = window.WebComponents || {}
	    let polyfills = []
	    if (!('import' in document.createElement('link'))) {
		    polyfills.push('hi')
	    }
	    if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype) ||
		    (window.ShadyDOM && window.ShadyDOM.force)) {
		    polyfills.push('sd')
	    }
	    if (!window.customElements || window.customElements.forcePolyfill) {
		    polyfills.push('ce')
	    }
	    if (!('content' in document.createElement('template')) || !window.Promise || !Array.from ||
		    !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment)) {
		    polyfills = ['lite']
	    }
	    if (polyfills.length) {
	    	let newScript = document.createElement('script')
		    let polyfill_file = 'webcomponents-' + polyfills.join('-') + '.js'
		    newScript.src = kit.url('poly','webcomponents',polyfill_file)
		    if (document.readyState === 'loading' && ('import' in document.createElement('link'))) document.write(newScript.outerHTML);
	    	else document.head.appendChild(newScript)
	    }
        return {}
    }
})
