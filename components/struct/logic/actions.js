window.fxy.exports('struct',(struct,fxy)=>{
	const Signal = fxy.require('Points/Signal')
	class Actions extends Signal{
		static get get(){ return get_action }
		static get get_name(){ return get_actions_name }
		static get set(){ return get_action }
		constructor({content,file,name}){
			//if(!fxy.is.text(content)) throw new Error('Actions content value must be a text value.')
			super(content)
			this.file = file
			this.name = get_actions_name(this.file,name)
			//this.data = get_actions_data(content)
			//this.get=(name)=>this.data[name]
			//this.has=(name)=>name in this.data
			//this.set=(name,data)=>this.data[name]=data
		}
		
	}
	
	//exports
	struct.Actions = Actions
	struct.action = get_action
	
	//shared actions
	function get_action(name,action){
		if(action) action = set_action(action)
		else if(has_action(name)) action = Actions.data.get(name)
		if(!action) return null
		return new Proxy(action,{
			get(o,name){
				let value = null
				if(name in o) value = o[name]
				else if(o.has(name)) value = o.get(name)
				if(typeof value === 'function') value = value.bind(o)
				return value
			},
			has(o,name){
				return name in o.data
			}
		})
	}
	
	function get_actions_data(content){
		const map = items().map(value=>[item_name(value),{type:item_type(value),value}])
		return new Proxy(new Map(map),{
			deleteProperty(o,name){return o.delete(name)},
			get(o,name){
				let value = null
				if(fxy.is.symbol(name) && name in o) value = o[name]
				else value = o.has(name) ? o.get(name).value:null
				if(fxy.is.function(value)) value = value.bind(o)
				return value
			},
			has(o,name){return o.has(name)},
			set(o,name,data){return set_action_data(o,name,data)}
		})
		// shared actions
		function set_action_data(o,name,data){
			if(fxy.is.text(name)){
				if(fxy.is.text(data)) data = {value:data}
				if(fxy.is.data(data)) o.set(name,data)
			}
			return true
		}
		function collapsed(){
			return content.replace(/\r/g,' ')
			              .replace(/\n/g,' ')
			              .replace(/\t/g,' ')
			              .replace(/       /g,' ')
			              .replace(/      /g,' ')
			              .replace(/     /g,' ')
			              .replace(/    /g,' ')
			              .replace(/   /g,' ')
			              .replace(/  /g,' ')
			              .replace(/ {/g,'{')
			              .replace(/query /g,'\rquery ')
			              .replace(/mutation /g,'\rmutation ')
			              .replace(/subscription /g,'\rsubscription ')
		}
		function item_name(item){
			let name = item.replace('query ','').replace('mutation ','').replace('subscription ','').trim()
			if(name.includes('(')) name = name.split('(')[0].trim()
			else name = name.split('{')[0].trim()
			return name
		}
		function item_type(item){
			if(item.indexOf('mutation') === 0) return 'mutation'
			else if(item.indexOf('subscription') === 0) return 'subscription'
			return 'query'
		}
		function items(){ return collapsed().split('\r').map(line=>line.trim()).filter(line=>line.length) }
	}
	
	function get_actions_name(file,name){ return name || fxy.file.file(file).replace('.graphql','') }
	
	function has_action(name){ return 'data' in Actions && Actions.data.has(name) }
	
	function set_action(action){
		if(!(action instanceof Actions)) action = new Actions(action)
		if(action instanceof Actions){
			if(!('data' in Actions)) Actions.data = new Map()
			return Actions.data.set(action.name,action).get(action.name)
		}
		return null
	}
})