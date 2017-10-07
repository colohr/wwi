(function(get_wwi,window){ return get_wwi(window) })
(function(window){
	
	const world_wide_actions = Symbol('world wide actions')
	
	class WorldWideAction{
		constructor(value){
			let dots = null
			if(fxy.is.text(value)) dots = fxy.dot(value)
			if(fxy.is.data(dots)){
				let parts = dots.parts
				parts[0] = fxy.id.dash(parts[0])
				this.dots = fxy.dot(parts.join('.'))
			}
		}
		get action(){ return get_broadcast_action(this) }
		error(e){ console.error('Invalid WorldWideAction',e) }
		get valid(){ return 'dots' in this }
	}
	
	class WorldWideInternet{
		static get actions(){
			if(world_wide_actions in this) return this[world_wide_actions]
			return this[world_wide_actions] = new Map()
		}
		constructor(){}
		get define(){ return fxy.define }
		get exports(){ return fxy.exports.bind(fxy) }
		get external(){ return fxy.external }
		get library(){ return fxy.library }
		get off(){ return off_broadcast_action }
		get on(){ return on_broadcast_action }
		get require(){ return fxy.require.bind(fxy) }
		get symbols(){return fxy.symbols }
		get when(){ return fxy.when }
		get modules(){ return fxy.modules }
		tool(name){
			return new Promise((success,error)=>{
				let tool = `tool/${name}`
				if(window.fxy.is.module(tool)) return success(window.fxy.require(tool))
				else window.fxy.port(window.url.component(tool+'.es6'),{async:'',defer:''}).then(_=>success(window.fxy.require(tool))).catch(e=>{
					console.error(e)
				})
			})
		}
	}
	
	class WorldWideListener extends Map{ constructor(element){ super(); this.dispatch = (name)=>{ return function dispatch_action(event){ return element.dispatch(name,event) } } } }
	
	//exports
	return window.wwi = new WorldWideInternet()
	
	//shared actions
	function get_broadcast_action(action) {
		if(!(action instanceof WorldWideAction)) action = new WorldWideAction(action)
		if (action.valid && world_wide_actions in WorldWideInternet) {
			let dots = action.dots
			let actions = WorldWideInternet.actions.get(dots.container)
			if(actions) {
				let target = dots.target
				if(actions.has(target)) return actions.get(target)
				else return actions.dispatch(action.target)
			}
		}
		return action.error.bind(action)
	}
	
	function off_broadcast_action(element){
		
		if(fxy.is.element(element) !== true) return update_broadcast_actions()
		if(world_wide_actions in WorldWideInternet) WorldWideInternet.actions.delete(fxy.id.dash(fxy.selector(element)))
		return update_broadcast_actions()
	}
	
	function on_broadcast_action(element){
		if(!fxy.is.element(element)) throw new Error(`World Wide Internet on action needs a valid HTMLElement`)
		let id = element.getAttribute('broadcast-id')
		if(!id){
			id = fxy.uid()
			element.setAttribute('broadcast-id',id)
		}
		return new Proxy({
			element, id,
			get listeners(){ return this.element.has_listener ? this.element.listeners:null },
			get empty(){ return has_on(this) === false && this.element.has_listener === false }
		},{
			deleteProperty(o,name){
				let actions = get_on_actions(o)
				if(actions){
					actions.delete(name)
					if(actions.size === 0) off_broadcast_action(o.element)
				}
				return true
			},
			get(o,name){
				if(name === 'act') return (x)=>{ return new WorldWideAction(x) }
				let actions = get_on_actions(o)
				if(actions && actions.has(name)) return actions.get(name)
				return null
			},
			has(o,name){
				let actions = get_on_actions(o)
				if(actions && actions.has(name)) return true
				return false
			},
			set(o,name,value){
				if(fxy.is.text(name) && fxy.is.function(value)) {
					getset_on(o).set(name,value)
					let actions = get_on_actions(o)
					if(actions){
						let listeners = actions.listeners
						if(!listeners || !listeners.has(name)){
							o.element.on(name,value)
						}
					}
				}
				return true
			}
		})
		
		//shared actions
		function get_on_actions(data){
			if(data.empty) return null
			return {
				data,
				get listeners(){ return this.data.listeners },
				get(name){
					if(has_on(this.data)){
						let ons = getset_on(this.data)
						if(ons.has(name)) return ons.get(name)
					}
					return null
				},
				delete(name){
					if(has_on(this.data)) getset_on(this.data).delete(name)
					let listeners = this.listeners
					if(listeners && listeners.has(name)) this.data.element.off(name)
					return true
				},
				get size(){
					return has_on(this.data) ? getset_on(this.data).size:0
				},
				has(name){
					if(has_on(this.data)) {
						let ons = getset_on(this.data)
						if(ons.has(name)) return true
					}
					let listeners = this.listeners
					if(listeners && listeners.has(name)) return true
					return false
				}
			}
			
		}
		function getset_on(o){
			if(has_on(o)) return WorldWideInternet.actions.get(o.id)
			return WorldWideInternet.actions.set(o.id,new WorldWideListener(o.element)).get(o.id)
		}
		function has_on(o){ return world_wide_actions in WorldWideInternet && WorldWideInternet.actions.has(o.id) }
	}
	
	function update_broadcast_actions(){ return world_wide_actions in WorldWideInternet && WorldWideInternet.actions.size === 0 ? delete WorldWideInternet[world_wide_actions]:true }
	
},this)



