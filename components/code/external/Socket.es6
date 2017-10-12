(function(get_socket){ return get_socket() })
(function(){
    return function export_socket(code,fxy){
	    console.warn('Socket unfinished')
	    return Base => class extends Base{
	    	set_socket(controller){
	    		console.warn('Socket unfinished',{controller})
			    return this
		    }
	    }
	    //shared actions
	    function get_namespace(editor){
		    let symbol = Symbol.for('namespace')
	    	if(!symbol in editor) return editor[symbol]
		    return null
	    }
	    function set_namespace(editor,namespace){
	    	let id = editor.hasAttribute('id') ? editor.getAttribute('id'):`${namespace}-editor`
		    if(!editor.hasAttribute('id')) editor.setAttribute('id',id)
		    editor[Symbol.for('namespace')] = namespace
		    return set_socket(editor)
	    }
	    function get_socket(editor){
		    let symbol = Symbol.for('socket')
		    if(symbol in editor) return editor[symbol]
		    return null
	    }
	
	    function set_socket(editor){
		    
		    let path = editor.getAttribute('socket-path')
		    let namespace = editor.getAttribute('socket-namespace')
		    namespace = fxy.is.text(namespace) ? `/${namespace}` : null
		    if (namespace && path) {
			    //editor.socket = window.io.connect(namespace, {path: editor.ioPath})
			    //editor.emit = function socket_io_emit(name, data) { return this.socket.emit(name, data) }
		    }
		    
		    return editor
	    }
    }
})