wwi.exports('data',(data_export,fxy)=>{


	
	class Item{
		constructor(name,item,data_name='form_input'){
			this.name = name
			this.data_name = data_name || 'form_input'
			this.attributes = {}
			if(!fxy.is.data(item)) item = {}
			Object.assign(this,item)
			this.data = List(fxy.is.data(this.data) ? this.data:{value:null})
			
		}
		get element(){
			return {
				[this.data_name]:Object.assign({
					name:this.name,
					type:this.type || 'text'
				},this.attributes || {})
			}
		}
	}
	
	//exports
	data_export.item = (...x)=>new Item(...x)
	
	
})