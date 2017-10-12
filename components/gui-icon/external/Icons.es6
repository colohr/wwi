(function(get_icons){ return get_icons() })
(function(){
	return function export_icons(gui,fxy){
		
		const Icons = Base => class extends Base{
			get svgs(){ return fxy.require('icons/svgs') }
			get get_icon(){ return get_icon }
		}
		
		//exports
		return load()
		//shared actions
		function get_icon(name){
			let svgs = icons.svgs
			if(name in svgs){
				let svg = svgs[name]
				console.log(svg)
				if(!('element' in svg)){
					svg.element = document.createElement('div')
					svg.element.innerHTML = svg.content
					svg.icon = svg.element.querySelector('svg')
				}
				return svg.icon.cloneNode(true)
			}
			return null
		}
		
		function load(){
			fxy.on(()=>{
				gui.Icons = Icons
			},'fxy.modules.design.icons')
			return null
			//shared actions
			//function load_svgs(){
			//	return new Promise((success,error)=>{
			//		if('svgs' in icons) success(icons.svg)
			//		return window.fetch(window.url('components.files.content/icons/svg'))
			//		             .then(x=>x.json())
			//		             .then(data=>rename_data(data))
			//		             .then(svgs=>success(icons.svgs = svgs))
			//		             .catch(error)
			//	})
			//}
			//function rename_data(data){
			//	let same = {}
			//	let svgs = {}
			//	for(let id in data){
			//		let name = id.split('-').filter(part=>!fxy.is.numeric(part)).join('-')
			//		if(name in svgs){
			//			if(name in same) same[name] = same[name]+1
			//			else same[name] = 1
			//			name += `-${same[name]}`
			//		}
			//		data[id].file = data[id].name
			//		data[id].name = name
			//		svgs[data[id].name] = data[id]
			//	}
			//	return svgs
			//}
		}
	}
})