(function(get_api){ return get_api() })
(function(){
    return new Promise((success,error)=>{
		let Graph = window.fxy.require('os/Graph')
		if(window.fxy.is.nothing(Graph)) return load_graph().then(success).catch(error)
		return success(Graph)
	})
	
	//shared actions
	function load_graph(){
    	return new Promise((success,error)=>{
		    return load_graph_interface().then(load_graph_client)
		                                 .then(export_graph)
		                                 .then(success)
		                                 .catch(error)
	    })
		//shared actions
		function export_graph(Graph){
			window.fxy.exports('os',os_module=>os_module.Graph = Graph)
			window.fxy.exports('graph',graph=>graph.api = (...x)=>new Graph(...x))
			return Graph
		}
	}
	
	function load_graph_client(Interface){
		return window.app.port
		             .eval(window.url.library('graph','client.es6'))
		             .then(create_client=>create_client(Interface))
	}
	
	function load_graph_interface(){
		return window.app.port.eval(window.url.library('graph','Interface.es6'))
	}
	
})