window.fxy.exports('element',(element,fxy) => {
	const is = fxy.is
	
	const ElementSlots = Base => class extends Base {
		get slots(){
			const shadow = this.shadow
			return new Proxy({
				get list(){ return Array.from(shadow.querySelectorAll('slot')) },
				get count(){ return this.list.length },
				get(name){
					let target_slot = shadow.querySelector(`slot[name="${name}"]`)
					if(target_slot === null) target_slot = shadow.querySelector(`slot#${name}`)
					return target_slot
				}
			},{
				get(o,name){
					let list = o.list
					let match = list.filter(slot=>{ return slot.name === name || slot.id === name })
					if(match.length) return get_slot( match[0] )
					if(name in o) return o[name]
					return o
				}
			})
		}
	}
	
	element.slots = ElementSlots
	//---------shared actions----------
	function get_content_node(slot,at_index){
		return slot.assignedNodes()[at_index || 0]
	}
	function get_content_nodes(slot){
		return Array.from(slot.assignedNodes())
	}
	
	function get_slot(slot){
		return new Proxy(slot,{
			get(o,name){
				if(name === 'target') return get_content_node(o)
				else if(name === 'targets') return get_content_nodes(o)
				else if(name === 'items' || name === 'item'){
					let items =  get_content_nodes(o).filter(node=>node.nodeType !== 3)
					if(name === "item") return items[0] || null
					return items
				}
				if(name in o){
					let value = o[name]
					if(typeof value === 'function') value.bind(o)
					return value
				}
				return null
			},
			has(o,name){
				return name in o
			},
			set(o,name,value){
				if(is.nothing(value)) return true
				switch(name){
					case 'html':
						get_content_node(o).innerHTML = value
						break
				}
				return true
			}
		})
	}
})