wwi.exports('code',(code,fxy)=>{

	
	const Editor = Base => class extends Base{
		get code(){ return code.logic(this) }
		connected(bar){
			window.app.on('resized',size =>this.resize('resized',size))
			this.define('routes',{
				ioNamespace(value){ return code.id(this,value) },
				ioPath(value){ return code.socket(this) }
			})
			if(!this.language) this.language = 'javascript'
			if(!this.theme) this.theme = 'dracula'
			if(bar){
				bar.themes.onchange = event => this.theme = event.currentTarget.value
				bar.languages.onchange = event => this.language = event.currentTarget.value
				bar.languages.value = this.language
				bar.themes.value = this.theme
			}
			
		}
		resize(name,detail){
			if(!this.isConnected) return
			this.style.opacity=0
			this.style.transition = 'none'
			let size = this.size
			if (this.hasAttribute('lines')) this.code.size = [size.width, size.height]
			else this.code.size = [size.width, size.height]
			this.dispatch('update', name)
			
			if('timer' in this) window.clearTimeout(this.timer)
			window.requestAnimationFrame(()=>{
				this.style.transition = 'opacity 1000ms ease'
				this.timer = setTimeout(()=>{
					this.style.opacity=1
					delete this.timer
				},300)
			})
		}
		get value(){return this.code.getValue()}
		set value(text){ return this.code.setValue(text)}
	}
	
	
	
	code.Editor = Editor
	
	
	
	
})

//(function (graph_editor, root) { return graph_editor(root) })
//(function (window) {
//	let graph_editor_logic_url = window.url.elements('code-editor/src/graph-editor-logic.js')
//	return window.app.port
//	             .eval(graph_editor_logic_url)
//	             .then(function get_logic({CodeMirror, code, Keys}) {
//		             const is = fxy.is
//		             class Editor {
//			             static get options() {
//				             return {
//					             value: ``,
//					             continueComments: "Enter",
//					             mode: {
//						             name: "graphql"
//					             },
//					             extraKeys: {
//						             ['Ctrl-Q'](cm){
//							             cm.foldCode(cm.getCursor())
//						             },
//						             "Ctrl-Space": "autocomplete",
//						             "Ctrl-J": "toMatchingTag"
//					             },
//					             lineNumbers: true,
//					             foldGutter: true,
//					             lineWrapping: true,
//					             autoCloseTags: true,
//					             autoCloseBrackets: true,
//					             matchTags: {bothTags: true},
//					             gutters: [
//						             "CodeMirror-linenumbers",
//						             "CodeMirror-foldgutter"
//					             ]
//				             }
//			             }
//
//			             static get window_size() { return [window.innerWidth, document.body.clientHeight] }
//
//			             constructor(view) {
//				             this.mirror = CodeMirror(view, Editor.options)
//			             }
//		             }
//		             const EditorMix = Base => class extends Base {
//
//		             }
//		             return EditorMix
//		             function set_initial_values(editor) {
//			             let default_values = {
//				             id: editor.id ? editor.id : (editor.hasAttribute('io-namespace') ? `${editor.getAttribute('io-namespace')}-editor` : null),
//				             language: null,
//				             theme: 'dracula'
//			             }
//			             for (let key in default_values) {
//				             let value = default_values[key]
//				             if (editor.hasAttribute(key)) value = editor.getAttribute(key)
//				             if (value) {
//					             editor[key] = ''
//					             switch (key) {
//						             case 'theme':
//							             setTimeout(_ => editor.theme = value, 500)
//							             break;
//						             default:
//							             editor[key] = value
//							             break;
//					             }
//				             }
//			             }
//			             return true
//		             }
//	             })
//}, window)