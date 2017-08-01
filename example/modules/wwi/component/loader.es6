(function(get_loader){ return get_loader() })
(function(){
 
	return load_folder
	//shared actions
	function load_folder(folder_url,folder_items){
		//console.log('load: ',folder_url,folder_items)
		let mixins = 'mixins' in folder_items ? folder_items.mixins:[]
		return load_files(...mixins).then(mixins_results=>{
			//console.log('mixins loaded: ',mixins_results.length)
			let main = 'main' in folder_items ? [folder_items.main]:[]
			return load_files(...main)
		}).then(_=>{
			//console.log('main loaded')
			let elements = 'elements' in folder_items ? folder_items.elements:[]
			return load_files(...elements)
		}).then(elements_results=>{
			//console.log('elements loaded: ',elements_results.length)
			return {folder:folder_url,module:folder_items}
		}).catch(e=>{
			console.error(e)
			throw e
		})
		//shared actions
		function load_files(...items){
			let files = get_files(...items)
			return window.fxy.all(...files)
		}
		
		function get_files(...items){
			return items.map(item=>`${folder_url}/${item}`).map(item=>{
				return window.app.port.eval(item).then(result=>{
					return result
				}).catch(e=>{
					console.log('error loading folder item: ',folder_url)
					console.error(e)
					throw e
				})
			})
		}
	}
	
	
	
})