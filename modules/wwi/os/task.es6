(function(get_task){ return get_task() })
(function(){
	const threads = new Map()
	class Task extends Map{
		static module(info){
			info.module_name = `cloud-${info.name}-task`
			let Listener = window.wwi.listener(info.module_name)
			Listener(Base=>class extends Base{})
			return document.createElement(info.module_name)
		}
		constructor(info){
			super([ ['task info',info] ])
			this.module = this.constructor.module(info)
			this.worker = new Worker(info.url)
			this.worker.onmessage = (event)=>{
				let message = get_message(event)
				return this.dispatch(message.type,message)
			}
		}
		dispatch(...x){
			this.module.dispatch(...x)
			return this
		}
		off(...x){
			this.module.off(...x)
			return this
		}
		on(...x){
			this.module.on(...x)
			return this
		}
		
	}
	
    return function get_task_thread(info){
		let task = null
	    if(threads.has(info.name)) task = threads.get(info.name)
	    else task = new Task(info)
	    return task
    }
    
	//shared actions
	function get_message(event){
    	let data = event.data
		if(!fxy.is.data(data)) data = {value:data}
		return new Proxy(data,{
			get(o,name){
				if(name in o) return o[name]
				else if(name === 'type') return 'message'
				return null
			}
		})
	}
})