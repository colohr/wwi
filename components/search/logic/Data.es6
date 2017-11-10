window.fxy.exports('search',(search,fxy)=>{
	
	class Category{
		constructor(name,section){
			this.name=name
			this.section = section
			this.items = []
		}
		add(data){
			this.items.push(new Item(data,this))
			return this
		}
	}
	
	class Item{
		constructor(data,category){
			this.category = category
			this.data = data
		}
		tag(...keywords){
			let result = Object.assign({},{
				category:this.category.name
			},this.data)
			let tagged = false
			for(let name in this.data){
				let value = this.data[name]
				if(fxy.is.text(value)){
					for(let word of keywords){
						if(value.includes(word)){
							let keyword = new RegExp(word,'g')
							value  = value.replace(keyword,`{{${word}}}`)
							tagged=true
						}
					}
					result[name] = value.replace(/{{/g,'<span highlight>').replace(/}}/g,'</span>')
				}
			}
			this.tagged=tagged
			this.result = result
			return this
		}
	}
	
	class Section extends Map{
		constructor(name){
			super()
			this.name = name
		}
		categories(...names){
			this.clear()
			for(let name of names){
				this.set(name,new Category(name,this))
			}
			return this
		}
	}
	
	class SearchData extends Map{
		get categories(){ return get_categories(this) }
		constructor(){ super() }
		filter(...x){ return this.items.filter(...x) }
		get items(){ return get_items(this) }
		sections(...names){
			this.clear()
			for(let name of names){
				this.set(name,new Section(name))
			}
			return this
		}
		
	}
	
	//exports
	search.Data = SearchData
	
	//shared actions
	function get_categories(data){
		let categories = []
		for(let section of data.values()){
			categories = categories.concat(Array.from(section.values()))
		}
		return categories
	}
	
	function get_items(data){
		let categories = data.categories
		let items = []
		for(let category of categories){
			items = items.concat(category.items)
		}
		return items
	}
	
})