(function(get_id){ return get_id() })
(function(){
    //return function export_id(fxy){
	
	    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	    const numbers = '0123456789'
	    
	    class ID extends String{
		    static generate(count = 5) {
			    let id = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
			    let all = numbers+alphabet
			    for (let i = 0; i < count-1; i++) id += all.charAt(Math.floor(Math.random() * all.length))
			    return id
		    }
		    static generate_uid() {
			    function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);}
			    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		    }
		    static get_uid(object){
			    if(!is_object(object)) return null
			    let symbol = fxy.symbols.uid
			    if(is_object(object) && symbol in object) return object[symbol]
			    let prefix
			    let index
			    if('uid_prefix' in object) prefix = object.uid_prefix
			    else if('uid-prefix' in object) prefix = object['uid-prefix']
			    else if(is_element(object) && object.hasAttribute('uid-prefix')) prefix = object.getAttribute('uid-prefix')
			    if('uid_index' in object) index = object.uid_index
			    else if('uid-index' in object) index = object['uid-index']
			    else if(is_element(object) && object.hasAttribute('uid-index')) index = object.getAttribute('uid-index')
			    return object[symbol] = new ID(prefix,index).attribute(object)
		    }
		    static get Mix(){
			    return Base => class extends Base{
				    get fxy_uid(){ return ID.get_uid(this) }
				    get uid(){ return ID.get_uid(this).valueOf() }
				    set uid(value){
				    	let symbol = fxy.symbols.uid
					    if(value instanceof ID) this[symbol] = value.attribute(this)
					    else if(is_numeric(value)) this[symbol] = new ID(null,value).attribute(this)
					    else if(fxy.is.text(value)) this[symbol] = new ID(value).attribute(this)
					    return this[symbol]
				    }
			    }
		    }
		    constructor(prefix,index){
			    let id = ID.generate()
			    super(id)
			    prefix = is_text(prefix) ? prefix:null
			    index = is_numeric(index) ? get_numeral(index).value:null
			    this.context = {
				    id,
				    index,
				    prefix
			    }
		    }
		    attribute(element){
			    if(is_element(element)){
				    let prefix = this.prefix
				    let index = this.index
				    if(prefix) element.setAttribute('uid-prefix',prefix)
				    else element.removeAttribute('uid-prefix')
				    if(index) element.setAttribute('uid-index',index)
				    else element.removeAttribute('uid-index')
				    element.setAttribute('uid',this.valueOf())
			    }
			    return this
		    }
		    get id(){ return this.context.id }
		    get index(){ return this.context.index !== null ? this.context.index:''}
		    set index(value){
			    value = is_numeric(value) ? get_numeral(value).value:null
			    if(value) return this.context.index = value
			    return this.context.index
		    }
		    get prefix(){ return this.context.prefix !== null ? this.context.prefix+'':'' }
		    set prefix(value){
			    value = is_text(value) ? value:null
			    if(value) return this.context.prefix = value
			    return this.context.prefix
		    }
		    get values(){
			    let index = this.index
			    let prefix = this.prefix
			    let values = []
			    if(prefix) values.push(prefix)
			    values.push(this.context.id)
			    if(index) values.push(index)
			    return values
		    }
		    valueOf(){ return this.values.join('-') }
		    toString(){ return this.valueOf() }
	    }
        
        //return value
	    fxy.uid = get_uid()
        //return fxy
	
	    //shared actions
	    function get_numeral(...x){ return fxy.numeral(...x) }
	    function get_uid(){
		    return new Proxy(ID,{
			    get(o,name){
				    if(name in o) return o[name]
				    if(name === 'UID' || name === 'ID') return ID
				    if(fxy.is.numeric(name)) return new ID(null,name)
				    if(fxy.is.text(name)) return new ID(name)
				    return null
			    }
		    })
	    }
	
	    function is_element(...x){ return fxy.is.element(...x) }
	    function is_numeric(...x){ return fxy.is.numeric(...x) }
	    function is_object(...x){ return fxy.is.object(...x) }
	    function is_text(...x){ return fxy.is.text(...x) }
    //}
})