(function(export_selector){ return export_selector() })
(function(){
    return function external_module(exports,fxy){
	    const is_focused = Symbol.for('item is focused')
	    const item_selector_options = Symbol('item selector options')
	    const has_item_action = Symbol.for('selector has item action')
	    const focus_select_keys = [13,32]
	    const default_item_selector_options = {
		    item:'*',
		    query:'#options',
		    role:'option',
		    tag:'slot'
	    }
	    
	    const Selectable = Base => class extends Base {
	    	get item_selector_options(){ return item_selector_options in this ? this[item_selector_options]:this[item_selector_options]=get_item_selector_options() }
		    set item_selector_options(values){ return this[item_selector_options] = get_item_selector_options(values) }
	    	get options_slot(){ return get_option_container(this) }
		    get option_items(){ return get_option_items(this) }
		    get items(){ return this.option_items }
		    get_item(name,value){ return this.option_items.filter(item=>item.hasAttribute(name) && item.getAttribute(name) === value)[0] || null }
		    has_item(name,value){ return this.option_items.filter(item=>item.hasAttribute(name) && item.getAttribute(name) === value).length > 0 }
		    get selected(){ return this.items.filter(item=>is_selected(item)) }
		    get selector(){ return get_selector(this) }
		    set_selector_items(items){ return configure_items(this,items) }
		    set_tabindex(active) {
			    let items = this.option_items
			    for (let item of items) tab_index(item, active ? '0' : '-1')
			    return this
		    }
	    }
	    
	    const Selector = Base => class extends Selectable(Base){
	    	constructor(...x){
	    		super(...x)
			    this.define('routes',{
			    	multi(value){ is_multi(this,value !== null ? true:false) },
				    required(value){
					    is_required(this,value !== null ? true:false)
					    this.update_selections()
				    }
			    })
		    }
			
		    connectedCallback() {
				super.connectedCallback()
			    connect_element(this)
			    this.on_item_action = function(event){
				    on_item_action(event,this)
				    if(event.detail.select){
					    this.dispatchEvent(new CustomEvent('select',{
					    	bubbles:true,
						    composed:true,
						    detail:event.detail
					    }))
				    }
			    }
			    
			    this.update_items()
			    if('list_connected' in this) this.list_connected()
		    }
		    get selects(){ return this.item_selector_options }
		    set selects(value){
			    this.item_selector_options = value
			    this.update_items()
		    }
		    set_item_select_action(item){ return set_item_select_action(this,item) }
		    update_items() { return update_items(this) }
		    update_selections(items) {
			    if (is_required(this)) {
				    if (!Array.isArray(items)) items = this.items
				    let selected = this.selected
				    if (selected.length <= 0) this.selector.selected = items[0]
			    }
			    return this
		    }
	    }
	    
	    //exports
	    return Selector
	
	    //shared actions
	    function connect_element(element){
		    element.setAttribute('role', 'listbox')
		    if (!element.hasAttribute('aria-multiselectable')) {
			    if (element.hasAttribute('multi')) is_multi(element,true)
			    else is_multi(element,false)
		    }
		    if (!element.hasAttribute('aria-required')) {
			    if (element.hasAttribute('required')) is_required(element,true)
			    else is_required(element,false)
		    }
		    return element
	    }
	    
	    function configure_item(item,setup){
		    if(item){
			    item.setAttribute('role','option')
			    let selected = is_selected(item)
			    if(!setup.multi){
				    if(selected && !setup.selection) setup.selection = true
				    else if(selected && setup.selection) is_selected(item,false)
			    }
			    is_disabled(item)
			    tab_index(item)
		    }
		    return item
	    }
	    
	    function configure_items(element,items){
		    items = get_valid_item_elements(items)
		    let set = new Set(items)
		    if(set.size){
			    let setup = {
			    	multi:is_multi(element),
				    required:is_required(element),
				    selection:false
			    }
			    let selector = get_selector(element)
			    for(let item of set){
			    	item = configure_item(item,setup)
				    item = set_item_select_action(element,item)
			    }
			    if(setup.required && !setup.selection && set.size) selector.selected = items[0]
		    }
		    return set
	    }
	
	    function get_item_selector_options(values){
		    let new_options = JSON.parse(JSON.stringify(default_item_selector_options))
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
		    let items = []
		    if(!options) return items
		    if(options.localName === 'slot') items = get_option_items_from_slot(options)
		    else items = Array.from(options.querySelectorAll(selector_options.item))
		    if(selector_options.item === '*') return items
		    return items.filter(item=>item.localName === selector_options.item)
		    //shared actions
		    function get_option_items_from_slot(slot){
			    return Array.from(slot.assignedNodes())
			                .filter(node=>node instanceof HTMLElement).filter(node=>{
			                	if(options.role) return node.getAttribute('role') === options.role
					            return true
				            })
		    }
	    }
	    
	    function get_selector(element){
		    return new Proxy(element, {
			    get(o, name) {
				    let	items = o.items
				    let result = null
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
				    }
				    return result
			    },
			    set(o, name, value) {
				    if(value instanceof HTMLElement){
					    if (name === 'selected') {
						    if(!o.multi){
							    let selected = o.selected
							    if(selected.length === 1) is_selected(selected[0],false)
						    }
						    if (!is_selected(value)) is_selected(value,true)
						    else is_selected(value,false)
						    if(is_required(o) && o.selected.length <= 0) is_selected(value,true)
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
	
	    function is_disabled(element,value){
		    let disabled = false
		    if(!fxy.is.nothing(value)) element.setAttribute('aria-disabled',value)
		    if(element.hasAttribute('aria-disabled')) disabled = element.getAttribute('aria-disabled') === 'true'
		    else element.setAttribute('aria-disabled',disabled)
		    return disabled
	    }
	    
	    function is_multi(element,value){
		    let multi = false
		    if(!fxy.is.nothing(value)) element.setAttribute('aria-multiselectable',value)
	    	if(element.hasAttribute('aria-multiselectable')) multi = element.getAttribute('aria-multiselectable') === 'true'
		    else element.setAttribute('aria-multiselectable',multi)
		    return multi
	    }
	
	    function is_required(element,value){
		    let required = false
		    if(!fxy.is.nothing(value)) element.setAttribute('aria-required',value)
		    if(element.hasAttribute('aria-required')) required = element.getAttribute('aria-required') === 'true'
		    else element.setAttribute('aria-required',required)
		    return required
	    }
	    
	    function is_selected(element,value){
	    	let selected = false
		    if(!fxy.is.nothing(value)) element.setAttribute('aria-selected',value)
		    if(element.hasAttribute('aria-selected')) selected = element.getAttribute('aria-selected') === 'true'
		    else element.setAttribute('aria-selected',selected)
		    return selected
	    }
	    
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
		    
		    if(is_disabled(detail.item)) return
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
	
	    function tab_index(element,value){
		    if(!fxy.is.nothing(value)) element.setAttribute('tabindex',value)
		    if(!element.hasAttribute('tabindex')) element.setAttribute('tabindex',0)
		    return element.getAttribute('tabindex')
	    }
	    
	    function update_items(element){
		    if ('update_item_timer' in element) {
			    window.clearTimeout(element.update_item_timer)
			    delete element.update_item_timer
		    }
		    return new Promise(success=>{
			    element.update_item_timer = window.setTimeout(() => {
				    element.update_selections(Array.from(element.set_selector_items(element.option_items)))
				    delete element.update_item_timer
				    success()
			    }, 100)
		    })
	    }
    }
})