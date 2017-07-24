(function(sort){ return sort() })
(function(){
    return function get_sort(){
     
    	const sorted = Symbol.for('sorted element')
    	
    	
        const Sorted = element=>{
        	return new Proxy(element,{
        		get(o,name){
        			switch(name){
				        
				        case 'disabled':
					        return !o.hasAttribute('draggable') || o.hasAttribute('disabled')
					        break
				        case 'elements':
				        	return Array.from(o.parentElement.children).filter(e=>e.hasAttribute('draggable'))
					        break
				        case 'enabled':
				        case 'draggable':
				        	return o.hasAttribute('draggable')
				        	break
				        case 'control':
				        	let parent = o.parentElement
					        if(parent && 'sort' in parent) return parent.sort
				        	break
				        
			        }
			        return null
		        },
		        has(o,name){ return name in o },
		        set(o,name,value){
		        	let remove
		        	if(fxy.is.nothing(value)) remove = true
			        switch(name){
				
				        case 'disabled':
				        	if(!remove || value === true) o.removeAttribute('draggable')
					        else o.setAttribute('draggable','')
					        break
				        case 'enabled':
				        case 'draggable':
					        if(remove || value === false) o.removeAttribute('draggable')
					        else o.setAttribute('draggable','')
					        break
				
			        }
			        return true
		        }
	        })
        }
        
        const Sortable = Base => class extends Base{
            get sort(){ return Sorted(this) }
            sorted(){
            	if(sorted in this) return this
	            this.addEventListener('dragenter', drag_enter, false)
	            this.addEventListener('dragend', drag_end, false)
	            this.addEventListener('dragleave', drag_leave, false)
	            this.addEventListener('dragover', drag_over, false)
	            this.addEventListener('dragstart', drag_start, false)
	            this.addEventListener('drop', drop, false)
	            return this[sorted] = true
            }
        }
	
	    class Sort{
		    static get Mix(){ return Sortable }
		    
		    constructor(view,sorted_view){
		    	if(fxy.is.nothing(sorted_view)) sorted_view = view
		    	view.define({
				    'current-sort':true
			    })
			    view.setAttribute('sort-view','')
			    sorted_view.sort_view = view
			    this.view = view
			    if(!('sort' in sorted_view)) sorted_view.sort = this
			    this.sorted_view = sorted_view
			    this.current = null
		    }
		    get active(){ return this.view.aria.activedescendant }
		    set active(value){ return this.view.aria.activedescendant }
		    get draggables(){ return this.view.query('[draggable="true"]') }
		    get current(){ return this.active_element || null }
		    set current(element){
		    	var last = this.active
			    var active = null
			    if(!fxy.is.nothing(element)) active = element instanceof HTMLElement ? element.id : null
			    this.active = active
			    this.active_element = element
			    return active
		    }
		    get sorted(){ return this.draggables }
		    update(){
			    if('on_sort' in this.view) this.view.on_sort()
			    return this
		    }
	    }
        
        
        
        return Sort
	
	    
	
	   
	    
	   
	    
	
	    function drag_end(e) {
		    // this/e.target is the source node.
			let elements = this.sort.elements
		    if(elements){
				elements.forEach((e,i)=>{
					e.dataset.position = i
					e.id = fxy.id.dash(e.textContent.trim())+'-tab'
					
					e.removeAttribute('over')
				})
			    this.sort.control.update()
		    }
	    }
	    
	    function drag_enter(e) {
		    // this / e.target is the current hover target.
		    this.setAttribute('over','')
	    }
	    
	    function drag_leave(e) {
		    this.removeAttribute('over') // this / e.target is previous target element.
	    }
	
	    function drag_over(e) {
		    if (e.preventDefault) {
			    e.preventDefault() // Necessary. Allows us to drop.
		    }
		    this.removeAttribute('dragging')
		    e.dataTransfer.dropEffect = 'move'  // See the section on the DataTransfer object.
		
		    return false
	    }
	    
	    function drag_start(e) {
		    this.setAttribute('dragging','')
		    // Target (this) element is the source node.
		    this.sort.control.current = this
		    e.dataTransfer.effectAllowed = 'move'
		    e.dataTransfer.setData('text/html', this.innerHTML)
	    }
	
	    function drop(e) {
		    // this/e.target is current target element.
		    if (e.stopPropagation) e.stopPropagation() // Stops some browsers from redirecting.
		    let current = this.sort.control.current || null
		    // Don't do anything if dropping the same column we're dragging.
		    if (current && current != this) {
			    // Set the source column's HTML to the HTML of the column we dropped on.
			
			    let current_controls = current.aria.controls
			    let controls = this.aria.controls
			    
			    current.innerHTML = this.innerHTML
			    this.innerHTML = e.dataTransfer.getData('text/html')
			    
			    
			    if(current_controls) this.aria.controls = current_controls
			    if(controls) current.aria.controls = controls
			    
			    if(current.aria.selected === 'true') this.was_selected = true
			    else delete this.was_selected
			    
			    if(this.aria.selected) current.was_selected = true
			    else delete current.was_selected
			    
			    
		    }
		    return false
	    }
	
	    
    }
})