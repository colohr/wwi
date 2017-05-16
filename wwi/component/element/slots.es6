wwi.exports('element',(element,fxy) => {
	const is = fxy.is
	
	
	const ElementSlots = Base => class extends Base {
		get slots(){
			const shadow = this.shadow
			return new Proxy({
				get list(){ return Array.from(shadow.querySelectorAll('slot')) },
				get count(){ return this.list.length },
				get(name){ return shadow.querySelector(`slot[name="${name}"]`) }
			},{
				get(o,name){
					if(name in o) return o[name]
					let list = o.list
					let match = list.filter(slot=>{ return slot.name = name })
					if(match.length) return get_slot( match[0] )
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
				if(name in o) return o[name]
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

//var nodes = Polymer.dom(this).childNodes;
//return Array.prototype.filter.call(nodes,
//	function(n) { return n.nodeType = Node.TEXT_NODE });
//ready() {
//	super.ready(); // for 2.0 class-based elements only
//	this._boundHandler = this._processLightChildren.bind(this);
//	setTimeout(this._boundHandler);
//	this.$.slot.addEventListener('slotchange', this._boundHandler);
//}
//
//_processLightChildren: function() {
//	console.log(this.$.slot.assignedNodes());
//}