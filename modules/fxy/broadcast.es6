(function(get_broadcast){ return get_broadcast() })
(function(){
	    const broadcaster = Symbol('fxy broadcaster')
	    const Watchers = new Map()
	    
	    class Broadcast extends Map{
		
		    constructor(){
			    super()
			    fxy.on = on_broad(this)
			    window.on = fxy.on
		    }
		
		    check(block) {
			    let count = block.requires.length
			    if (count === 0) return { loaded: true }
			    let mods = this.require( block.requires , block.target ).filter( filter_nothingness )
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
			    let has_mods = fxy.is.array(mods)
			    mods = has_mods ? mods : this.require( block.requires )
			    if( block.is_define ) mods.unshift( window.app )
			    if('wwi' in window) mods.push( window.wwi )
			    return block.callback(...mods)
		    }
		
		    get_watcher(key) {
			    if (!this.has('definites')) return null
			    let defs = this.get('definites')
			    for(let def of defs) if( def.watcherId === key ) return def
			    return null
		    }
		
		    //check to see if stuff in cache & window has been set
		    require(list, block_target) {
			    let targets = []
			    if (!fxy.is.array(list)) return targets
			    for(let name of list) targets.push(name)
			    return targets.map( name => {
				    if(typeof name !== 'string') return null
				    if(block_target){
					    let value = fxy.deep( block_target, name )
					    if(!value) value = fxy.deeper(block_target,name)
					    return value
				    }
				    else if ( name.includes('app.')  ) return fxy.deep( {app:window.app}, name )
				    else if ( name in window ) return window[name]
				    else if ( name in document ) return document[name]
				    else return fxy.deeper( window, name )
			    })
		    }
		    
		    set_watcher(key){ return set_watcher(this,key) }
	    }
        
        //exports
	    fxy[broadcaster] = new Broadcast()
	
	    //shared actions
	    function filter_nothingness(v){ return v !== null && v !== undefined }
	    
	    function on_broad(caster){
		    //return value
	    	return new Proxy(broadband_waiter,{
			    get(o,name){
			    	if(fxy.is.text(name)) return get_promise(...get_waits(name))
				    return null
			    },
			    set(o,name,value){
				    if(fxy.is.text(name) && fxy.is.function(value)) o(value,...get_waits(name))
				    return true
			    }
		    })
		    
		    //shared actions
		    function broadband_waiter(value,...waits){
	    		let block = get_block(value,...waits)
			    if(block) return caster.create(block)
			    else return get_promise(...waits.concat([value]))
		    }
		    function get_block(value,...x){
		    	if(typeof value !== 'function') return null
		    	let callback = value
			    let requires = x.filter(wait=>typeof wait === 'string')
			    let block = {callback,requires}
			    if(fxy.is.object(x[0])) block.target = x[0]
			    return block
		    }
		    function get_promise(...requires){
			    return {
				    then(callback){
					    caster.create({callback,requires})
					    return this
				    }
			    }
		    }
		    function get_waits(name){ return name.replace(/ /g,',').replace(/\|/g,',').replace(/\+/g,',').replace(/\&/g,',').split(',').map(wait=>wait.trim()).filter(wait=>wait.length > 0) }
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
			    
			    let definites = caster.get('definites')
			    definites.delete(block)
			    if(definites.size === 0) caster.delete('definites')
			    return caster.fire( block , status.mods )
		    }
		
		    watcher.start = function () {
			    this.timer = window.setInterval( this.func.bind(this), 300 )
			    return this
		    }
		
		    //return value
		    return Watchers.set( key, watcher.start() )
	    }
	
})
