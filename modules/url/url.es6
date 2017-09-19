(function(get_url,window){ return get_url(window) })
(function(window){
	if (!('URL' in window)) window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	if (!('requestAnimationFrame' in window)) window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	if (!('cancelAnimationFrame' in window)) window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
	return function export_url(modules,base_data){
		if(typeof modules !== 'string'){
			let script = window.document.currentScript.src
			script = script.replace(window.location.origin,'')
			let paths = script.split('/').filter(item=>item.length)
			paths = paths.slice(0,paths.length-1)
			modules = paths.join('/')
		}
		let folder = `${window.location.origin}/${modules}/url`
		
		//return value
		return get_logic().catch(console.error)
		
		//shared actions
		function evaluate_file(file_url){ return window.fetch(file_url).then(response=>response.text()).then(source=>window.eval(source)) }
		function get_logic(){
			let files = ['window.es6']
			let loaded = []
			
			//return value
			return new Promise((success,error)=>evaluate_file(get_url('kit.es6')).then(get_kit=>get_kit(base_data)).then(kit=>load_next(()=>success(kit),error,kit)))
			
			//shared actions
			function load_next(done,error,kit){
				for(let file_path of files){
					if(!loaded.includes(file_path)){
						load_file(file_path,kit).then(loaded_file_path=>{
							loaded.push(loaded_file_path)
							return load_next(done,error,kit)
						}).catch(error)
						return
					}
				}
				return done()
			}
		}
		function get_url(file_path){ return file_path.includes('http') ? file_path:`${folder}/${file_path}` }
		function load_file(file_path,kit){
			return evaluate_file(get_url(file_path)).then(get_value).catch(console.error)
			//shared actions
			function get_value(value){
				if(typeof value === 'function' && value.name === 'kit') value(kit)
				return file_path
			}
		}
	}
},this)

