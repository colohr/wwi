(function(get_module){ return get_module() })
(function(){
    return function external_module(behavior){
        
        const Classes = Base => class extends Base {
	        addClass(value) {
		        return this.classList.toggle(value, true)
	        }
	        hasClass(value) {
		        return this.classList.contains(value)
	        }
	        removeClass(value) {
		        return this.classList.toggle(value, false)
	        }
	        toggleClass(value) {
		        return this.hasClass(value) ? this.removeClass(value) : this.addClass(value)
	        }
        }
        
        //exports
        return behavior.Classes = Classes
    }
})
