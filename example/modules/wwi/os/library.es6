(() => {
	
	wwi.library = create_library
	//shared actions
	function create_library(path) {
		let parts = path.split('/')
		let library = { get id(){ return `${this.name}-library` }, name:parts[parts.length - 1],  path}
		return get_library_data(library)
		              .then(data=>load_logic(data))
		              .then(data=>load_elements(data))
		              .then(data=>load_wait(data))
		              .then(()=>window.customElements.define(library.id,class extends HTMLElement{constructor(){super()}}))
		
	}
	
	
	
	function get_library_data(library){
		return window.fetch(`${library.path}/library`)
		             .then(response=>response.text())
		             .then(text=>get_library_module(text,library))
	}
	
	function get_library_module(text,library){
		let lines = text.split('\n')
		if (lines.length) {
			if (lines[0].trim() === 'library = {}') lines = lines.splice(1)
			let library_script = lines.join('\n')
			return eval(`(()=>function library_export(library){
							${library_script}
							
							return library;
						})()`)(library)
		}
		throw new Error(`Nothing found in ${library.path}/library file`)
	}
	
	function load_elements(library) {
		return get_files('elements' in library ? library.elements:[])
		function get_files(files){
			let count = files.length
			let loaded = 0
			return new Promise((success, error)=>{
				function get_element_items(list) {
					for(let i = loaded; i < count; i++){
						let item = get_element(list[i])
						return item.then(file=>{
							//console.log(file)
							loaded++
							return get_element_items(list)
						}).catch(error)
					}
					return success(library)
				}
				return get_element_items(files)
			})
			
			//shared actions
			function get_element(element_data) {
				element_data = get_element_data(element_data)
				return new Promise((success,error)=>{
					return window.app.port(element_data.path, {'from-library': library.name})
					             .then(()=>{
						             if(!element_data.wait) return success(element_data)
						             return wwi.when(...element_data.wait).then(()=>success(element_data))
					             })
					             .catch(e=>{
						             console.error(`Library: ${library.name}`)
						             console.error(`Error loading element at: ${element_data.path}`)
						             console.error(`Element waits on: ${element_data.wait}`)
						             return error(e)
					             })
				})
			}
			
			function get_element_data(data) {
				let output = {}
				if (fxy.is.text(data)) output.file = data
				else if(fxy.is.data(data)) output = data
				if (!('path' in output)) output.path = `${library.path}/${output.file}`
				else output.path = `${library.path}/${output.path}`
				if (!('name' in output)) output.name = get_element_name(output)
				if (!('wait' in output)) output.wait = data.wait
				return output
			}
			
			function get_element_name(data) {
				let path = data.path
				let last = window.app.source.last(path)
				let type = window.app.source.type(last)
				let filename = last.replace(`.${type}`, '')
				if (filename.includes('-')) return filename
				else if (filename === 'index.html') return false
				return `${library.name}-${filename}`
			}
		}
	}
	
	function load_logic(library) {
		return get_files('logic' in library ? library.logic:[])
		function get_files(files){
			let count = files.length
			let loaded = 0
			return new Promise((success, error)=>{
				function get_element_items(list){
					for(let i = loaded; i < count; i++){
						let item = get_logic(list[i])
						return item.then((file)=>{
							//console.log(file)
							loaded++
							return get_element_items(list)
						}).catch(error)
					}
					return success(library)
				}
				return get_element_items(files)
			})
		}
		
		function get_logic(name) {
			let file_url = `${library.path}/${name}`
			return window.app.port.eval(file_url).then(()=>file_url)
		}
	}
	
	function load_wait(library){
		return new Promise((success,error)=>{
			if('wait' in library) return window.fxy.when(...library.wait).then(_=>success(library)).catch(error)
			return success(library)
		})
	}
	
	
	
})()
