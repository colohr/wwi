(function(position){ return position() })
(function(){
	return function external_module(behavior){
		const timeout = Symbol('Timeout')
		const timeout_timer = Symbol('Timeout timer')
		
		//exports
		behavior.Timeout = Base => class extends Base{
			get timeout(){ return get_timeout(this) }
		}
		
		//shared actions
		function clear_timer(){
			if(has_timeout(this)) window.clearTimeout(this[timeout_timer])
			return delete this[timeout_timer]
		}
		function get_time(value){
			let time = typeof value === "number" || typeof value === 'string' ? parseInt(value):undefined
			return isNaN(time) ? undefined:time
		}
		function get_timeout(element){
			if(timeout in element) return element[timeout]
			const element_timeout = new Proxy(set_timeout(element),{
				deleteProperty(o,name){ return delete o[name] },
				get(o,name){
					switch(name){
						case 'clear':
						case 'reset':
						case 'stop':
							return clear_timer.bind(element)
							break
						case 'set':
						case 'start':
							return element_timeout
							break
					}
					if(name in o) return o[name]
					return null
				},
				has(o,name){ return name === 'timer' || name === 'timeout' ? o():name in o },
				set(o,name,value){
					let func = null
					if(typeof value === 'function') o[name] = func = value
					if(value === true && name in o) func = o[name]
					else if(value === false || value === null) delete o[name]
					return typeof func === 'function' ? element_timeout(o[name],get_time(name)):true
				}
			})
			return element[timeout] = element_timeout
		}
		function has_timeout(element){ return timeout_timer in element && typeof element[timeout_timer] === 'number' }
		function set_timeout(element){
			return function set_element_timeout(callback,time=100){
				if(typeof callback !== 'function') return has_timeout(element)
				window.requestAnimationFrame(()=>element.timeout.clear()[timeout_timer] = window.setTimeout(callback,time))
				return true
			}
		}
		
		
	}
})

