window.fxy.exports('Primitive',(Primitive,fxy)=>{
	
	class Data extends Primitive.Type{
		constructor(...x){
			super({Type:Map},...x)
		}
	}
	const WindowData = (...x)=>{
		const primitive = new Data(...x)
		const pointer = Primitive.Pointer(primitive)
		pointer[Primitive.symbol] = primitive
		return pointer
	}
	WindowData.on = x=>Primitive.Type.on(x[Primitive.symbol])
	WindowData.storage = x=>Primitive.Type.storage(x[Primitive.symbol])
		//exports
	Primitive.Data = Data
	window.Data = WindowData
	

	
	
	
})