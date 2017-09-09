(function(get_transition){ return get_transition() })
(function(){
    return function export_transition(behavior,fxy){
	    const symbol = Symbol('transitions')
    	const logic = {
    		get Transitions(){ return fxy.require('transitions-behavior/Transitions') }
	    }
    	
        const Transition = Base => class extends Base{
            get transition(){ return get_transition(this) }
        }
        
        //export
        return load()
	    //shared actions
	    function get_pages(element){
	    	let pages_selector = element.hasAttribute('pages-selector') ? element.getAttribute('pages-selector'):'[transition-container] > *'
	    	let pages_container = fxy.is.nothing(element.shadowRoot) ? element:element.shadowRoot
		    return Array.from(pages_container.querySelectorAll(pages_selector))
	    }
	    
	    function get_transition(element){
    		if(symbol in element) return element[symbol]
		    return styles(element)[symbol] = new logic.Transitions(element,...get_pages(element))
	    }
	    
	    function load(){
        	if(fxy.is.nothing(logic.Transitions)){
        		if(logic.loading) return null
		        logic.loading = true
        		let files = [window.url.component('behavior/logic/transitions/list.json'),window.url.component('behavior/logic/transitions/animations.js'),window.url.component('behavior/logic/transitions/index.js')]
		        fxy.load(...files).then(results=>{
	                fxy.exports('transitions-behavior',(transitions_behavior)=>{
		                transitions_behavior.animations = results[1](results[0])
		                transitions_behavior.Transitions = results[2]
		                behavior.Transition = Transition
		                delete logic.loading
	                })
	              })
                  .catch(console.error)
	        }
	        else behavior.Transition = Transition
	        return null
	    }
	    
	    function styles(element){
	    	let transitions = element.query('style#transitions')
		    if(transitions === null){
	    		let first = element.query('*')
			    transitions = document.createElement('style')
			    transitions.innerHTML = `
			        @import "${window.url.component('behavior/design','transition-animations.css')}";
			        @import "${window.url.component('behavior/design','transitions.css')}";
			    `
			    transitions.setAttribute('id','transitions')
			    element.shadow.insertBefore(transitions,first)
		    }
		    return element
	    }
    }
})