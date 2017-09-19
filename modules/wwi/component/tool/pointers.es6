window.fxy.exports('tool',(tool,fxy)=>{
	const pointers = Symbol.for('pointers tool')
	//exports
	tool.pointers = {
		element:get_element
	}
	
	//shared actions
	function get_element(element){
		if(!(pointers in element)) element[pointers] = {style:get_style(element)}
		return new Proxy(element[pointers],{
			get(o,name){
				if(name in o) return o[name]
				if(name === 'actions') return (x)=>set_actions(x || element)
				return null
			},
			has(o,name){
				if(name in o) return o[name]
				return false
			},
			set(_,name,value){
				if(fxy.is.element(value)) set(name,value)
				return true
			}
		})
	}
	
	function get_style(element){
		let style = element.query('style[pointer-styles]')
		if(style === null){
			style = fxy.dom.style({'pointer-styles':''},...[window.url('modules/wwi/design/pointer/drag.css')])
			let children = Array.from(element.shadow.children)
			let first = null
			if(children.length) first = children[0]
			if(first === null) element.shadow.appendChild(first)
			else element.shadow.insertBefore(style,first)
		}
		return style
	}
	
	function set(name,element){
		switch(name){
			case 'container':
			case 'moves':
			case 'move':
				element.setAttribute('aria-dropeffect','move')
				break
			case 'copy':
			case 'copies':
				element.setAttribute('aria-dropeffect','copy')
				break
			case 'reference':
			case 'references':
				element.setAttribute('aria-dropeffect','reference')
				break
			case 'execute':
			case 'executes':
				element.setAttribute('aria-dropeffect','execute')
				break
			case 'none':
				element.setAttribute('aria-dropeffect','none')
				break
			case 'dragstart':
			case 'dragging':
			case 'moving':
				element.setAttribute('aria-grabbed','true')
				break
			case 'dragend':
			case 'end':
			case 'stopped':
			case 'draggable':
				element.setAttribute('aria-grabbed','false')
				element.removeAttribute('drag-entered')
				break
			case 'enter':
			case 'dragenter':
			case 'over':
			case 'dragover':
				element.setAttribute('drag-entered','')
				break
		}
		return element
	}
	
	function set_actions(element){
		let pointers = element.pointers
		let container = element.shadow.querySelector('[pointers-container]')
		
		if(container.hasAttribute('pointer-events-set') === false){
			container.addEventListener('mousedown',container_down,false)
			container.addEventListener('mouseup',container_up,false)
			container.setAttribute('pointer-events-set','')
		}
		
		let items = Array.from(container.children)
		let current = null
		for(let item of items){
			if(item.hasAttribute('pointer-events-set') === false){
				pointers.draggable = item
				item.addEventListener('dragenter', drag_enter, false)
				item.addEventListener('dragend', drag_end, false)
				item.addEventListener('dragover', drag_over, false)
				item.addEventListener('dragstart', drag_start, false)
				item.addEventListener('drop', drop, false)
				item.setAttribute('pointer-events-set','')
			}
		}
		
		//return value
		return element
		
		//shared actions
		function container_down(){ container.setAttribute('drag-active','') }
		
		function container_up(){ container.removeAttribute('drag-active') }
		
		function drag_end(e) {
			pointers[e.type] = this
			items.forEach(item=>pointers[e.type]=item)
			container.removeAttribute('drag-active')
			current=null
		}
		
		function drag_enter(e) {
			if(this === current || !fxy.is.element(current)) return
			pointers[e.type] = this
			let x = sides(this)
			if(x.after && x.after !== current) container.insertBefore(current,x.after)
		}
		
		function drag_over(e) {
			if (e.preventDefault) e.preventDefault()
			e.dataTransfer.dropEffect = 'move'
			if(this === current || !fxy.is.element(current)) return
			pointers[e.type] = this
			let x = sides(this)
			if(!x.last && current) container.insertBefore(current,this)
			else container.appendChild(current)
			return false
		}
		
		function drag_start(e) {
			if(!fxy.is.element(this)) return
			pointers[e.type] = this
			current = this
			container.setAttribute('drag-active','')
		}
		
		function drop(e) {
			if (e.stopPropagation) e.stopPropagation()
			if(e.preventDefault) e.preventDefault()
			if(!fxy.is.element(current)) return
			let x = sides(this)
			if(x.active.before === this) container.insertBefore(current,this)
			else if(x.last) container.appendChild(current)
			container.removeAttribute('drag-active')
		}
		
		function sides(element,active){
			return {
				get active(){ return sides(current,true) },
				prevent:active !== true && current !== null && element === current,
				before:element.previousElementSibling,
				after:element.nextElementSibling,
				
				get last(){ return this.after === null }
			}
		}
	}
})