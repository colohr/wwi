(function(get_dom_parser,export_parser,window){ return get_dom_parser(export_parser,window) })
(function get_dom_parser(export_parser,window){
	var DOMParser = window.DOMParser;
	var proto = DOMParser.prototype, nativeParse = proto.parseFromString;
	try {
		// WebKit returns null on unsupported types
		if (!(new DOMParser()).parseFromString("", "text/html")) {
			proto.parseFromString = function(markup, type) {
				if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
					var doc = document.implementation.createHTMLDocument("")
					if (markup.toLowerCase().indexOf('<!doctype') > -1) doc.documentElement.innerHTML = markup
					else doc.body.innerHTML = markup
					return doc
				}
				else return nativeParse.apply(this, arguments)
			}
		}
	}
	catch (ex) { console.error(ex); }

	const content = {
		parse:get_dom_parser,
		Parsers:{
			css:null,
			design:null
		},
		types:{
			'css':'text/html',
			'html':'text/html',
			'json':'application/json',
			'svg':'image/svg+xml',
			'xml':'application/xml'
		}
	}
	
	//exports
	return export_parser(content,window)
	//shared actions
	function get_dom_parser(file,...options){
		let parser_type = options.includes('design') ? 'design':file.type
		return new Promise((success,error)=>{
			if(parser_type in content.Parsers){
				return get_parser_class(parser_type).then(Parser=>success(new Parser(get_parser(file),...options))).catch(error)
			}
			return success(get_parser(file))
		})
	}
	function get_parser(file){
		let text = file.type === 'css' ? `<style name="style">${file.content.trim()}</style>`:file.content
		let parser = new DOMParser()
		let doc_type = file.type in content.types ? content.types[file.type]:type
		let doc = parser.parseFromString(text, doc_type)
		doc.file = file
		return doc
	}
	function get_parser_class(name){
		return new Promise((success,error)=>{
			if(content.Parsers[name] !== null) return success(content.Parsers[name])
			let parser_url = window.url.modules('fxy/logic/parse',name+'.js')
			return window.fxy.port.eval(parser_url).then(get_parser=>success(content[name] = get_parser(content))).catch(error)
		})
		
	}
},function export_parser(content,window){
	const data_name = Symbol.for('data name')
	return {
		content(file,...options){
			return content.parse(file,...options).then(result=>{
				if(result instanceof Object && !options.includes('disable storage')){
					result[data_name] = file.name
				}
				return result
			})
		},
		fetch(fetch_url,...options){
			let file = get_info({url:fetch_url})
			return get_file_content(file).then(text=>{
				file.content=text
				return content.parse(file,...options).then(result=>{
					if(result instanceof Object && !options.includes('disable storage')){
						result[data_name] = file.name
					}
					return result
				})
				
			})
		}
	}
	
	//shared actions
	function get_file_content(file){ return window.fetch(file.url).then(res=>res.text()) }
	function get_info(file){
		if('name' in file && 'type' in file) return file
		let identity = window.fxy.file.identity(window.fxy.file.file(file.url))
		file.name = identity.name.replace(`.${identity.type}`,'')
		file.type = identity.type
		file.identity = identity
		return file
	}
	
},this)