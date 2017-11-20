wwi.exports('sticky',(sticky,fxy)=>{
	
	const creator = new Proxy(document, {
		get(o, k) {
			let type = k === 'item' ? 'sticky-item':'div'
			let dom = o.createElement(type)
			if(k.charAt(0) === '.'){
				let class_name = k.replace('.', '')
				dom.classList.toggle(class_name, true)
			}
			return dom
		}
	})
	
	const selector = Symbol.for('item selector')
	const selectors = {
		footer:{
			type:'class',
			value:'footerBar'
		},
		group:{
			type:'class',
			value:'listGroup'
		},
		header:{
			type:'class',
			value:'headerBar'
		},
		item:{
			type:'tag',
			value:'sticky-item'
		}
	}
	
	
	
	
	const SelectorMix = Base => class extends Base{
		get footers() { return this.all(this.selectors.footer) }
		get groups() { return this.all(this.selectors.group) }
		get headers() { return this.all(this.selectors.header) }
		get selectors(){ return get_selectors() }
		item_selected(item){
			//console.log(item)
			
		}
	}
	
	sticky.Selector = {
		get create(){ return creator },
		get list(){ return get_itemdata_list },
		get selectors(){ return get_selectors() },
		get Mix(){ return SelectorMix }
	}
	
	//shared actions
	
	function get_itemdata_list(itemdata) {
		
		return itemdata.list.map(generate_item)
		
		function generate_item(item){
			let keys = Object.keys(item)
			let data = {}
			for(let name of keys){
				if(name !== 'i' || name !== 'dom') data[name] = item[name]
			}
			if (!item.dom) {
				item.dom = creator.item
				//ItemSelect.item(item.dom)
			}
			delete data.dom
			item.dom.setAttribute('data-key', itemdata.key)
			item.dom.data = data
			let html_key = `${itemdata.key}_html`
			item.dom.content = html_key in item ? item[html_key] : item[itemdata.key]
			return item
		}
		
	}
	
	function get_selector(name){
		if(name in selectors){
			let target = selectors[name]
			switch(target.type){
				case 'class':
					return `.${target.value}`
				case 'tag':
					return `${target.value}`
			}
		}
		return ''
	}
	
	function get_selectors(){ return new Proxy(selectors,{ get(o,name){ return get_selector(name) } }) }
	
	
	
})


//const ItemSelector = list => {
//	return new Proxy({
//		list,
//		current: null,
//		get selected() {return this.list.items.filter((item) => {return item.classList.includes('item-selected')})},
//	}, {
//		get(o, k){
//			if (k in o) return o[k]
//			else if (k in ItemSelect) return ItemSelect[k]
//			return
//		},
//		set(o, k, v){
//			if (k === 'select' || k === 'current') {
//				o.current = ItemSelect.select(v)
//			} else if (k === 'deselect') {
//				ItemSelect.deselect(v)
//				if (o.current === v) o.current = null
//			} else if (k === 'disable') {
//				ItemSelect.disable(v)
//			}
//			else if (k === 'enable') {
//				ItemSelect.enable(v)
//			}
//			return true
//		}
//	})
//};


//const SelectorMix = Base => class extends Base{
//	get footers() {
//		return this.all(this.selectors.footer)
//		return Array.from(this.shadowRoot.querySelectorAll(this.footerSelector))
//	}
//	get footerSelector() {
//		return get_selector('footer');
//		return this.hasAttribute('footer-selector') ? this.getAttribute('footer-selector') : `.${footer_selector}`
//	}
//	get groups() {
//		return this.all(this.selectors.group)
//		return Array.from(this.shadowRoot.querySelectorAll(this.groupSelector))
//	}
//	get groupSelector() {
//		return get_selector('group');
//		return this.hasAttribute('group-selector') ? this.getAttribute('group-selector') : `.${group_selector}`
//	}
//	get headers() {
//		return this.all(this.selectors.header)
//		return Array.from(this.shadowRoot.querySelectorAll(this.headerSelector))
//	}
//	get headerSelector() {
//		return get_selector('header');
//		return this.hasAttribute('header-selector') ? this.getAttribute('header-selector') : `.${header_selector}`
//	}
//	get itemSelector() {
//		return get_selector('item');
//		return this.hasAttribute('item-selector') ? this.getAttribute('item-selector') : `.${item_selector}`
//	}
//	get selectors(){ return get_selectors() }
//	item_selected(item){
//		console.log(item)
//	}
//	item_event(e) {
//		if (e.preventDefault) e.preventDefault()
//		var item = e.currentTarget
//		let isSelected = ItemSelect.selected(item)
//		let control= this.selector
//		let last = control.current
//		if (isSelected) control.deselect = item
//		else control.select = item
//		let collection = this.collection
//		let detail = {
//			get data() {
//				let set = collection.has(this.item.dataset.group) ? collection.get(this.item.dataset.group) : null
//				if (!set) return set
//				return Array.from(set)[this.item.dataset.groupIndex] || null
//			},
//			isSelected,
//			item,
//			last,
//			originalEvent: e,
//			type: isSelected ? 'deselected' : 'selected'
//		}
//		return this.dispatchEvent(new CustomEvent(`item-${detail.type}`, {
//			bubbles: true,
//			composed: true,
//			detail
//		}))
//	}
//	get selector() {
//		if (!this[selector]) this[selector] = ItemSelector(this)
//		return this[selector]
//	}
//}