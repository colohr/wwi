(function(get_broadcast){ return get_broadcast() })
(function(){
	    const broadcaster = Symbol('fxy broadcaster')
	    const Cache = new Map()
	    const Watchers = new Map()
	    
	    class Broadcast extends Map{
		
		    constructor(){
			    super()
			    window.Define = (callback, requires) => {
				    if(!is_array(requires)) requires = [requires]
				    return this.create({ callback, is_define:true, requires });
			    }
			    window.on = on_broad(this)
		    }
		
		    check(block) {
			    let count = block.requires.length
			    if (count === 0) return { loaded: true }
			    let mods = this.require( block.requires ).filter( filter_nothingness )
			    if (mods.length < count) return { waiting: true }
			    return { loaded: true, mods }
		    }
		
		    create( block ) {
			
			    let status = this.check( block )
			    if ( status.loaded ) return this.fire( block , block.mods )
			    else block.watcherId = 'watcher-' + Watchers.size
			    if ( !this.has('definites') ) this.set( 'definites', new Set() )
			    this.get('definites').add( block )
			    if ( block.watcherId ) this.set_watcher( block.watcherId )
			    return true
			
		    }
		
		    fire( block , mods ) {
			    let has_mods = Array.isArray(mods) ? true:false
			    mods = has_mods ? mods : this.require( block.requires )
			    if( block.is_define ) mods.unshift( window.app )
			    if('wwi' in window) mods.push( window.wwi )
			    return block.callback(...mods)
		    }
		
		    get_watcher(key) {
			    if (!this.has('definites')) return undefined
			    let defs = this.get('definites')
			    for(let def of defs){
				    if( def.watcherId === key ) return def
			    }
			    return undefined
		    }
		
		    is_required(name){ return 'app' in window && this.requirements.includes(name) && !(name in window) }
		
		    ready( key, value ) {
			    if ( typeof value !== 'undefined' &&
				    value !== null &&
				    !(key in window) ) {
				    window[key] = value
			    }
			    Cache.get('ready').add(key)
			    this.recheck()
			    return window[key]
		    }
		
		    recheck() {
			    if ( this.has('definites') ) {
				    let defs = this.get('definites')
				    for (let def of defs) {
					    if ( waiting_dependents( def.requires ) ) {
						    console.log(def.requires)
					    }
					    else this.check( def )
				    }
				    if ( defs.size === 0 ) this.delete('definites')
			    }
		    }
		
		    //check to see if stuff in cache & window has been set
		    require(list) {
			    let targets = []
			    if (is_array(list)) {
				    for(let name of list){
					    if(this.is_required(name)) this.ready( name, window.app[name] )
					    targets.push(name)
				    }
			    }
			    else return []
			    return targets.map( name => {
				    if(typeof name !== 'string') return null
				    else if ( name.includes('app.')  ) return get_deep_value( {app:window.app}, name )
				    else if ( name in window ) return window[name]
				    else if ( name in document ) return document[name]
				    else return get_deeper_value( window, name )
				    return null
			    })
		    }
		
		    get requirements(){ return get_app_requirements() }
		
		    set_watcher(key){ return set_watcher(this,key) }
		
		
	    }
        
        //exports
	    fxy[broadcaster] = new Broadcast()
	
	    //shared actions
	    function filter_nothingness(v){ return v !== null && v !== undefined }
	    
	    function filter_cached(name){ return Cache.get('ready').has(name) }
	
	    function get_app_requirements(){ return [] }
	    
	    function get_deep_value(...x){ return fxy.deep(...x) }
	
	    function get_deeper_value(...x){ return fxy.deeper(...x) }
	
	    function is_array(...x){ return fxy.is.array(...x) }
	    
	    function on_broad(caster){
		   
		  
		    const uid = fxy.uid.generate()
		
		    const proxy = new Proxy(broadband_waiter,{
			    get(o,name){
				    if(name === 'then'){
					    return function then(callback){
						    o.created = true
						    //caster.create({callback, requires:waits})
						    return Promise.resolve(new Promise(function(success,error){
							    console.log('called resolve:',uid,o.waits)
							    return this
						    }))
					    }
				    }
				    return o
			    },
			    set(o,name,value){
				    console.log(name)
				    if(is_text(name) && is_function(value)){
					    let waits = name.replace(/ /g,',')
					                    .replace(/\|/g,',')
					                    .replace(/\+/g,',')
					                    .replace(/\&/g,',')
					                    .split(',').map(wait=>wait.trim()).filter(wait=>wait.length > 0)
					    broadband_waiter(value,...waits)
				    }
				    return true
			    }
		    })
		
		    //return value
		    return proxy
		    
		    //shared actions
		    function broadband_waiter(value,...waits){
		    	//console.log(value,...waits)
			    caster.create({callback:value, requires:waits})
			    return proxy
		    }
	    }
	
	    function set_watcher(caster,key){
		    let watcher = { key, count: 0 }
		    watcher.clear = function () {
			    if (typeof this.timer === 'number') {
				    window.clearInterval(this.timer);
				    delete this.timer;
			    }
			    return Watchers.delete( this.key )
		    }
		
		    watcher.func = function () {
			    if ( this.count >= 5000 ) {
				    console.group('WATCHER TIMEOUT: '+this.key)
				    console.error(new Error('watcher timeout for : ' + this.key));
				    console.warn(this);
				    console.warn( caster.get_watcher(this.key) )
				    console.groupEnd()
				    return this.clear();
			    }
			    let block = caster.get_watcher( this.key )
			    if (!block) return this.clear()
			    let status = caster.check( block )
			    if ( status.waiting ) return this.count++;
			    this.clear()
			    caster.get('definites').delete(block)
			    return caster.fire( block , status.mods )
		    }
		
		    watcher.start = function () {
			    this.timer = window.setInterval( this.func.bind(this), 300 )
			    return this
		    }
		
		    //return value
		    return Watchers.set( key, watcher.start() )
	    }
	
	    function waiting_dependents(list){
		    if (!list) return false
		    return list.filter(filter_cached).length > 0
	    }
    
})
