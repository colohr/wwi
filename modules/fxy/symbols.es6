(function(get_symbols){ return get_symbols() })
(function(){
	const added_symbols = Symbol.for('user added symbols')
	const Symbols = {
		
		a11y:{
			connected:Symbol.for('a11y connected element'),
			element:Symbol.for('a11y element'),
			is:Symbol.for('state: is a11y element'),
			type:Symbol.for('state: has a11y type value'),
			kind:Symbol.for('state: has a11y kind value')
		},
		[added_symbols]:{},
		get ally(){return this.a11y},
		define:Symbol.for('pre define mixins'),
		disable:Symbol('disabled state'),
		dont_mix:Symbol('function is not a mixin'),
		enable:Symbol('enabled state'),
		'false':Symbol('false value'),
		nil:Symbol('nil value or null'),
		routes:Symbol.for('element routes'),
		'true':Symbol('true value'),
		uid:Symbol('uid value'),
		
		Listener: Symbol(' element listener '),
		Callbacks: Symbol(' element callbacks '),
		Properties: Symbol(' element properties '),
		Canvas: Symbol(' element canvas '),
		AttributeData: Symbol(' element attributes '),
		
		Pointable: {'click': true, 'down': true, 'up': true, tap: true},
		Methods: {
			dragover(e){
				e.preventDefault()
			}
		},
		Restyle: {
			types: [
				{
					keys: 'drag start',
					pointable: true,
					css: {
						userSelect: 'none'
					}
				}
			],
			clientType(client, type){
				let css = type.css;
				let o = {}
				for (let key in css) {
					let v = client.vendor(window.document.body.style, key);
					if ('value' in v) {
						o[v.key] = css[key]
					} else {
						o[key] = css[key]
					}
				}
				return o;
			},
			event(type, element){
				if (typeof type !== 'string' || !(element instanceof HTMLElement)) return element;
				let types = this.types;
				let client = window.app && window.app.client ? window.app.client : null;
				let isPointer = type in Symbols.Pointable
				types.forEach((T) => {
					let has = (isPointer && T.pointable) || T.keys.includes(type)
					if (has) {
						let css = client ? this.clientType(client, T) : T.css;
						Object.assign(element.style, css);
					}
				});
				return element;
			}
		}
	}
	
	Object.defineProperty(fxy,'symbols',{
		get(){
			return new Proxy(Object.keys(Symbols),{
				get(o,name){
					if(name in Symbols) return Symbols[name]
					else if(name in Symbols[added_symbols]) return Symbols[added_symbols][name]
					else if(typeof name === 'string') return Symbol.for(name)
					return null
				},
				has(o,name){
					return name in Symbols || name in Symbols[added_symbols]
				},
				set(o,name,value){
					if(is_text(value)) {
						if(!is_symbol(value)) console.warn(`New Symbol ${name} = ${value} is not a symbol. It will change to the Symbol.for(${value})`)
						Symbols[added_symbols][name] = Symbol.for(value)
					}
					return true
				},
				deleteProperty(o,name){
					if(name in Symbols[added_symbols]) delete Symbols[added_symbols][name]
					return name
				}
			})
		}
	})
	
	//return value
	//return fxy
	
	//shared actions
	function is_symbol(...x){ return fxy.is.symbol(...x) }
	function is_text(...x){ return fxy.is.text(...x) }
})







