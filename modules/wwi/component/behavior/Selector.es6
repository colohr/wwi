(function(export_selector){ return export_selector() })
(function(){
    return function external_module(exports,fxy){
	    const is_focused = Symbol.for('item is focused')
	    const is_selector_item = Symbol.for('item is selector item')
	    const item_selector_options = Symbol('item selector options')
	    const has_item_action = Symbol.for('selector has item action')
	    const focus_select_keys = [13,32]
	    const default_item_selector_options = {
		    item:'*',
		    query:'#options',
		    role:'option',
		    tag:'slot'
	    }
	    
	    const SelectItemActions = Base => class extends Base{
		    on_item_action(event){
			    on_item_action(event,this)
			    if(event.detail.select){
				    this.dispatchEvent(new CustomEvent('select',{bubbles:true,composed:true,detail:event.detail}))
			    }
		    }
		    set_item_select_action(item){ return set_item_select_action(this,item) }
	    }
	    
	    const Selectable = Base => class extends SelectItemActions(Base) {
	    	
	    	get item_selector_options(){ return item_selector_options in this ? this[item_selector_options]:default_item_selector_options }
		    set item_selector_options(values){
	    		if(fxy.is.text(values) || fxy.is.data(values)) return this[item_selector_options] = get_item_selector_options(values)
		        return delete this[item_selector_options]
		    }
	    	get options_slot(){ return get_option_container(this) }
		    get option_items(){ return get_option_items(this) }
		    get items(){ return this.option_items }
		    get_item(name,value){ return this.option_items.filter(item=>item.hasAttribute(name) && item.getAttribute(name) === value)[0] || null }
		    has_item(name,value){ return this.option_items.filter(item=>item.hasAttribute(name) && item.getAttribute(name) === value).length > 0 }
		    get selected(){ return this.items.filter(item=>{ return item.hasAttribute('aria-selected') && item.getAttribute('aria-selected') === 'true' })}
		    get selector(){ return get_selector(this) }
		    set_selector_items(items){ return configure_items(this,items) }
		    set_tabindex(active) {
			    let items = this.option_items
			    for (let item of items) item.setAttribute('tabindex', active ? '0' : '-1')
			    return this
		    }
	    }
	
	    
	
	    const Selector = Base => class extends Selectable(Base){
		    changed(name, old, value) {
			    switch (name) {
				    case 'multi':
					    if (value !== null) this.aria.multiselectable = 'true'
					    else this.aria.multiselectable = 'false'
					    break
				    case 'required':
					    if (value !== null) this.aria.required = 'true'
					    else this.aria.required = 'false'
					    this.update_selections()
					    break
			    }
		    }
			get selects(){ return this.item_selector_options }
			set selects(value){
				this.item_selector_options = value
				this.update_items()
			}
		    connected() {
	    		this.define({multi:true,required:true})
			    this.setAttribute('role', 'listbox')
			    const multi = 'aria-multiselectable'
			    const req = 'aria-required'
			    if (!this.hasAttribute(multi)) {
				    if (this.hasAttribute('multi')) this.setAttribute('aria-multiselectable', 'true')
				    else this.setAttribute('aria-multiselectable', 'false')
			    }
			    if (!this.hasAttribute(req)) {
				    if (this.hasAttribute('required')) this.setAttribute('aria-required', 'true')
				    else this.setAttribute('aria-required', 'false')
			    }
			    this.update_items()
			    if('list_connected' in this) this.list_connected()
		    }
		    update_items() {
			    if ('update_item_timer' in this) {
				    window.clearTimeout(this.update_item_timer)
				    delete this.update_item_timer
			    }
	    		return new Promise((success,error)=>{
				    this.update_item_timer = window.setTimeout(() => {
					    this.update_selections(Array.from(this.set_selector_items(this.option_items)))
					    delete this.update_item_timer
					    success()
				    }, 100)
			    })
		    }
		    update_selections(items) {
			    if (this.getAttribute('aria-required') === 'true') {
				    if (!Array.isArray(items)) items = this.items
				    let selected = this.selected
				    if (selected.length <= 0) this.selector.selected = items[0]
			    }
			    return this
		    }
	    }
	
	
	    return Selector
	
	    //shared actions
	    function configure_item(item,setup){
		    if(item){
			    item.setAttribute('role','option')
			    if(!item.hasAttribute('aria-selected')) item.setAttribute('aria-selected','false')
			    else if(!setup.multi){
				    if(item.getAttribute('aria-selected') === 'true' && !setup.selection) setup.selection = true
				    else if(item.getAttribute('aria-selected') === 'true' && setup.selection) item.setAttribute('aria-selected','false')
			    }
			    if(!item.hasAttribute('aria-disabled')) item.setAttribute('aria-disabled','false')
			    if(!item.hasAttribute('tabindex')) item.setAttribute('tabindex','0')
		    }
		    return item
	    }
	    
	    function configure_items(list,items){
		    items = get_valid_item_elements(items)
		    let set = new Set(items)
		    if(set.size){
			    let setup = {
			    	multi:list.getAttribute('aria-multiselectable') === 'true' ? true:false,
				    required:list.getAttribute('aria-required') === 'true' ? true:false,
				    selection:false
			    }
			    let selector = get_selector(list)
			    for(let item of set){
			    	item = configure_item(item,setup)
				    item = set_item_select_action(list,item)
			    }
			    if(setup.required && !setup.selection && set.size) selector.selected = items[0]
		    }
		    return set
	    }
	
	    function get_item_selector_options(values){
		    let new_options = {}
		    for(let name in default_item_selector_options) new_options[name] = default_item_selector_options[name]
		    if(fxy.is.text(values)) new_options.item = values
		    else if(fxy.is.data(values)){
			    for(let name in values){
				    if(name in new_options) new_options[name] = values[name]
			    }
		    }
		    return new_options
	    }
	    
	    function get_option_container(list){
	    	let options = list.item_selector_options
		    if(options.query === true) return 'shadowRoot' in list ? list.shadowRoot:list
		    let query_selector = `${options.tag || ''}${options.query || '#options'}`
	    	return list.query(query_selector)
	    }
	    
	    function get_option_items(list){
		    let selector_options = list.item_selector_options
	    	let options = get_option_container(list)
		    if(!options) return []
		    let items
		    if(options.localName === 'slot') items = get_option_items_from_slot(options)
		    else items = Array.from(options.querySelectorAll(selector_options.item))
		    if(selector_options.item === '*') return items
		    return items.filter(item=>item.localName === selector_options.item)
		    function get_option_items_from_slot(slot){
			    return Array.from(slot.assignedNodes()).filter(node=>node instanceof HTMLElement)
		    }
	    }
	    
	    function get_selector(element){
		    return new Proxy(element, {
			    get(o, name) {
				    let	items = o.items
				    var result = null
				    switch (name) {
					    case 'items':
						    result = items
						    break
					    case 'length':
					    case 'count':
						    result = items.length
						    break
					    case 'selected':
					    case 'item':
						    result = o.selected
						    if(name === 'item') result = result[0]
						    break
					    default:
						    break
				    }
				    return result
			    },
			    set(o, name, value) {
				    if(value instanceof HTMLElement){
					    if (name === 'selected') {
						    if(!o.multi){
							    let selected = o.selected
							    if(selected.length === 1) selected[0].setAttribute('aria-selected', 'false')
						    }
						    let is_selected = value.getAttribute('aria-selected') === 'true' ? true:false
						    if (!is_selected) value.setAttribute('aria-selected', 'true')
						    else value.setAttribute('aria-selected', 'false')
						    if(o.getAttribute('aria-required') === "true" && o.selected.length <= 0) value.setAttribute('aria-selected','true')
					    }
				    }
				    return true
			    }
		    })
	    }
	
	    function get_valid_item_elements(items){
		    if(typeof items === 'object' && items !== null) return Array.from(items).filter(item=>item instanceof HTMLElement)
		    return []
	    }
	
	    function is_focus_select_key(key){ return focus_select_keys.includes(key) }
	
	    function on_item_action_event(event){
		    let detail = {}
		    detail.item = event.currentTarget
		    detail.ally = wwi.ally.keydown(event)
		    let type = event.type
		    if( type === 'keydown' && is_focus_select_key(event.keyCode || event.which) ) detail.select = true
		    else detail.ally.activate()
		    
		    if(type === 'click') detail.select = true
		    else if(type === 'blur') detail.remove = true
		    else if(type === 'focus') detail.add = true
		    
		    if(detail.item.hasAttribute('aria-disabled') && detail.item.getAttribute('aria-disabled') === 'true'){
			    return
		    }
		    return this.dispatchEvent( new CustomEvent('item action',{bubbles:true,composed:true,detail}) )
	    }
	
	    function on_item_action(event,menu){
		    let data = event.detail
		    let item = data.item
		    if(data.add) {
			    item[is_focused] = true
			    item.addEventListener('keydown', on_item_action_event.bind(menu), false)
		    }
		    else if(data.remove){
			    item[is_focused] = false
			    item.removeEventListener('keydown', on_item_action_event.bind(menu), false)
		    }
		    else if(data.select) get_selector(menu).selected = item
		    return item
	    }
	    
	    function set_item_select_action(list,item){
		    if( !(has_item_action in list) ) {
			    list.addEventListener('item action', list.on_item_action.bind(list), false)
			    list[has_item_action] = true
		    }
		    if(is_focused in item) return item
		    item.onclick = on_item_action_event.bind(list)
		    item.onfocus = on_item_action_event.bind(list)
		    item.onblur = on_item_action_event.bind(list)
		    return item
	    }
    }
})

