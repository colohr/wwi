window.fxy.exports('art',(art,fxy)=>{
	
	
	//exports
	art.detector = {
		load
		
	}
	
	//shared actions
	function load(){
		return new Promise((success,error)=>{
			if('tracking' in art.detector) return success(art.detector.tracking)
			let tracking_url = url(components.art.path,'control/scripts/tracking.js')
			return fxy.port.eval(tracking_url).then(tracking=>{
				return success(art.detector.tracking = tracking)
			}).catch(error)
		})
	}
})