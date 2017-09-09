(function(get_transition){ return get_transition() })
(function(){
	return function export_transition(behavior,fxy){

		
		const TransitionExample = Base => class extends Base{
			transition_example(){ return this.transition.example() }
		}
		
		//export
		return load()
		
		//shared actions
		function load(){
			if(fxy.is.nothing(fxy.require('transitions-behavior/example'))){
				if(TransitionExample.loading) return null
				TransitionExample.loading = true
				fxy.port.eval(window.url.component('behavior/logic/transitions/example.js'))
				   .then(example=>{
					   fxy.exports('transitions-behavior',(transitions_behavior)=>{
						   transitions_behavior.example = example
						   behavior.TransitionExample = TransitionExample
						   delete TransitionExample.loading
					   })
				   }).catch(console.error)
			}
			else behavior.TransitionExample = TransitionExample
			return null
		}
	}
})