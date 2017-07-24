wwi.exports('kpi',(kpi)=>{
	
	//exports
	kpi.list = set_banks_list
	kpi.results.banks = get_banks_result
	
	//shared actions
	function set_banks_list(container){
		let list = 'list' in container ? container.list:null
		if(list){
			list.on('select',(e)=>{
				if(list.selected_item) list.selected_item.selected=false
				let selection = e.detail
				if(!selection.selected) selection.selected=true
				list.selected_item = selection
				if('select' in container) container.select(selection.data.data)
			})
		}
		return container
	}
	
	function get_banks_result(result,control){
		const container = control.container
		const navigator = control.navigator(container)
		
		return set_data(container.list,result).then(_=>result)
		
		//shared actions
		function set_data(list,data){
			
			return new Promise((success)=>{
				for(let item of data){
					let bank = list.add_section(item)
					set_sections(bank)
				}
				return success()
			})
		}
		function set_sections(list){
			let data = list.data.sections
			//delete list.data.sections
			//return
			for(let item of data){
				let section = list.add_section(item)
				set_targets(section)
			}
		}
		function set_targets(list){
			let data = list.data.targets
			//delete list.data.targets
			for(let item of data){
				let target = list.add_section(item)
				set_items(target)
			}
		}
		function set_items(list){
			let data = list.data.items
			//delete list.data.items
			for(let item_data of data){
				let item =  get_item(item_data)
				item.title = item.ditl
				list.add_item(item)
			}
			function get_item(item_data){
				let item = {}
				for(let name in item_data) item[name] = item_data[name]
				item[navigator.id] = `${item.bank.name}-${item.ditl}`
				navigator.set(item[navigator.id],item)
				return item
			}
		}
	}
})

