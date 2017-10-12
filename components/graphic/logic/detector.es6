window.fxy.exports('graphic',(graphic,fxy)=>{
	
	//exports
	graphic.detector = { load }
	
	//shared actions
	function load(){
		return new Promise((success,error)=>{
			if('tracking' in graphic.detector) return success(graphic.detector.tracking)
			let tracking_url = window.url(window.components.graphic.path,'logic/scripts/tracking.js')
			return fxy.port.eval(tracking_url)
			          .then(tracking=>success(graphic.detector.tracking = tracking))
			          .catch(error)
		})
	}
})