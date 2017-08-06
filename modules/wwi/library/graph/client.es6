(function(get_client){ return get_client() })
(function(){
    return function export_client(Interface){
	
	    const network = Symbol.for('Graph Network Interface')
	    
	    class Graph{
		    static get instructions(){ return get_instructions() }
		    constructor(...options){
			    options = options.length === 1 && fxy.is.data(options[0]) ? options[0]:options
			    this.url = get_url(options)
		    }
		    get(value){ return graph_get(this,value) }
		    get interface(){ return get_interface(this) }
		    get mutation(){ return graph_mutation }
		    get query(){ return graph_query }
		    set(value){ return graph_set(this,value) }
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
	    
	    class GraphUrl extends fxy.Url{
	    	constructor(...x){
	    		super(null,window.app.kit.path,...x)
	    	}
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
		    if(fxy.is.array(options)) value = fxy.url(...options)
		    else if(fxy.is.data(options)) value = fxy.url(...get_webpaths(options))
		    else value = new fxy.url()
		    return value
	    }
	
	    function get_webpaths(options){
		    let webpaths = []
		    if(fxy.is.data(options)){
			    if('interface' in options && fxy.is.data(options.interface)){
				    let face = options.interface
				    if('webpaths' in face && fxy.is.array(face.webpaths)) webpaths = face.webpaths
			    }
			    else if('webpaths' in options && fxy.is.array(options.webpaths)) webpaths = options.webpaths
		    }
		    else if(fxy.is.array(options)) webpaths = options
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
		    return fxy.is.data(value) && type in value && is_valid_io_text(value[type])
	    }
	
	    function is_valid_io_text(value){
		    return typeof value === 'string' && value.includes('{')
	    }
    }
})
