(function(export_scroll){ return export_scroll() })
(function(){
	return function external_module(behavior){
		window.app.port.eval(window.url.component('behavior/logic/polymer-gestures.es6'))
		      .then(({Gestures,GestureListeners})=>{
		      	//console.log({PolymerGestures})
			      behavior.PolymerGestures = GestureListeners
			      fxy.exports('polymer',(polymer)=>{
				      polymer.Gestures = Gestures
			      })
		      })
		
		
	}
})