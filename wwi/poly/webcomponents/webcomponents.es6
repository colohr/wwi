(function(webcomponents){ return webcomponents() })
(function(){
    return function get_webcomponents({ kit, port, source  }){
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
		    let newScript = document.createElement('script');
		    let polyfill_file = 'webcomponents-' + polyfills.join('-') + '.js';
		    let polyfill_file_url = kit.url('poly','webcomponents',polyfill_file)
		       newScript.src = polyfill_file_url
		       if (document.readyState === 'loading' && ('import' in document.createElement('link'))) {
		        document.write(newScript.outerHTML);
		       } else {
		        document.head.appendChild(newScript);
		       }
		    
		    
	    }
	    else {
		    //   var fire = function () {
		    //    requestAnimationFrame(function () {
		    //	    window.WebComponents.ready = true;
		    //	    document.dispatchEvent(new CustomEvent('WebComponentsReady', {bubbles: true}));
		    //    });
		    //   };
		    //   if (document.readyState !== 'loading') {
		    //    fire();
		    //   } else {
		    //    document.addEventListener('readystatechange', function wait() {
		    //	    fire();
		    //	    document.removeEventListener('readystatechange', wait);
		    //    });
		    //   }
	    }
        
        return {}
    }
})
