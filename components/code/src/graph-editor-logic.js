(function(graph_editor_logic,root){ return graph_editor_logic(root) })
(function(window){
    return (function get_graph_editor_logic(){
    	
	    const graph_editor_logic = {
		    assets:{
			    lib:['codemirror'],
			    "addon/edit/":[
				    "closetag",
				    "matchtags",
				    "closebrackets"
			    ],
			    'addon/fold':[
				    'foldcode',
				    'foldgutter',
				    'brace-fold',
				    'xml-fold',
				    'indent-fold',
				    'comment-fold'
			    ],
			    "addon/hint/":[
				    "show-hint",
				    "javascript-hint"
			    ],
			    'mode/*':[
				    'css',
				    'javascript',
				    'htmlmixed',
				    'xml'
			    ]
		    },
		    current:-1,
		    get folders(){ return Object.keys(this.assets) },
		    graphql_files(){
			    return Promise.all([
				    'code-editor/src/graphql.rules.js',
				    'code-editor/src/graphql.mode.js',
				    'code-editor/src/graphql.helper.js',
				    'code-editor/src/command.mode.js',
				    'code-editor/src/command.rules.js',
				    'code-editor/src/command.keys.js'
			    ].map(file_path=>window.url.elements(file_path)).map( file_url => app.port.eval(app.source.url(file_url))))
		    },
		    load(){
		    	return this.next_folder(()=>{
				    return this.graphql_files().then( x => {
						return new Promise((success,error)=>{
							return Define((app,CodeMirror)=>{
								let Rules = x[0]
								let Mode = x[1]
								let Helper = x[2]
								Mode(CodeMirror,Rules)
								Helper(CodeMirror,Rules)
								let CommandMode = x[3]
								let CommandRule = x[4]
								CommandMode(CodeMirror,CommandRule)
								let CommandKeys = x[5]
								const logic = {
									CodeMirror,
									code:get_code_proxy(CodeMirror),
									Keys:CommandKeys
								}
								return success(logic)
							},'CodeMirror')
						})
				    })
			    })
		    },
		    next_folder(done){
			
			    let current = this.current+1
			    if(current >= this.folders.length) return done()
			    let folder = this.folders[current]
			    let items = this.assets[folder].map( file => this.url(folder,file) )
			
			    return load_next(items[0])
			
			    function load_next(url){
				    return app.port.eval(url)
				              .then( result => {
					              items.splice(0,1)
					              if(items.length) return load_next(items[0])
					              graph_editor_logic.current = current
					              return graph_editor_logic.next_folder(done)
				              })
			    }
			
		    },
		    get path(){
			    return window.url.elements('code-editor/codemirror')
		    },
		    url(folder,name){
			    if(folder.includes('*')) folder = folder.replace('*',name)
			    return app.source.url( this.path, folder, `${name}.js`)
		    }
	    }
	    
	    
	    
	    function get_code_proxy(CodeMirror){
		    
	    	const is = fxy.is
		    const code_mirror = {
			    names:Object.keys(CodeMirror.prototype),
			    get getters(){
				    return this.names.filter(is_getter)
				    function is_getter(name){
					    return name.includes('get') && is.function(CodeMirror.prototype[name]) && CodeMirror.prototype[name].length === 0
				    }
			    },
			    get setters(){
				    return this.names.filter(is_setter)
				    function is_setter(name){
					    return name.includes('set') && is.function(CodeMirror.prototype[name])
				    }
			    }
		    }
		    
		    return function get_code_editor_proxy(coder,editor) {
			    return new Proxy({
				    action: {
					    getters: code_mirror.getters,
					    setters: code_mirror.setters,
					    updates: ['option'],
					    has(name){
						    let real_name = fxy.id.camel(`get_${name}`)
						    let getter = this.getters.filter(x => real_name === x)[0]
						    if (getter) return {getter, name}
						    real_name = fxy.id.camel(`set_${name}`)
						    let setter = this.setters.filter(x => real_name === x)[0]
						    if (setter) return {setter, name}
						    return {}
					    },
					    get({name, getter}){ return editor.mirror[getter]() },
					    set({name, setter}, value){
						    if (!is.array(value)) value = [value]
						    let result = editor.mirror[setter](...value)
						    if (this.updates.includes(name)) coder.update_view(name)
						    return true
					    }
				    }
			    }, {
				    get(o, name){
					    if (name in editor) return editor[name]
					    let has = o.action.has(name)
					    if ('setter' in has || 'getter' in has) return o.action.get(has)
					    else if (name in editor.mirror) return editor.mirror[name]
					    return null
				    },
				    set(o, name, value){
					    let target = null
					    if (name in editor) target = editor
					    else {
						    let has = o.action.has(name)
						    if ('setter' in has) return o.action.set(has, value)
						    else if (name in editor.mirror) target = editor.mirror
					    }
					    if (target) target[name] = value
					    return true
				    },
				    has(o, name){
					    if (name in editor) return true
					    else if (name in editor.mirror) return true
					    let has = o.action.has(name)
					    if ('setter' in has) return true
					    return false
				    }
			    })
		    }
	    }
	    
        return graph_editor_logic.load()
    })()
},window)