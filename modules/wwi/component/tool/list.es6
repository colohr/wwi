(function(get_list){ return get_list() })
(function(){
	    let data_list_change = Symbol('DataList Change')
	    let data_list_info = Symbol('DataList Type Info')
	    let data_list_identity = Symbol.for('DataList Identity')
	
	    let data_list_listener = Symbol('DataList Listener Element')
	    let data_list_listeners = Symbol('DataList Listeners')
	
	    let data_list_once = Symbol('DataList Listens to Action Once')
	    let data_list_value = Symbol('DataList Value')
	
	    class DataList {
		
		    static data(value) {
			    let array = []
			    if (fxy.is.map(value)) array = Array.from(value)
			    else if (fxy.is.set(value)) array = Array.from(value).map((item, index) => [index, item])
			    else if (fxy.is.array(value)) array = value.map((item, index) => [index, item])
			    else if (fxy.is.data(value)) array = Object.keys(value).map(name => [name, value[name]])
			    else if (!fxy.is.nothing(value) && fxy.is.object(value)) {
				    if (Symbol.iterator in value) value = Array.from(value)
				    array = Array.from(value).map((item, index) => [index, item])
			    }
			
			    return {
				    value: new Map(array),
				    get names() { return Array.from(this.value.keys()) }
			    }
			
		    }
		
		    static get gettable(){
			    return ['count','empty','data']
		    }
		
		    static info(type) {
			    if (!this.types.includes(type)) type = 'data'
			    return {
				    data(value) { return DataList.data(value) },
				    list: DataList.list.includes(type),
				    unique: DataList.unique.includes(type),
				    type
			    }
		    }
		
		    static get list() {
			    return ['array', 'list', 'set']
		    }
		
		    static listens(data_list) { return data_list_listeners in data_list }
		
		    static listeners(data_list) {
			    if (!(data_list_listeners in data_list)) data_list[data_list_listeners] = new Map()
			    return data_list[data_list_listeners]
		    }
		
		    static get settable(){
			    return ['listener','onchange']
		    }
		
		    static get unique() {
			    return ['set', 'list', 'json']
		    }
		
		    static get types() {
			    return [
				    'array',
				    'data',
				    'list',
				    'json',
				    'map',
				    'set',
				    'object'
			    ]
		    }
		
		    static value(data_list) {
			    let value = null
			    let data = data_list.data
			    switch (data_list.is.type) {
				    case 'list':
				    case 'set':
					    value = new Set(Array.from(data.values()))
					    break
				    case 'array':
					    value = Array.from(data.values())
					    break
				    case 'data':
				    case 'object':
				    case 'json':
					    value = {}
					    for (let name of data_list.names) value[name] = data.get(name)
					    break
				    case 'map':
					    value = data.value
					    break
			    }
			    return value
		    }
		
		
		
		    constructor(type, data) {
			    this[data_list_info] = DataList.info(type)
			    if (data) this.data = data
		    }
		
		    add(item) {
			    if (this.is.unique && this.index(item) >= 0) return this
			    let name = this.count
			    this.data.set(name, item)
			    return this.changed(name, null, item)
		    }
		
		    at(index) { return Array.from(this.data.values())[index] || null }
		
		    changed(name, old, value) {
			    return this.dispatch({
				    name,
				    old,
				    type: data_list_change,
				    value
			    })
		    }
		
		    get count() { return data_list_value in this ? this.data.size : 0 }
		
		    get data() {
			    if(data_list_value in this) return this[data_list_value].value
			    this[data_list_value] = this[data_list_info].data()
			    return this[data_list_value].value
		    }
		    set data(value) { this[data_list_value] = this[data_list_info].data(value) }
		
		    delete(name) {
			    if (this.empty) return true
			    let old = this.get(name)
			    this.data.delete(name)
			    this.changed(name, old, null)
			    return true
		    }
		
		    drop(item) {
			    if (this.empty) return this
			    let name = this.name(item)
			    if (name) this.delete(name)
			    return this
		    }
		
		    dispatch({ type, name, value, old }) {
			    if (DataList.listens(this)) {
				    let detail = {
					    name, type,
					    item: function get_item() { return this.item(this.name) }.bind(this)
				    }
				
				    if (fxy.is.nothing(value)) detail.value = null
				    if (fxy.is.nothing(old)) detail.old = null
				
				    let listener = this.listener
				    if (listener) {
					    detail.list = this
					    if (type === data_list_change) detail.change = true
					    listener.dispatchEvent(new CustomEvent('data list', { bubbles: true, composed: true, detail }))
				    }
				
				    let action = null
				    if (this.listeners.has(type)) {
					    action = this.listeners.get(type)
					    if (data_list_once in action) this.off(type)
					    action(detail)
				    }
				
				    if (this.listeners.has(name)) {
					    action = this.listeners.get(name)
					    if (data_list_once in action) this.off(name)
					    action(name, old, value)
				    }
				
			    }
			    return this
		    }
		
		    each(...x){ return this.items().forEach(...x) }
		
		    get empty() { return this.count === 0 }
		
		    filter(...x){ return this.items().filter(...x) }
		
		    get(name) { return this.has(name) ? this.data.get(name) : null }
		
		    get_value(){ return this.value }
		
		    has(name) { return !this.empty && this.data.has(name) }
		
		    index(item) { return Array.from(this.data.values()).indexOf(item) }
		
		    get is() { return this[data_list_info] }
		
		    item(name = null, index = null, value) {
			    if (name === null) {
				    if (index === null && !fxy.is.nothing(value)) index = this.index(value)
				    if (index >= 0) name = this.names[index]
			    }
			    if (index === null) {
				    if (!fxy.is.nothing(name)) index = this.names.indexOf(name)
				    if (index === null && !fxy.is.nothing(value)) index = this.index(value)
			    }
			    if (typeof value === 'undefined' && name) value = this.data.get(name)
			    if (typeof value === 'undefined' && fxy.is.number(index) && index >= 0) value = this.at(index)
			
			    return {
				    index,
				    name,
				    value
			    }
			
		    }
		
		    items(){ return data_list_value in this ? Array.from(this.data.values()):[] }
		
		    get listener() {
			    return DataList.listens(this) ? this.listeners.get(data_list_listener) : null
		    }
		    set listener(value) {
			    if (fxy.is.element(value)) this.listeners.set(data_list_listener, value)
		    }
		
		    get listeners(){ return DataList.listeners(this) }
		
		    map(...x){ return this.items().map(...x) }
		
		    name(item) {
			    let index = this.index(item)
			    return index > 0 ? this.names[index] : null
		    }
		
		    get names() { return data_list_value in this ? this[data_list_value].names : [] }
		
		    off(name) {
			    if (DataList.listens(this)) {
				    this.listeners.delete(name)
				    if (this.listeners.size === 0) delete this[data_list_listeners]
			    }
			    return this
		    }
		
		    on(name, action) {
			    if (fxy.is.function(action)) this.listeners.set(name, action)
			    return this
		    }
		
		    once(name, action) {
			    if (fxy.is.function(action)) {
				    action[data_list_once] = true
				    this.listeners.set(name, action)
			    }
			    return this
		    }
		
		    get onchange() {
			    return DataList.listens(this) && this.listeners.has(data_list_change) ? this.listeners.get(data_list_change) : null
		    }
		    set onchange(action) {
			    if (fxy.is.function(action)) this.listeners.set(data_list_change, action)
		    }
		
		    set(name, value) {
			    let old = null
			    if(this.has(name)) old = this.get(name)
			    if (this.is.unique) {
				    let json = (!fxy.is.element(value) && fxy.is.object(value)) ? JSON.stringify(value) : null
				    let matches = Array.from(this.data.values()).filter(item => {
					    if (item === value) return true
					    if (json && fxy.is.object(item) && JSON.stringify(item) === json) {
						    return true
					    }
					    return false
				    })
				    if (matches.length) return this
			    }
			
			    this.data.set(name, value)
			
			    return old !== value ? this.changed(name, old, value) : this
		    }
		
		    sort(...x){ return this.items().sort(...x) }
		
		    table(...headers){
			    let table = document.createElement('table')
			    let data = !this.empty ? this.data:null
			
			    let header = document.createElement('tr')
			
			    let body = document.createElement('tbody')
			    let add_headers = headers.length === 0
			
			    if(data){
				    let names = Array.from(data.keys())
				    for(let name of names){
					    let row = document.createElement('tr')
					    let value = data.get(name)
					    if(add_headers && headers.includes(name) !== true) headers.push(name)
					    let cell = document.createElement('td')
					    cell.innerHTML = value
					    row.appendChild(cell)
					    body.appendChild(row)
				    }
				
				    for(let name of headers){
					    let th = document.createElement('th')
					    th.innerHTML = name
					    header.appendChild(th)
				    }
				
				    let head = document.createElement('thead')
				    head.appendChild(header)
				    table.appendChild(head)
			    }
			    table.appendChild(body)
			    return table
			
		    }
		
		    get value() { return DataList.value(this) }
		
		    toString(){ return JSON.stringify(this.value) }
		
	    }
	
	    function List(data, type) {
		    return new Proxy(new DataList(type, data), {
			    deleteProperty(o, name) { return o.delete(name) },
			    get(o, name) {
				    if(DataList.gettable.includes(name)) return o[name]
				    if(fxy.is.text(name) && name.charAt(0) === '$'){
					    if(name === '$') return o
					    let data_list_name = name.replace('$','')
					    if(data_list_name in o){
						    value = o[data_list_name]
						    if(fxy.is.function(value)) return value.bind(o)
						    return value
					    }
				    }
				    if (o.has(name)) return o.get(name)
				    else if (name in o) {
					    let value = o[name]
					    if(fxy.is.function(value)) return value.bind(o)
				    }
				    if(data_list_identity === name) return o
				    return null
				
			    },
			    has(o, name) { return o.has(name) },
			    set(o, name, value) {
				    if(name in o && DataList.settable.includes(name)){
					    o[name] = value
				    }
				    else o.set(name, value)
				    return true
			    }
		    })
	    }
	
	    List.id = data_list_identity
	
        
        return window.List = List
    
})

