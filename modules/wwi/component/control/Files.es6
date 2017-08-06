(function(get_files){ return get_files() })
(function(){
    return function external_module(control,fxy){
        const data_files = Symbol('DataFiles')
	    const valid_read_as_types = [
	    	'array',
		    'base64',
		    'binary',
		    'data',
		    'json',
		    'object',
		    'text',
		    'uri',
		    'url'
	    ]
	    
	    class DataFile{
        	constructor(blob,controller){
		        this.blob = blob
		        this.dispatch = (type,detail)=>{
			        detail.file = this
			        detail.type = type
			        controller.dispatch(this.id,detail)
		        }
		        this.total = 0
		        this.loaded = 0
	        }
		    get as(){ return get_read_as(this) }
		    get changed(){ return this.blob.lastModified }
		    get changed_date(){ return this.blob.lastModifiedDate }
		    get extension(){ return window.app.source.type(this.name) }
		    get id(){ return fxy.id.dash(this.name) }
		    get name(){ return this.blob.name }
		    get path(){ return 'webkitRelativePath' in this.blob && this.blob.webkitRelativePath ? this.blob.webkitRelativePath:this.name }
	        set_state(name,event){
	        	this.state = name
		        if('total' in event) this.total = event.total
		        if('loaded' in event) this.loaded = event.loaded
		        this.progress = ((100 / this.total) * this.loaded).toFixed(0)
		        this.dispatch(name,{value:this.progress,percent:`${this.progress}%`})
		        return this
	        }
		    get size(){ return this.blob.size }
		    get title(){ return fxy.id.proper(this.name) }
	        get type(){ return this.blob.type }
	    }
	    
        class DataFiles extends Map{
        	constructor(element){
        		super()
		        this.element = element
	        }
	        dispatch(type,detail){ return this.element.dispatchEvent(new CustomEvent(type,{composed:true,detail})) }
	        get items(){ return Array.from(this.values()) }
	        read(...items){
		        for(let blob of items){
					let file = new DataFile(blob,this)
			        this.set(file.name,file)
		        }
		        return this
	        }
        }
	    
        //exports
	    control.File = File
        control.Files = DataFiles
        return Base => class extends Base{
	        get files(){ return get_files(this) }
        }
	    
	    //shared actions
	    function add_reader_actions(reader,file,error,load){
        	return add_reader_load(load,file,error,add_reader_progress(file,add_reader_errors(reader,error)))
	    }
	    
	    function add_reader_load(load,file,error,reader){
		    reader.onload = e=>{
		    	let result = e.currentTarget.result
			    file.total = e.total
			    file.loaded = e.loaded
		    	try{
				    file.value = 'data' in load ? load.data(result):result
			    }catch(load_error){
		    		file.error = load_error
		    		return error(load_error)
			    }
			    return load.success(file)
		    }
		    return reader
	    }
	    
	    function add_reader_progress(file,reader){
        	reader.onloadstart = event => file.set_state('loading',event)
		    reader.onprogress = event => file.set_state('waiting',event)
		    reader.onloadend = event => file.set_state('finished',event)
		    return reader
	    }
	    
	    function add_reader_errors(reader,error){
		    reader.onabort = e => error(e)
		    reader.onerror = e => error(e)
		    return reader
	    }
	    
	    function get_files(element){
	    	if(data_files in element) return element[data_files]
		    return element[data_files] = new DataFiles(element)
	    }
	    
	    function get_read_as(file){
		    return new Proxy(file,{
			    get(o,name){
			    	let value = null
				    switch(name){
					    case 'array':
						    value = read_as_array(o,o.blob)
						    break
					    case 'binary':
						    value = read_as_binary(o,o.blob)
						    break
					    case 'data':
					    case 'json':
					    case 'object':
						    value = read_as_json(o,o.blob)
						    break
					    case 'text':
						    value = read_as_text(o,o.blob)
						    break
					    case 'uri':
					    case 'url':
					    case 'base64':
						    value = read_as_data_url(o,o.blob)
						    break
					
				    }
				    return value
			    },
			    has(o,name){ return valid_read_as_types.includes(name) }
		    })
	    }
	    
	    function read_as_array(file,blob){
		    let reader = new FileReader()
		    return new Promise((success,error)=>add_reader_actions(reader,file,error,{success}).readAsArrayBuffer(blob))
	    }
	    
	    function read_as_binary(file,blob){
		    let reader = new FileReader()
        	return new Promise((success,error)=>add_reader_actions(reader,file,error,{success}).readAsBinaryString(blob))
	    }
	    
	    function read_as_data_url(file,blob){
		    let reader = new FileReader()
		    return new Promise((success,error)=>add_reader_actions(reader,file,error,{success}).readAsDataURL(blob))
	    }
	
	    function read_as_json(file,blob){
		    let reader = new FileReader()
		    return new Promise((success,error)=>{
			    add_reader_actions(reader,file,error,{success,data(result){
				    return JSON.parse(result)
			    }}).readAsText(blob)
		    })
	    }
	    
	    function read_as_text(file,blob){
		    let reader = new FileReader()
		    return new Promise((success,error)=>add_reader_actions(reader,file,error,{success}).readAsText(blob))
	    }
	    
    }
})