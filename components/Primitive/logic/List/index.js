window.fxy.exports('Primitive',(Primitive,fxy)=>{
	
	class List extends Primitive.Type{
		constructor(...x){
			super({Type:Map},...x)
			
		}
	}
	//exports
	window.List = (...x)=>Primitive.Pointer(new List(...x))
	
	
})