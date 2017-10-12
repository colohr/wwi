window.fxy.exports('search',(search,fxy)=>{
	
	const result_description = Symbol('result description')
	
	class ResultValue{
		constructor(name,value){
			this.name = name
			this.value = get_value(value)
		}
		
		get binder(){
			return {
				category:this.category || '',
				description:this.description,
				group:this.group || '',
				keywords:'keywords' in this ? Array.from(this.keywords):[],
				name:this.name
			}
		}
		get description(){ return get_description(this) }
		set description(value){ return this[result_description] = value }
		matches(keyword){
			switch(this.type){
				case 'ResultValue':
					return this.value.matches(keyword)
					break
				default:
					return this.text.includes(keyword)
			}
			return false
		}
		get names(){ return fxy.is.data(this.value) ? Object.keys(this.value):[] }
		get text(){ return get_text(this) }
		get type(){ return get_type(this.value) }
	}
	
	class Result extends Set{
		constructor(data){
			super(get_items(data))
		}
		matches(keyword){
			return Array.from(this).filter(item=>item.matches(keyword)).map(item=>{
				item.keywords = 'keywords' in item ? item.keywords.add(keyword):new Set([keyword])
				return item
			})
		}
		search(...keywords){
			let value = {}
			for(let keyword of keywords){
				let matches = this.matches(keyword)
				if(matches.length) value[keyword] = matches
			}
			return value
		}
	}
	
	//exports
	search.Result = Result
	
	//shared action
	function get_description(item){
		if(result_description in item) return item[result_description]
		let text = ''
		switch(item.type){
			case 'ResultValue':
				text = item.names.join(', ')
				break
			case 'object':
				text = Object.keys(item.value).join(', ')
				break
		}
		return text
	}
	
	function get_items(data){
		let items = []
		if(fxy.is.data(data)) for(let name in data) items.push(new ResultValue(name,data[name]))
		return items
	}
	
	function get_text(value,type){
		let text = ''
		switch(type){
			case 'array':
				text = value.map(item=>get_text(item,get_type(item))).join(' ')
				break
			case 'number':
				text = value+''
				break
			case 'object':
				try{ text = JSON.stringify(value).toLowerCase() }catch(e){}
				break
			case 'text':
				text = value
				break
		}
		return text
	}
	
	function get_type(value){
		if(fxy.is.instance(value,ResultValue)) return 'ResultValue'
		else if(fxy.is.array(value)) return 'array'
		else if(fxy.is.object(value)) return 'object'
		return typeof value
	}
	
	function get_value(value){
		return value
	}
	
	
})