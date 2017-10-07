window.fxy.exports('sort',(sort,fxy)=>{
	class Sort{
		constructor(element){
			element.define({
				'current-sort':true
			})
			element.setAttribute('sort-view','')
			this.element = element
			this.container = get_container(this)
			this.current = null
		}
		get active(){ return this.get('aria-activedescendant') }
		set active(value){ return this.set('aria-activedescendant',value) }
		get current(){ return this.active_element || null }
		set current(element){
			var last = this.active
			var active = null
			if(!fxy.is.nothing(element)) active = element instanceof HTMLElement ? element.id : null
			this.active = active
			this.active_element = element
			return active
		}
		get(name){ return this.element.querySelector(name) }
		set(name,value){
			if(value === null) this.element.removeAttribute(name)
			else this.element.setAttribute(name,value)
			return this
		}
		get sorted(){ return get_sorted(this) }
		
		update(){
			this.element.dispatchEvent(new CustomEvent('sort',{bubbles:true,detail:this}))
			return this
		}
	}
	
	//exports
	sort.controller = controller
	
	//shared actions
	function controller(element){
		let symbol = fxy.symbols.sort_controller
		if(symbol in element) return element[symbol]
		return element[symbol] = new Sort(element)
	}
	
	function drag_end(e) {
		// this/e.target is the source node.
		let elements = this.sort.elements
		if(elements){
			elements.forEach((e,i)=>{
				e.dataset.position = i
				e.id = fxy.id.dash(e.textContent.trim())+'-tab'
				e.removeAttribute('over')
			})
			this.sort.control.update()
		}
	}
	
	function drag_enter(e) { this.setAttribute('over','') }
	
	function drag_leave(e) { this.removeAttribute('over') }
	
	function drag_over(e) {
		if (e.preventDefault) e.preventDefault()
		this.removeAttribute('dragging')
		e.dataTransfer.dropEffect = 'move'
		return false
	}
	
	function drag_start(e) {
		this.setAttribute('dragging','')
		this.sorter.current = this
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/html', this.innerHTML)
	}
	//function drop(e) {
	//	if (e.stopPropagation) e.stopPropagation()
		//let sort = this.sort
		//let controller = sort.controller
		//let current = controller.current || null
		//if (current && current !== this) {
		//	let view = sort.view
		//	if(view){
		//		let target = sort.right || sort.left
		//		let view_target = get_item_view(target,controller)
		//	}
		//}
	//}
	
	function get_container(sort){
		let container = sort.element.querySelector('[sort-container]')
		if(container === null && sort.element.shadowRoot) container =sort.element.shadowRoot.querySelector('[sort-container]')
		if(container === null) container = sort.element
		container.sort_view = sort.element
		return container
	}
	
	function get_sorted(sort){
		let items = []
		console.log(sort.container)
		if('get_sorted' in sort.element) items = sort.element.get_sorted()
		else items = Array.from(sort.container.querySelectorAll('[draggable]'))
		console.log(items)
		return items.map(item=>sorted_item(item,sort))
	}
	function get_item_view(item,sort){
		let element = !fxy.is.nothing(sort.element.shadowRoot) ? sort.element.shadowRoot:sort.element
		let id = item.hasAttribute('aria-controls') ? item.getAttribute('aria-controls'):null
		if(!id) return null
		return element.querySelector(`#${id}`)
	}
	function set_sorted_item(item,sorter){
		item.addEventListener('dragenter', drag_enter, false)
		item.addEventListener('dragend', drag_end, false)
		item.addEventListener('dragleave', drag_leave, false)
		item.addEventListener('dragover', drag_over, false)
		item.addEventListener('dragstart', drag_start, false)
		//item.addEventListener('drop', drop, false)
		item.setAttribute('sorted-item','')
		item.sort = new Proxy(item,{
			get(o,name){
				let value = null
				if(name in o) {
					value = o[name]
					if(typeof value === 'function') value = value.bind(o)
				}
				switch(name){
					case 'controller':
						return sorter
					case 'left':
						return o.previousElementSibling
					case 'right':
						return o.nextElementSibling
					case 'view':
						return get_item_view(o)
				}
				return value
			},
			has(o,name){ return name in o },
			set(o,name,value){
				let remove
				if(fxy.is.nothing(value)) remove = true
				switch(name){
					case 'disabled':
						if(!remove || value === true) o.removeAttribute('draggable')
						else o.setAttribute('draggable','')
						break
					case 'enabled':
					case 'draggable':
						if(remove || value === false) o.removeAttribute('draggable')
						else o.setAttribute('draggable','')
						break
				}
				return true
			}
		})
		return item
	}
	
	function sorted_item(item,sorter){
		if(!item.hasAttribute('sorted-item')) set_sorted_item(item,sorter)
		return item
		
	}
})