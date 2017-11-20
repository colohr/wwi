(function(export_worker){ return export_worker() })
(function(){
	class Work extends Map{
		constructor(worker,options){
			super()
			const work = this
			worker.onmessage = on_message
			worker.onerror = on_error
			
			this.send = send
			this.on = action=>{
				let work_id = fxy.uid()
				work.set(work_id,action)
				return {
					work:work_id,
					of(data){
						worker.postMessage(make_data(work_id,data))
						return work
					}
				}
			}
			
			//shared actions
			function on_error(event){
				if(work.error) work.error(event)
				else console.error(event)
			}
			function on_message(event){
				let data = read_data(event)
				let action = work.get(data.work)
				if(typeof action !== 'function') return console.log('action not a function')
				else if(data.worked) work.delete(data.work)
				action(data)
			}
			function send(x){
				return new Promise(success=>{
					let id = fxy.uid()
					let data = make_data(id,x)
					work.set(id,result=>{
						work.delete(id)
						return success(result)
					})
					worker.postMessage(data)
				})
			}
		}
		
	}
	
	//exports
	return function export_worker(file,...options){
		return Promise.resolve(new Work(new Worker(file),...options))
	}
	
	//shared actions
	function make_data(work,data){ return JSON.stringify({work,...data}) }
	function read_data(event){ return JSON.parse(event.data) }
	
})