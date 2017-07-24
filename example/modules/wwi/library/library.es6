(function(library){ return library() })
(function(){
	let library = {
		tool:[
			'proxy-value',
			'travel',
			'xy-position'
		],
		data:['list']
	}
	let items = []
	for(let module in library){
		for(let name of library[module]){
			items.push({
				module,
				name,
				url:window.url.library(`${module}/${name}.es6`),
				load(){
					return window.app.port.eval(this.url).then(result=>{
						window.fxy.exports(this.module,(module_exports)=>{
							module_exports[this.name] = result
						})
						return `${this.module}/${this.name}`
					})
				}
			})
		}
	}
	
	return window.fxy.all(items.map(item=>item.load()))
})