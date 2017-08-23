wwi.exports('tickity',(tickity,fxy)=>{
	
	const tickity_data = Symbol('tickity data')
	
	class Model{
		constructor(element){
			this.element = element
		}
		get data(){ return tickity_data in this ? this[tickity_data]:null }
		set data(value){
			if(fxy.is.data(value)) {
				this[tickity_data] = value
				this.notify(value)
			}
		}
		get is_button(){ return this.element.hasAttribute('is-button') }
		notify(data){
			if(this.ready) this.element.update(data)
			return this
		}
		get ready(){ return fxy.is.element(this.element) && fxy.is.function(this.element.update) }
		update(){
			this.data = this.value()
			return this
		}
	}
	
	//exports
	tickity.Model = Model
	
	
	
})