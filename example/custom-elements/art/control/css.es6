window.fxy.exports('art',(art)=>{
	const gradients = new Map()

	
	//exports
	art.css = {}
	
	//setup
	set_data()
	
	//shared actions
	function set_data(){
		get_data().then(set_list).catch(console.error)
		
		//shared actions
		function set_list(list){
			on((linear_gradient)=>{
				for(let value of list){
					gradients.set(value.name,linear_gradient(...value.colors))
				}
				art.css.gradients = gradients
			},'wwi.modules.art.css.linear_gradient')
			
		}
		function get_data(){
			return window.fetch(window.url.elements.art.data('gradients.json'))
			      .then(response=>response.json()).then(({list})=>list)
		}
	}
})