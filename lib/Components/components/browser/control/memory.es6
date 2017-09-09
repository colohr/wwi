window.fxy.exports('browser',(browser)=>{
	
	const Data = new Map()
	//exports
	browser.memory = {
		get(...x){ return Data.get(...x) },
		set(...x){ return Data.set(...x) },
		delete(...x){ return Data.delete(...x) },
		clear(){ return Data.clear() }
	}
	
})