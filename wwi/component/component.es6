(function(root,factory,dom_factory){ return factory(root,dom_factory) })(window, function(window,doms){
	let element_files = [
		'memory.es6',
		'actions.es6',
		'a11y.es6',
		'aria.es6',
		'attributes.es6',
		'classes.es6',
		'define.es6',
		'design.es6',
		'detector.es6',
		'io.es6',
		'slots.es6',
		'template.es6',
		'tricycle.es6'
	]
	
	let count = element_files.length
	var loaded = 0
	
	function get_evaluation(path,name){
		let file_path = `${path}/${name}`
		let file_url = window.url.component(file_path)
		return new Promise((success,error)=>{
			return window.app.port.eval(file_url)
			             .then(()=>success(file_path))
			             .catch(e=>{
							console.error(file_path)
							console.error(e)
							return error(e)
						})
		})
	}
	
	return new Promise((success,error)=>{
		function get_element_items(list){
			for(let i=loaded;i<count;i++){
				let item = get_evaluation('element',list[i])
				return item.then((file)=>{
					loaded++
					//console.log(`${loaded}/${count} : ${file}`)
					return get_element_items(list)
				}).catch(error)
			}
			return doms(get_evaluation).then(success).catch(error)
		}
		return get_element_items(element_files)
	})
	
},
function(get_evaluation){
	return Promise.all(['creator.es6', 'tag.es6'].map(name => get_evaluation('dom',name))).then(()=>get_evaluation('dom','button.es6'))
})