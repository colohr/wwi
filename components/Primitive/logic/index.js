window.fxy.exports('Primitive',(Primitive,fxy)=>{
	const Changes = new WeakMap()
	const Storage = new WeakMap()
	const symbol = Symbol('Primitive')
	const PrimitivePointer = primitive=>fxy.dot.pointer(...get_pointer(primitive))
	class PrimitiveType{
		static on(x){ return Changes.get(x) }
		static storage(x){ return Storage.get(x) }
		constructor({Type},value,...x){
			let is_value_type = value instanceof Type
			const data = is_value_type ? value:new Type()
			Storage.set(this,data)
			if(!is_value_type) set_value(this,value,...x)
		}
		on(notation,notification){ return on_value(this,notation,notification) }
	}
	//exports
	Primitive.Pointer = PrimitivePointer
	Primitive.symbol = symbol
	Primitive.Type = PrimitiveType
	
	//shared actions
	
	function get_notifier(primitive){
		return {
			change(name,old,value,{type}){
				if(name === symbol) return
				let data = Storage.get(primitive)
				let listeners = Changes.has(primitive) ? Changes.get(primitive):null
				if(listeners){
					let listener = listeners.get(name)
					if(fxy.is.function(listener)) return listener(name,old,value)
					if(listeners.has('*')) return listeners.get('*')(name,old,value)
				}
				if(type === 'delete') data.delete(name)
				else data.set(name,value)
			},
			has(name){ return name in fxy.dot.pointer(Storage.get(primitive)) },
			value(name){ return fxy.dot.pointer(Storage.get(primitive))[name] },
			
		}
	}
	function get_pointer(primitive){ return [primitive, get_notifier(primitive)] }
	function on_value(primitive,notation,notification){
		if(!Changes.has(primitive)) Changes.set(primitive,new Map())
		let on = Changes.get(primitive)
		on.set(notation,notification)
		return PrimitivePointer(primitive)
	}
	function set_value(primitive,input,...x){
		let value = fxy.dot.merge(input,...x)
		let data = Storage.get(primitive)
		let is = fxy.is.map(data) ? 'data':'array'
		if(fxy.is[is](value)){
			if(is === 'array') for(let item of value) data.add(item)
			else for(let name in value) data.set(name,value[name])
		}
	}
	
})