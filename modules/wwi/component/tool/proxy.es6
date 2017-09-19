window.fxy.exports('tool',(tool)=>{
	//exports
	tool.proxy = {value:get_proxy_value}
	//shared actions
	function get_proxy_value(name,...targets_bind){
		let value=null
		let targets = targets_bind.filter(target=>typeof target === 'object' && target !== null)
		let binds = targets_bind.filter(target=>typeof target === 'boolean')[0]
		for(let target of targets){
			if(name in target){
				value = target[name]
				if(typeof value === 'function' && binds !== false) value = value.bind(target)
			}
		}
		return value
	}
})