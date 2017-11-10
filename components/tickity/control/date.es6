window.fxy.exports('tickity',(tickity,fxy)=>{
	
	const tickity_date = Symbol('tickity date')
	
	class DateValue{
		constructor(name,value){
			this.name=name
			this.value=value
		}
		get key(){ return this.name }
	}
	
	class DateData{
		constructor(data){
			for(let name in data) this[name] = new DateValue(name,data[name])
		}
		
	}
	
	class TickityDate extends tickity.Model{
		get locale(){ return 'en-us' }
		value(){
			let year, month, day
			let date = new Date()
			day = tickity.zero(date.getDate())
			month = date.toLocaleString(this.locale, {month: "short"})
			year = date.getFullYear()
			           //.substring(3, 0)
			return new DateData({month,day,year})
		}
	}
	
	//exports
	tickity.Date = Base => class extends tickity.Size(Base){
		get control(){ return this.date }
		get date(){
			if(tickity_date in this) return this[tickity_date]
			return this[tickity_date] = new TickityDate(this)
		}
		
		resize(data){
			this.style.fontSize = `${(data.height * 1)}px`
		}
		update(date) {
			for(let name in date){
				let data = date[name]
				let target = this.query(`[${name}]`)
				if(target) target.innerHTML = data.value
			}
			
		}
	}
	
})