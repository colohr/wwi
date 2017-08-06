(function(get_fxy){ return get_fxy() })
(function(){
	
    return function export_fxy(modules){
        let folder = `${window.location.origin}/${modules}/fxy`
        
	    //return value
        return get_logic().then(_=>window.fxy).catch(console.error)
        //shared actions
        function get_logic(){
	        let files = [
		        `logic/lodash.js`,
		        'class.es6',
		        'symbols.es6',
		        'browser.es6',
		        'uid.es6',
		        'file.es6',
		        'port.es6',
		        'broadcast.es6'
	        ]
	        let loaded = []
	        
            //return value
            return new Promise((success,error)=>load_next(()=>success(),error))
	        
	        //shared actions
	        function load_next(done,error){
	            for(let file_path of files){
	                if(!loaded.includes(file_path)){
	                	//console.log({file_path})
	                    load_file(file_path).then(loaded_file_path=>{
	                        loaded.push(loaded_file_path)
                            return load_next(done,error)
                        }).catch(error)
		                return
                    }
                }
                return done()
            }
        }
	
	    function get_url(file_path){
		    if(file_path.includes('http')) return file_path
		    return `${folder}/${file_path}`
	    }
        
        function load_file(file_path){
	        return window.fetch(get_url(file_path))
	                     .then(response=>response.text())
	                     .then(lodash=>window.eval(lodash))
                         .then(_=>file_path)
        }
    }
})