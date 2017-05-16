wwi.exports('element',(element,fxy)=>{
	
	const ElementAria = fxy.require('element/aria')
	const Symbols = fxy.symbols
	const Memory = fxy.require('element/memory')
	const is = fxy.is
	
	const ElementAttributes = Base => class extends Base {
		
		get aria() { return ElementAria(this) }
		
		at(...x){
			let at = get_at_names(...x)
			let symbol = at.symbol || Symbols.true
			at.names.forEach(name=>{
				if(symbol === Symbols.true) this.setAttribute(name,'')
				else if(symbol === Symbols.false) this.removeAttribute(name)
			})
			return this
		}
		
		get attribute_data() {
			if ( !this[Symbols.AttributeData] ) this[Symbols.AttributeData] = Memory.Types.Data(this)
			return this[Symbols.AttributeData]
		}
		
		get(name, for_element) {
			let data = is.element(for_element) ? this.get_attribute_data(for_element) : this.attribute_data
			return data[name]
		}
		
		get_aria( for_element ) {
			return ElementAria( for_element )
		}
		
		get_attribute_data(for_element) {
			return Memory.Types.Data(for_element)
		}
		
		has(name, for_element) {
			let el = is.element( for_element ) ? for_element : this
			return el.hasAttribute(name)
		}
		
		set(name, value, for_element) {
			let data = is.element(for_element) ? this.get_attribute_data(for_element) : this.attribute_data
			data[name] = value
			return this
		}
		
	}
	
	
	element.attributes = ElementAttributes
	
	//----------shared actions---------
	function get_at_names(...x){
		let names = x.filter(value=>{ return is.text(value) })
		let symbol = x.filter(value=>{ return is.symbol(value) })[0]
		return {names,symbol}
	}
	
	
})