(function (create_editor, export_logic, set_logic) { return export_logic(set_logic, create_editor) })
(function create_editor({Code, Mirror}) {
	
	//exports
	return wwi.exports('code', (code => {
		
		const logic_code = Symbol('logic_code')
		class Logic {
			static get window_size() { return [window.innerWidth, document.body.clientHeight] }
			constructor(...x) {
				this.mirror = Mirror.View(...x)
			}
		}
		
		code.symbol = logic_code
		
		code.logic = (editor)=>{
			if(logic_code in editor) return editor[logic_code]
			editor[logic_code] = Code(editor, new Logic(editor.view))
			editor[Mirror.Keys.symbol] = new Mirror.Keys(editor)
			return editor[logic_code]
		}
		
		code.socket = set_socket
		code.id = set_editor_id
		
		
		function set_editor_id(editor,namespace){
			if(!editor.id && namespace) editor.id =  `${namespace}-editor`
			return set_socket(editor)
		}
		
		function set_socket(editor){
			if(!('socket' in editor) && 'io' in window){
				let path = editor.ioPath
				let namespace = fxy.is.text(editor.ioNamespace) ? `/${editor.ioNamespace}` : null
				if (namespace && path) {
					editor.socket = window.io.connect(namespace, {path: editor.ioPath})
					editor.emit = function socket_io_emit(name, data) { return this.socket.emit(name, data) }
				}
			}
			return editor
		}
		
		
	}))
	
},function export_logic(set_logic, create_editor) {
	let current = -1
	const source = window.app.source
	const port = window.app.port
	const url = window.url.elements
	const code_path = url('code/codemirror')
	const assets = {
		lib: ['codemirror'],
		"addon/edit/": [
			"closetag",
			"matchtags",
			"closebrackets"
		],
		'addon/fold': [
			'foldcode',
			'foldgutter',
			'brace-fold',
			'xml-fold',
			'indent-fold',
			'comment-fold'
		],
		"addon/hint/": [
			"show-hint",
			"javascript-hint"
		],
		'mode/*': [
			'css',
			'javascript',
			'htmlmixed',
			'xml'
		]
	}
	
	const folders = Object.keys(assets)
	
	return load_logic().then(set_logic).then(create_editor)
	
	
	//shared actions
	function load_logic(){ return load_next_folder(()=>get_control_sources()) }
	
	function get_control_sources(){
			return Promise.all([
				'code/control/source/graphql.rules.js',
				'code/control/source/graphql.mode.js',
				'code/control/source/graphql.helper.js',
				'code/control/source/command.mode.js',
				'code/control/source/command.rules.js',
				'code/control/source/command.keys.js'
			].map(file_path => url(file_path))
			 .map(file_url => port.eval(source.url(file_url))))
	}
	
	function load_next_folder(done){
		current = current + 1
		if (current >= folders.length) return done()
		const folder = folders[current]
		const items = assets[folder].map(file => path(folder, file))
		
		return load_next(items[0])
		
		//shared actions
		function load_next(url) {
			return port.eval(url).then(loaded)
			//shared actions
			function loaded(){
				items.splice(0, 1)
				if (items.length) return load_next(items[0])
				return load_next_folder(done)
			}
		}
		
		function path(folder, name) {
			if (folder.includes('*')) folder = folder.replace('*', name)
			return source.url(code_path, folder, `${name}.js`)
		}
	}
	
}, function set_logic(x) {
	const Rules = x[0]
	const Mode = x[1]
	const Helper = x[2]
	const CommandMode = x[3]
	const CommandRule = x[4]
	const Keys = x[5]
	const Options = {
		value: ``,
		continueComments: "Enter",
		mode: {
			name: "javascript"
		},
		extraKeys: {
			['Ctrl-Q'](cm){
				cm.foldCode(cm.getCursor())
			},
			"Ctrl-Space": "autocomplete",
			"Ctrl-J": "toMatchingTag"
		},
		lineNumbers: true,
		foldGutter: true,
		lineWrapping: true,
		autoCloseTags: true,
		autoCloseBrackets: true,
		matchTags: {bothTags: true},
		gutters: [
			"CodeMirror-linenumbers",
			"CodeMirror-foldgutter"
		]
	}
	
	
	//promise
	return new Promise((success, error) => {
		return Define((app, CodeMirror) => {
			
			Mode(CodeMirror, Rules)
			Helper(CodeMirror, Rules)
			CommandMode(CodeMirror, CommandRule)
			return success({
				Code: get_code_proxy(CodeMirror),
				Mirror: {
					Keys,
					View(view, options){ return CodeMirror(view, options || Options) }
				}
			})
		}, 'CodeMirror')
	})
	
	
	//shared actions
	function get_code_proxy(CodeMirror) {
		const is = window.fxy.is
		const code_mirror = {
			names: Object.keys(CodeMirror.prototype),
			get getters() {
				return this.names.filter(is_getter)
				function is_getter(name) {
					return name.includes('get') && is.function(CodeMirror.prototype[name]) && CodeMirror.prototype[name].length === 0
				}
			},
			get setters() {
				return this.names.filter(is_setter)
				function is_setter(name) {
					return name.includes('set') && is.function(CodeMirror.prototype[name])
				}
			}
		}
		
		//Code value
		return function get_code_editor_proxy(coder, editor) {
			return new Proxy({
				action: {
					getters: code_mirror.getters,
					setters: code_mirror.setters,
					updates: ['option'],
					has(name){
						let real_name = window.fxy.id.camel(`get_${name}`)
						let getter = this.getters.filter(x => real_name === x)[0]
						if (getter) return {getter, name}
						real_name = window.fxy.id.camel(`set_${name}`)
						let setter = this.setters.filter(x => real_name === x)[0]
						if (setter) return {setter, name}
						return {}
					},
					get({name, getter}){ return editor.mirror[getter]() },
					set({name, setter}, value){
						if (!is.array(value)) value = [value]
						let result = editor.mirror[setter](...value)
						if (this.updates.includes(name)) coder.resize(name)
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
	
	
	
})