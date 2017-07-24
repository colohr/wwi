(function(get_client){ return get_client() })
(function(){
    return function export_client(Interface){
	
	    //const apollo = Symbol.for('Apollo Client')
	    //const interface_options = Symbol.for('Interface Options')
	    const is = window.fxy.is
	    const network = Symbol.for('Graph Network Interface')
	    //const tagger = Interface.tagger
	
	    class Graph{
		    static get instructions(){ return get_instructions() }
		    //this[interface_options] = new Interface(options.interface)
		    constructor(...options){
			    options = options.length === 1 && is.data(options[0]) ? options[0]:options
			    this.url = get_url(options)
		    }
		    get(value){ return graph_get(this,value)
			    //io = new InOut(io)
			    //return new Promise((resolve,reject)=>{
			    //   if(!io.valid) return reject( new IOError( 'Your graphql "io" is not valid to query. IO.get' ) )
			    //   return this.interface
			    //              .query(io)
			    //              .then( response => { return resolve(response.data) } )
			    //              .catch( error => {
			    //               return reject( new IOError( 'IO.get "io" graphql response error.', error) )
			    //              })
			    //})
		    }
		    get interface(){ return get_interface(this) }
		    get mutation(){ return graph_mutation }
		    get query(){ return graph_query }
		    set(value){ return graph_set(this,value)
			    //io = new InOut( io, true )
			    //return new Promise( (resolve,reject) => {
			    //   if(!io.valid) return reject( new IOError('Your graphql "io" graphql is not valid for a mutation. IO.set') )
			    //   return this.interface
			    //              .mutate( io )
			    //              .then( response => { return resolve( response.data ) } )
			    //              .catch( error => {
			    //               return reject( new IOError( 'IO.set "io" graphql response error.', error ) )
			    //              })
			    //} )
		    }
		    get tag(){ return graph_tag }
	    }
	
	    class GraphError extends Error{
		    constructor(message,error){
			    super(message)
			    this.original = error
			    this.message = `
				${error}\n\n
				-------------------------------------
				💩😡
				${this.message}
				-------------------------------------
				For further assistance see more info @ Graph.instructions.
			`
		    }
	    }
	
	    class GraphInOut{
		    constructor(value,mutation){
			    //if( is_valid_io(value, 'query') || is_valid_io(value, 'mutation')) Object.assign( this, value )
			    if(mutation === true && is_valid_io_text(value)) this.mutation = graph_tag(value)
			    else if(is_valid_io_text(value)) this.query = graph_tag(value)
		    }
		    get valid(){ return 'query' in this || 'mutation' in this }
		    get value(){
		    	if('query' in this) return this.query
				return this.mutation
		    }
		    //prototype
		    toString(){ return `InOut{ ${this.value} }` }
	    }
	    
	    class GraphUrl{
	    	constructor(...x){ this.items = x }
		    get host(){ return get_url_value('host',this.items) }
		    get path(){ return get_url_value('path',this.items) }
		    get port(){ return get_url_value('port',this.items) }
		    //prototype
		    toString(){ return `${this.host}${this.port}${this.path}` }
		    valueOf(){ return this.toString() }
	    }
	    
        //exports
        return Graph
	    
	    //shared actions
	    function get_instructions(){
		    return `
				• Use the query action to create a valid query string/object thing.
				• The gql action/method is the same as tag action/method.
				• Example of IO options:
					⥱ {
						interface:{  //💩 _opts
							// The interface → webpaths means the💩 networkInterface →💩 uri.
							webpaths: ['api','graph','ql']
						}
					  }
				• Example of query object:
					⥱ {
						//Must use tagger/💩 gql
						//IO.tag
						query:IO.tag(\`{
								name
							}\`)
					}
			`
	    }
	
	    function get_interface(graph){
		    if(network in graph) return graph[network]
		    return graph[network] = Interface.client(`${graph.url}`)
	    }
	    
	    function get_url(options){
		    let value = null
		    if(is.array(options)) value = new GraphUrl(...options)
		    else if(is.data(options)) value = new GraphUrl(...get_webpaths(options))
		    else value = new GraphUrl()
		    return value
	    }
	    
	    function get_url_value(type,items){
		    let value = ''
		    switch(type){
			    case 'host':
				    value = get_host(...items)
				    break
			    case 'path':
				    value = get_path(...items)
				    break
			    case 'port':
				    value = get_port(...items)
				    break
		    }
		    return value
		
		    //shared actions
		    function get_host(...parts){
			    let host = parts.filter(part=>window.fxy.is.text(part) && part.includes('http'))[0]
			    if(window.fxy.is.nothing(host)) return get_location()
			    return host
			    //shared actions
			    function get_location(){
				    return `${window.location.protocol}//${window.location.host}${window.location.pathname}`
			    }
		    }
		
		    function get_path(...parts){
			    return parts.filter(part=>window.fxy.is.text(part) && !part.includes('http'))
			                .filter(part=>window.fxy.is.numeric(part) === false)
			                .join('/')
		    }
		
		    function get_port(...parts){
			    let port = parts.filter(part=>window.fxy.is.numeric(part))[0]
			    if(window.fxy.is.nothing(port)) return ''
			    return `:${port}/`
		    }
		
	    }
	
	    function get_webpaths(options){
		    let webpaths = []
		    if(is.data(options)){
			    if('interface' in options && is.data(options.interface)){
				    let face = options.interface
				    if('webpaths' in face && is.array(face.webpaths)) webpaths = face.webpaths
			    }
			    else if('webpaths' in options && is.array(options.webpaths)) webpaths = options.webpaths
		    }
		    else if(is.array(options)) webpaths = options
		    return webpaths
	    }
	    
	    function graph_error(message){ return new GraphError(message) }
	    
	    function graph_get(graph,value){
		    let query = graph_query(value)
		    return new Promise((success,error)=>{
			    if(!query.valid) return error(graph_error('Graph "query" is not valid.'))
			    return graph.interface.query(query)
			                .then(response=>success(response.data))
			                .catch(e=>error(graph_error('Response "query" error.', e)))
		    })
	    }
	
	    function graph_mutation(value){ return new GraphInOut(value,true) }
	
	    function graph_query(value){ return new GraphInOut(value) }
	    
	    function graph_set(graph,value){
	    	let mutation = graph_mutation(value)
		    return new Promise((success,error)=>{
			    if(!mutation.valid) return error(graph_error('Graph "mutation" is not valid.'))
			    return graph.interface.mutate(mutation)
			               .then(response=>success(response.data))
			               .catch(e=>error(graph_error('Response "mutation" error.', e)))
		    })
	    }
	    
	    function graph_tag(value){ return Interface.tagger`${value}` }
	
	    function is_valid_io(value,type){
		    return is.data(value) && type in value && is_valid_io_text(value[type])
	    }
	
	    function is_valid_io_text(value){
		    return typeof value === 'string' && value.includes('{')
	    }
	
	
	    //get interface(){
	    //   if(apollo in this) return this[apollo]
	    //   return this[apollo] = new Interface.Client.Apollo( this[interface_options] )
	    //}
	    //set interface(options_for_interface){
	    //   delete this[apollo]
	    //   if( options_for_interface instanceof GraphInterface ) this[interface_options] = options_for_interface
	    //   else this[interface_options] = new GraphInterface(options_for_interface)
	    //   return this[interface_options]
	    //}
	    //return new Promise( (resolve,reject) => {
	    //   if(!io.valid) return reject( new IOError('Your graphql "io" graphql is not valid for a mutation. IO.set') )
	    //   return this.interface
	    //              .mutate( io )
	    //              .then( response => { return resolve( response.data ) } )
	    //              .catch( error => {
	    //               return reject( new IOError( 'IO.set "io" graphql response error.', error ) )
	    //              })
	    //} )
	    //static valid_object(value,type){
	    //   return typeof value === 'object' &&
	    //    value !== null &&
	    //    type in value &&
	    //    this.valid_string( value[type] )
	    //}
	    //
	    //static valid_string(value){
	    //   return typeof value === 'string' && value.includes('{')
	    //}
	    //class GraphInterface{
	    //
	    //   constructor(options){
	
	    //let batching = 'batching' in options ? options.batching : true
	    //
	    //let host = `${window.location.protocol}//${window.location.host}`
	    //
	    //let web_address = [host].concat(options.webpaths).join('/')
	
	
	    //this.networkInterface = includes.createNetworkInterface({
	    //   uri:web_address,
	    //   transportBatching:batching
	    //})
	
	    //this.queryTransformer = includes.addTypename
	
	    //   }
	    //
	    //
	    //}
    }
})
