(function(load,window){ return load(window) })(function(window){

	//exports
	return get_loader().then(loader=>{
		return window.fxy.all(...loads())
		//shared actions
		function loads(){
			return [ 'element', 'dom', 'design' ].map(folder=>{
				return {
					get folder(){ return window.url.component(this.name) },
					get index(){ return `${this.folder}/index.es6` },
					name:folder
				}
			}).map(folder_module=>{
				return window.fxy.port.eval(folder_module.index)
				             .then(folder_items=>loader(folder_module.folder,folder_items))
				             .catch(e=>{
					             console.error('error loading folder: ',folder_module)
					             console.error(e)
					             throw e
				             })
			})
		}
	})
	
	//shared actions
	function get_loader(){ return window.fxy.port.eval(window.url.component('loader.es6')) }
},this)