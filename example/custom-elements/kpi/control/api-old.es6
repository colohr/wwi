wwi.exports('kpi',(kpi,fxy)=>{
	//const Graph = fxy.require('os/Graph')
	const queries = {
		banks: `{
		  banks {
		    core
		    grade {
		      cardinal
		      key
		      level
		      position
		      school
		      title
		    }
		    key
		    language
		    name
		    sections {
		      bank
		      position
		      targets {
		        bank
		        items {
		          ditl
		          file
		          key
		          bank{
		            name
		          }
		        }
		        position
		        section
		        title
		      }
		      title
		    }
		    subject
		    title
		    type
		    version
		  }
		}`,
		item(bank,ditl){
			return `{
					item_by_ditl(bank:"${bank}",ditl:"${ditl}"){
						answer
						bank
						choices{
							graphics{
								class
								src
								tagName
							
							}
							name
							text
							type
						}
						feedback{
							name
							text
							type
						}
						graphics{
							class
							src
							tagName
						}
						info{
							Name
							Grade
							Subject
							Language
							Type
							Objective
							Target
							Randomize
							DITL
							Answer
						}
						passage{
							id
							name
							text
							type
						}
						question{
							name
							text
							type
						}
						


					}
				}`
		}
	}
	
	const api  = {
		//library: new Graph(graph.settings),
		//get library(){ return get_graph_library() },
		bank(name){
			return this.library.get(`{
					item_references(bank:"${name}"){
						ditl
					}
				}`).then(res => res.item_references)
		},
		bank_names(){ return this.library.get(`{bank_names}`).then(res => res.bank_names) },
		banks(){ return this.library.get(queries.banks).then(res => get_banks(res)) },
		item(bank, ditl){ return this.library.get(queries.item(bank,ditl)).then(res => res.item_by_ditl) },
		
	}
	
	const graph = {
		element:{
			get source(){
				let paths = graph.settings.interface.webpaths
				return `${paths[0]}/${paths[1]}/ui`
			}
		},
		settings:{
			interface: {
				webpaths: ['api', 'kindle-publishing', 'graph']
			}
		}
	}
	
	const library = Symbol.for('api library')
	
	
	const GraphMix = Base => class extends Base{
		
		get api(){ return get_api(this) }
		
		
		connect_library(){
			let graph_url = this.graph_url
			return this.library = fxy.require('graph/api')(...graph_url)
		}
		
		get graph_ui(){ return get_graph_element() }
		get graph_url(){
			let paths = []
			let value = this.getAttribute('paths')
			if(this.host) paths.push(this.host)
			if(this.port) paths.push(this.port)
			if(fxy.is.text(value)) paths = paths.concat(value.split(',').map(item=>item.trim()))
			return paths
		}
		//get kpi(){ return kpi }
		get library(){ return graph_library(this) }
		set library(value){ return graph_library(this,value) }
	
	}
	
	
	//exports
	//kpi.api = api
	kpi.Graph = GraphMix
	kpi.Dash = Base => class extends GraphMix(Base){
		connected(){
			let library = this.connect_library()
			library.banks = kpi.banks(this)
			this.item.setAttribute('host',this.host)
			this.item.setAttribute('port',this.port)
			this.item.setAttribute('paths',this.paths)
		}
		get item(){ return this.query('kindle-item') }
		select(item){
			this.item.bank = item.bank.name
			this.item.ditl = item.ditl
		}
	}
	
	
	//shared actions
	function get_api(element){
		return {
			bank(name){
				return this.library.get(`{
					item_references(bank:"${name}"){
						ditl
					}
				}`).then(res => res.item_references)
			},
			bank_names(){ return element.library.get(`{bank_names}`).then(res => res.bank_names) },
			banks(){ return element.library.get(queries.banks).then(res => get_banks(res)) },
			item(bank, ditl){ return element.library.get(queries.item(bank,ditl)).then(res => res.item_by_ditl) }
		}
	}
	function get_banks(data) { return  'banks' in data ? data.banks : [] }
	
	function get_graph_element(){
		if(graph.element.iframe) return graph.element.iframe
		let iframe = document.createElement('iframe')
		iframe.id = 'kpi_graph'
		iframe.src = graph.element.source
		window.document.body.appendChild(iframe)
		window.addEventListener('toggle database',e=>{
			let target = e.detail || e.currentTarget
			if(graph.element.iframe.style.display === 'block') {
				graph.element.iframe.style.display = 'none'
				if('aria' in target) target.aria.selected = false
			}
			else {
				graph.element.iframe.style.display = 'block'
				if('aria' in target) target.aria.selected = true
			}
		})
		return graph.element.iframe = set_styles(iframe)
		
		function set_styles(frame){
			let styles = {
				position: "fixed",
				margin: "0 auto",
				display: "none",
				border: "none",
				top: "calc(40px + 1%)",
				width: "98%",
				left: "1%",
				height: "calc(98% - 40px)",
				boxShadow: "0 1px 19px rgba(0,0,0,0.3)",
				boxSizing: "border-box",
				zIndex: "1",
				borderRadius: "7px",
				padding: "1px"
			}
			
			for(let name in styles){
				frame.style[name] = styles[name]
			}
			return frame
		}
	}
	
	function graph_library(element,value){
		if(fxy.is.nothing(value)){
			if(library in element) return element[library]
			return element[library] = fxy.require('graph/api')(graph.settings)
		}
		return element[library] = value
	}
	
	
})