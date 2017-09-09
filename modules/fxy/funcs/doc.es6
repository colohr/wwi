(function(get_doc){ return get_doc() })
(function(){
	return function get_func(item){
		let symbol = Symbol.for('funcs')
		let funcs = null
		if(!window.fxy.has(symbol)) window.fxy.set(symbol,new Map())
		funcs = window.fxy.get(symbol)
		if(funcs.has('doc')) return get_doc(funcs.get('doc'),item,item.type)
		return load_func().then(func=>get_doc(func,item,item.type))
		//shared actions
		function load_func(){ return window.fxy.port.eval(window.url.modules('fxy/logic/doc.es6')).then(module=>funcs.set('doc',module).get('doc')) }
	}
	//shared actions
	function get_doc(func,doc,type){ return func[type](doc.file, ...doc.options) }
})