//console.log({values})
//if(fxy.is.text(values)) new_options.item = values
//else if(fxy.is.data(values)){
//	for(let name in values){
//		if(name in new_options) new_options[name] = values[name]
//   }
//}
//else return delete this[default_item_selector_options]
//return this[default_item_selector_options] = new_options
//return this.query('slot#options') }
//return Array.from(this.options_slot.assignedNodes()).filter(node=>node instanceof HTMLElement)
//return this.option_items.filter(item=>{ return item.getAttribute('role') === 'option' })}
//set_selector_items(items){
//   items = get_valid_item_elements(items)
//   let set = new Set(items)
//   if(set.size){
//    let multi = this.getAttribute('aria-multiselectable') === 'true' ? true:false
//    let required = this.getAttribute('aria-required') === 'true' ? true:false
//    var has_selection
//    let selector = this.selector
//    for(let item of set){
//	    item = this.set_item_select_action(item)
//	    if(item){
//		    item.setAttribute('role','option')
//		    if(!item.hasAttribute('aria-selected')) item.setAttribute('aria-selected','false')
//		    else if(!multi){
//			    if(item.getAttribute('aria-selected') === 'true' && !has_selection) has_selection = true
//			    else if(item.getAttribute('aria-selected') === 'true' && has_selection) item.setAttribute('aria-selected','false')
//		    }
//		    if(!item.hasAttribute('aria-disabled')) item.setAttribute('aria-disabled','false')
//		    if(!item.hasAttribute('tabindex')) item.setAttribute('tabindex','0')
//	    }
//    }
//    if(required && !has_selection && set.size) selector.selected = items[0]
//   }
//   return set
//}

//if( !(has_item_action in this) ) {
//   this.addEventListener('item action', this.on_item_action.bind(this), false)
//   this[has_item_action] = true
//}
//if(is_focused in item) return item
//item.onclick = on_item_action_event.bind(this)
//item.onfocus = on_item_action_event.bind(this)
//item.onblur = on_item_action_event.bind(this)
//return item