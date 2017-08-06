(function(get_drop){ return get_drop() })
(function(){
    return function external_module(behavior,fxy){
        const drop_controller = Symbol('drop controller')
	    //const file_reader = Symbol('file reader')
	    //class DropFiles extends Map{
		 //   constructor(controller){
			//    super()
			//    this.controller = controller
		 //   }
		 //   read_data(e){
		 //   	console.log(e)
			//	return this.reader.readAsDataURL(e)
		 //   }
		 //   read_text(e){
			//    return this.reader.readAsText(e)
		 //   }
		 //   load(e){
			//	return this.controller.element.dispatch('file',e)
		 //   }
	    //}
	
	    class DropController extends Map{
        	constructor(element){
        		super()
        		
		        this.element = element
		        
		        element.addEventListener("dragenter", dragenter, false)
		        element.addEventListener("dragover", dragover, false)
		        element.addEventListener("drop", drop.bind(this), false)
		        
		        function dragenter(e) {
			        e.stopPropagation()
			        e.preventDefault()
		        }
		
		        function dragover(e) {
			        e.stopPropagation()
			        e.preventDefault()
		        }
		
		        function drop(e) {
			        e.stopPropagation()
			        e.preventDefault()
			        element.dispatch('dropped',e.dataTransfer)
		        }
		        
		        
	        }
	        get accept(){ return this.attribute('accept') }
	        append(element){
	        	this.element.shadow.appendChild(element)
		        return this
	        }
	        attribute(name,value){ return attribute_value(this.element,name,value) }
		    change(e){
				
		    }
	        get multiple(){ return this.attribute('multiple') }
	        
		    off(...x){
	        	this.element.off(...x)
			    return this
	        }
		    on(...x){
		    	this.element.on(...x)
		    	return this
		    }
	    }
	    
        //exports
        return Base => class extends Base{
	        get drop(){ return get_drop(this) }
        }
        
	    //shared actions
	    function get_drop(element){
        	if(drop_controller in element) return element[drop_controller]
		    return element[drop_controller] = new DropController(element)
	    }
	    
	    function get_drop_input(controller){
	    	if('input' in controller) return controller.input
		    
		    let input = document.createElement('input')
		    input.setAttribute('type','file')
		    input.setAttribute('drop-input','')
		    input.addEventListener("change", controller.change.bind(controller), false)
		    
		    if(controller.multiple) input.setAttribute('multiple','')
		    if(controller.accept) input.setAttribute('accept',controller.accept)
		    
		    return controller.input = input
	    }
	    
	    function attribute_value(element,name,value){
	    	if(!fxy.is.text(name)) return null
		    if(value === null || value === false) element.removeAttribute(name)
		    else if(value === true) element.setAttribute('value','')
		    else if(fxy.is.data(value)) element[name] = value
		    else if(!fxy.is.nothing(value)) element.setAttribute(value)
		    if(element.hasAttribute(name)){
			    value = element.getAttribute(name)
			    if(value === '') return true
			    else return value
		    }
		    return null
	    }
	
	    //function get_files(controller,input){
		 //   if(input instanceof Event) input = input.currentTarget
		 //   let items = 'files' in input ? input.files:[]
		 //   console.log(input)
		 //   let count = items.length
		 //   let files = new DropFiles(controller)
		 //
		 //   for (let i = 0; i < count; i++) {
			//    let file = items[i]
			//    files.set(file.name,file)
			//    let reader = new FileReader()
			//    reader.onload = e => files.load(e)
			//    reader.readAsDataURL(file)
		 //   }
		 //   return files
	    //}
	    
	   
    }
})