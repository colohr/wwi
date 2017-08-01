(function(root,factory,dom_factory){ return factory(root,dom_factory) })(window, function(window,doms){
	
	let folders = [
		'element',
		'dom',
		'design'
	]
	
	return get_loader().then(loader=>{
		let loads = folders.map(folder=>{
			return {
				name:folder,
				get index(){ return `${this.folder}/index.es6` },
				get folder(){ return window.url.component(this.name) }
			}
		}).map(folder_module=>{
			return window.app.port.eval(folder_module.index).then(folder_items=>{
				//let folder_items = get_folder()
				return loader(folder_module.folder,folder_items)
			}).catch(e=>{
				console.error('error loading folder: ',folder_module)
				console.error(e)
				throw e
			})
		})
		
		return window.fxy.all(...loads)
	})
	
	//shared actions
	function get_loader(){
		return window.app.port.eval(window.url.component('loader.es6'))
	}
	
	
	let element_files = [
		'memory.es6',
		'actions.es6',
		'a11y.es6',
		'aria.es6',
		'attributes.es6',
		//'classes.es6',
		'focus.es6',
		//'data.es6',
		'define.es6',
		'design.es6',
		//'detector.es6',
		//'io.es6',
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
				return item.then(_=>{
					loaded++
					return get_element_items(list)
				}).catch(error)
			}
			return doms(get_evaluation).then(success).catch(error)
		}
		return get_element_items(element_files)
	})
	
},
function(get_evaluation){
	let loads = {
		dom:['module.es6','app.es6','page.es6','creator.es6'],
		design:['design.es6'],
		dom2:['button.es6']
	}
	
	return next_load()
	
	function next_load(){
		for(let type in loads){
			return get_logic(type === 'dom2' ? 'dom':type,...loads[type]).then(_=>{
				delete loads[type]
				return next_load()
			})
		}
		return true
	}
	
	//return Promise.all(behavaiors)
	//return Promise.all(['creator.es6', 'tag.es6'].map(name => get_evaluation('dom',name))).then(()=>get_evaluation('dom','button.es6'))
	function get_logic(type,...items){
		return Promise.all(items.map(name=>get_evaluation(type,name)))
	}
})