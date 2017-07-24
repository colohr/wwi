wwi.exports('browser',(browser,fxy)=>{
	
	const Data = new Map()
	
	const Mix = Base => class extends fxy.uid.Mix(Base){
		get data(){ return Data.get(this.section) }
	}
	
	browser.memory = {
		get Mix(){ return Mix },
		get(...x){ return Data.get(...x) },
		set(...x){ return Data.set(...x) },
		delete(...x){ return Data.delete(...x) },
		clear(){ return Data.clear() }
	}
	
})