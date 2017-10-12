wwi.exports('tickity',(tickity,fxy)=>{
	const PHI = 1.61803398875
	
	
	//exports
	tickity.ratio = golden_ratio
	tickity.zero = add_zero
	tickity.Size = Base => class extends Base{
		constructor(){
			super('routes',{
				frame(value){
					if(value) this.size_changed(get_size(value))
				}
			})
		}
		size_changed(size){
			this.height = size.height.unit ? `${size.height.value}${size.height.unit}`:size.height.value+'px'
			this.width = size.width.unit ? `${size.width.value}${size.width.unit}`:size.width.value+'px'
			this.resize({
				height:size.height.value,
				width:size.width.value
			})
		}
	}
	
	
	
	
	
	
	
	
	function add_zero(num) {
		return (num >= 0 && num < 10) ? "0" + num : num + ""
	}
	
	function get_size(value){
		let parts = value.split(',')
		if(parts.length < 2) parts.push(parts[0])
		parts = parts.map(part=>fxy.numeral(part))
		return {
			height:parts[1],
			width:parts[0]
		}
	}
	function get_golden_ratio(value){
		
		return {
			origin:fxy.numeral(value).value,
			get section(){ return golden_value(this.origin) - this.origin; },
			get a(){ return this.section; },
			get b(){ return this.origin - this.section; },
			//get ab(){ return getSum(this.a,this.b); }
		}
		
		//shared actions
		function golden_value(value){  return fxy.numeral(value).value * PHI  }
	}
	
	
	function golden_ratio(value){
		return {
			origin:value,
			get ratio(){ return get_golden_ratio(value) },
			value(degrees){
				let g = this.ratio
				let v = g.b
				for(let i=0;i<degrees;i++){
					g = get_golden_ratio(g.a)
					v = g.b
				}
				return v
			}
		}
	}
	
	
	
})