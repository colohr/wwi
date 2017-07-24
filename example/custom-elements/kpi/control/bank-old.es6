class DataLoader{
	constructor(element){
		//this.list = document.createElement('browser-list')
		//this.list.id = "banks"
		//this.list.style.width = "300px"
		
		element.loading = get_loading_element('Banks')
		element.shadowRoot.appendChild(element.loading)
		//element.list = this.list
		load_banks().then(()=>{
			element.loading.style.opacity = 0
			window.requestAnimationFrame(()=>{
				setTimeout(()=>{
					element.graph_ui.banks = element
					element.loading.remove()
					delete element.loading
				},200)
			},100)
		})
		
		function load_banks(){
			element.shadowRoot.appendChild(element.list)
			return element.api
			              .banks()
			              .then(data=>set_data(element.list,data))
			              .then(()=>{
				              element.list.on('select',(e)=>{
					              if(element.list.selected_item){
						              element.list.selected_item.selected=false
					              }
					              let selection = e.detail
					              if(!selection.selected) selection.selected=true
					              element.list.selected_item = selection
					              if('select' in element) element.select(selection.data.data)
				              })
			              }).catch(console.error)
		}
		
		
	}
}

function get_loading_element(name){
	let container = document.createElement('div')
	container.setAttribute('gui','')
	container.setAttribute('fit','')
	container.setAttribute('vertical','')
	container.setAttribute('center-center','')
	container.style.transition = 'opacity 300ms ease'
	container.style.willChange = 'opacity'
	container.style.background = 'rgb(201,200,202)'
	container.style.zIndex = '100'
	container.style.cursor = 'wait'
	
	let loading = document.createElement('div')
	loading.innerHTML = `Loading ${name}...`
	loading.style.textTransform = 'capitalize'
	loading.style.display = 'block'
	loading.style.position = 'relative'
	loading.style.fontSize = '16px'
	loading.style.color = 'rgb(101,100,102)'
	
	container.appendChild(loading)
	return container
	
}

const Mix = Base => class extends kpi.Mix(Base){
	connect_banks(){
		return on_active(this)
	}
}
kpi.banks = function kpi_get_banks(page){
	if(!('bank_data_loader' in page)) page.bank_data_loader = new DataLoader(page)
	return page
}
