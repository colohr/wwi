(function (graph_editor, root) { return graph_editor(root) })
(function (window) {
	let graph_editor_logic_url = window.url.elements('code-editor/src/graph-editor-logic.js')
	return window.app.port
	             .eval(graph_editor_logic_url)
	             .then(function get_logic({CodeMirror, code, Keys}) {
		             const is = fxy.is
		             class Editor {
			             static get options() {
				             return {
					             value: ``,
					             continueComments: "Enter",
					             mode: {
						             name: "graphql"
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
			             }
			
			             static get window_size() { return [window.innerWidth, document.body.clientHeight] }
			
			             constructor(view) {
				             this.mirror = CodeMirror(view, Editor.options)
			             }
		             }
		             const EditorMix = Base => class extends Base {
			             changed(name, old, value) {
				             switch (name) {
					             case 'theme':
						             this.code.option = ["theme", value]
						             break
					             case 'language':
						             this.code.option = ["mode", value]
						             break
					             case 'ioPath':
					             case 'io-path':
					             case 'ioNamespace':
					             case 'io-namespace':
						             this.io.set(name, value, this)
						             break
					             default:
						             console.log({name, old, value})
						             break
				             }
			             }
			
			             connected() {
				             this.define({
					             language: true,
					             theme: true,
					             ioPath: true,
					             ioNamespace: true
				             })
				             this.code = code(this, new Editor(this.view))
				             this.themes.onchange = event => this.theme = event.currentTarget.value
				             this.query('[languages]').onchange = event => this.language = event.currentTarget.value
				             app.on('resized', _ => this.update_view())
				             if (set_initial_values(this)) {
					             this[Keys.symbol] = new Keys(this)
					             let namespace = fxy.is.text(this.ioNamespace) ? `/${this.ioNamespace}` : null
					             if (namespace) {
						             this.socket = window.io.connect(namespace, {path: this.ioPath})
					             }
				             }
				             this.dispatch('ready')
			             }
			
			             get cursor() { return this.code.getCursor() }
			
			             emit(name, data) {
				             if ('socket' in this) this.socket.emit(name, data)
				             return this
			             }
			
			             update_view(name) {
				             let size = this.size
				             if (this.hasAttribute('lines')) {
					             this.code.size = [size.width, size.height]
				             } else {
					             this.code.size = [size.width - 15, size.height]
				             }
				             this.dispatch('update', name)
			             }
		             }
		             return EditorMix
		             function set_initial_values(editor) {
			             let default_values = {
				             id: editor.id ? editor.id : (editor.hasAttribute('io-namespace') ? `${editor.getAttribute('io-namespace')}-editor` : null),
				             language: null,
				             theme: 'dracula'
			             }
			             for (let key in default_values) {
				             let value = default_values[key]
				             if (editor.hasAttribute(key)) value = editor.getAttribute(key)
				             if (value) {
					             editor[key] = ''
					             switch (key) {
						             case 'theme':
							             setTimeout(_ => editor.theme = value, 500)
							             break;
						             default:
							             editor[key] = value
							             break;
					             }
				             }
			             }
			             return true
		             }
	             })
}, window)