(function(get_window,window){ return get_window(window) })
(function(window){
    return function kit(kit){
	
	    const window_folders = {
		    get bower(){ return this.kit.has('bowser') ? this.kit.get('bower'):'bower_components' },
		    get edus(){ return this.kit.has('edus') ? this.kit.get('edus'):'edus' },
		    get elements(){return this.kit.has('elements') ? this.kit.get('elements'):'custom-elements'},
		    get fxy(){return `${this.modules}/fxy`},
		    kit,
		    get logic(){return this.kit.has('logic') ? this.kit.get('logic'):'logic'},
		    get modules(){return this.kit.has('modules') ? this.kit.get('modules'):'modules'},
		    get site(){return this.kit.has('site') ? this.kit.get('site'):'/'},
		    get wwi(){return `${this.modules}/wwi`}
	    }
	
	    //exports
	    return window.url = get_window_url()
	
	    //shared actions
	    function get_url(folder, path, no_kit_path){
		    let folder_paths = no_kit_path === true ? []:[window_folders.kit.path]
		    folder_paths.push(folder)
		    //add the path to the folder paths if it exists
		    if(path) folder_paths.push(path)
		    return get_url_generator(...folder_paths)
	    }
	
	    function get_url_proxy(folders){
	    	let url_getter = get_url_generator(folders.site,null,true)
		    
		    return new Proxy(url_getter,{
			    deleteProperty(o,name){
				    if('customs' in folders && typeof name === 'string') return delete folders.customs[name]
				    return true
			    },
			    get(o,name){
				    if(name in folders) return get_url(folders[name])
				    else if('customs' in folders && name in folders.customs) return get_url(folders.customs[name])
				    else if('wwi' in folders) return get_url(folders.wwi, name)
				    //default that is the kit.path/modules/wwi
				    return get_url(name,null,true)
			    },
			    has(o,name){ return name in folders || ('customs' in folders && name in folders.customs) },
			    set(o,name,value){
				    if(typeof name === 'string' && typeof value === 'string'){
					    if(!('customs' in folders)) folders.customs = {}
					    folders.customs[name] = value
				    }
				    return true
			    }
		    })
	    }
	
	    function get_url_generator(...main_paths){
		    return new Proxy(function url_from_kit_path(...x){
			    if(x.length){
				    let last = x[x.length - 1]
				    if(last[last.length-1] === '.'){
					    x[x.length - 1] = last.replace('.','')
					    x.push(`${x[x.length - 1]}.es6`)
				    }
			    }
			    //paths for the source url
			    let paths = [].concat(main_paths).concat(x)
			    //if('fxy' in window) window.fxy.file.url(...paths)
			    paths.unshift(window.location.origin)
			    return paths.filter(item=>typeof item === 'string' && item.length &&  item !== '/').join('/')
		    },{
			    get(o,name){
				    if(typeof name === 'string'){
					    let new_paths = [].concat(main_paths)
					    new_paths.push(name)
					    return get_url_generator(...new_paths)
				    }
				    if(name in o) return o[name]
				    return null
			    }
		    })
	    }
	
	    function get_window_url(){
		    return get_url_proxy(window_folders)
	    }
	
    }
},this)