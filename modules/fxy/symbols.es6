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
		listener: Symbol('element listener'),
		actions: Symbol('element actions'),
		Properties: Symbol('element properties'),
		Canvas: Symbol('element canvas'),
		AttributeData: Symbol('element attributes'),
	}
	
	Object.defineProperty(fxy,'symbols',{
		get(){
			return new Proxy(Object.keys(Symbols),{
				deleteProperty(_,name){
					if(name in Symbols[added_symbols]) delete Symbols[added_symbols][name]
					return true
				},
				get(_,name){
					if(name in Symbols) return Symbols[name]
					else if(name in Symbols[added_symbols]) return Symbols[added_symbols][name]
					else if(typeof name === 'string') return Symbol.for(name)
					return null
				},
				has(_,name){ return name in Symbols || name in Symbols[added_symbols] },
				set(_,name,value){
					if(typeof value === 'string') value = Symbol.for(value)
					if(typeof value === 'symbol') Symbols[added_symbols][name] = value
					return true
				}
			})
		}
	})
	
})