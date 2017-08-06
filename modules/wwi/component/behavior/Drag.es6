(function(create_drag){ return create_drag() })
(function(){
	return function external_module(behavior,fxy){
		const draggable_frame = Symbol('is draggable frame')
		
		window.app.port.eval(window.url.component('behavior/logic/displace.es6')).then(Displace=>{
			
			behavior.Drag  = Base => class extends Base{
	            constructor(){
	            	super('routes',{
		                contain(value){
		                	if(!this.isConnected) return
		                	let options = {}
			                if(value === null)  options = false
			                else if(fxy.is.element(value)) options = {view: value}
			                else if(fxy.is.data(value)) options = value
			                set_drag(this,options)
		                },
			            drag(value){
		                	if(this.isConnected){
		                		value = value === null ? false:value
				                if(fxy.is.text(value)){
					                if(value.length) value = document.querySelector(value)
					                if(value === null) value = document.querySelector('#app')
				                }
				                this.contain = {handle:this.drag_handle}
			                }
			            }
	            	})
	            }
	            get drags(){ return draggable_frame in this }
	            get drag_handle(){ return this.query('[drag-handle]') }
            }
  
            
			//shared actions
			function create_draggable(...x){ return new Displace(...x) }
			function set_drag(frame,value){
				if(value && !(draggable_frame in frame)) {
					frame[draggable_frame] = create_draggable(...get_drag_options(frame,value))
					if('center' in frame) frame.center()
				}
				else if(draggable_frame in frame){
					frame[draggable_frame].destroy()
					delete frame[draggable_frame]
				}
				return frame[draggable_frame] || null
			}
		})
		
		
		function get_drag_options(frame,value){
			let options = [frame,{constrain:true,handle:frame.drag_handle}]
			if(fxy.is.data(value)){
				if('view' in value) options[1].relativeTo = value.view
				else options[1] = value
			}
			return options
		}
	}
	
})

//changed(name,old,value){
//   switch(name){
//       case 'contain':
//           if(value === null) this.drag = false
//           else if(fxy.is.element(value)) this.drag ={view: value}
//           break
//   }
//}

//get drag(){ return this[draggable_frame] || null }
//set drag(value){ return set_drag(this,value) }