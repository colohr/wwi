window.fxy.exports('struct',(struct)=>{
	//exports
	struct.client = get_client
	struct.client.api = get_api
	struct.client.actions = get_actions
	
	//shared actions
	function get_actions(struct){
		let get_actions = fxy.require('struct/action')
		let actions = get_actions(struct.name)
		if(actions) return actions
		if('actions' in struct) return get_actions(struct.actions.name,struct.actions)
		return null
	}
	
	function get_api(struct,options){
		options = options || fxy.require('struct/shared-options')
		const StructInterface = fxy.require('struct/Interface')
		const api = new StructInterface(struct.endpoint,options)
		api.actions = get_actions(struct)
		return get_client(api)
	}
	
	function get_client(struct){
		return new Proxy({
			actions:struct.actions,
			client:struct.client
		},{
			get(o,name){
				if(o.actions && name in o.actions) {
					let action = o.actions[name]
					return (input)=>o.client.request(action,input).then(response=>{
						if(name in response) return response[name]
						let first = Object.keys(response)[0]
						return response[first]
					})
				}
				else if(name in o.client) return o.client[name]
				return null
			}
		})
	}
})