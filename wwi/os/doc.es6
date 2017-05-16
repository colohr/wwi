(function(root, factory){ return factory(root) })
(this,function finder_out(window){
	const not = {
		dom:{
			tags:['SCRIPT','BODY','HTML','DOCUMENT','HEAD','LINK','META','STYLE']
		}
	}
	const content = {
		type:{
			'xml':'application/xml',
			'svg':'image/svg+xml',
			'html':'text/html',
			'js':'application/javascript',
			'es6':'application/javascript',
			'json':'application/json',
			'css':'text/html'
		}
	}
	
	class Css extends Map{
		static values(declaration){
			let count = declaration.length
			let values = new Set()
			for(let i=0;i<count;i++){
				let name = declaration.item(i)
				let value = declaration.getPropertyValue(name)
				values.add({name,value})
			}
			return values
		}
		static selector(selector_text){
			let parts =  selector_text.replace(':host','').replace(':root','').replace('html','')
			                     .replace(/ /g,'').replace(/\n/g,'').replace(/\r/g,'').replace(/\t/g,'')
			                     .split(',')
			let selector = parts.map(n=>n.trim()).filter(n=>{return n.length > 0}).join(',')
			if(selector.length <= 0) return null
			return selector
		}
		constructor(doc){
			super()
			let style = doc.head.querySelector('#style')
			if(style !== null) {
				let list = new Set(style.sheet.rules || style.sheet.cssRules)
				for(let item of list){
					let selector = Css.selector(item.selectorText)
					let values = Css.values(item.style)
					if(selector === null) for(let value of values) this.set(value.name,value.value)
					else this.set(selector,values)
				}
			}
		}
		regulate(){
			for(let key of this.keys()){
				if(key.includes('--')){
					let name = key.replace('--','')
					this.set(name,this.get(key))
					this.delete(key)
				}else if(key.includes('#') || key.includes('.') || key.includes('[') || key.includes(':')){
					this.delete(key)
				}else{
					let v = this.get(key)
					if(v.includes('var')){
						this.delete(key)
					}
				}
			}
			return this
		}
	}
	
	const Parse = {
		create(){return new DOMParser()},
		parse(string,doctype){
			let parser = this.create()
			let type = doctype in content.type ? content.type[doctype]:doctype
			return parser.parseFromString(string, type)
		},
		css(string){
			let doc = Parse.parse(`<style id="style">${string}</style>`,'css');
			return new Css(doc)
		},
		xml(string){ return Parse.parse(string,'xml'); },
		doc(string){ return Parse.parse(string,'html'); },
		svg(string){ return Parse.parse(string,'svg'); },
		dom(string){
			return new Proxy({
				_origin:string,
				doc:Parse.doc(string),
			},{
				get(o,key){
					switch(key){
						case 'dom':
							return o.doc.body.querySelector(':first-child')
							break;
						case 'doms':
							return Array.from(o.doc.querySelectorAll('*')).filter((item)=>{
								return !(TagNames.notDom.includes(item.tagName))
							})
							break;
						case 'all':
							return Array.from(o.doc.querySelectorAll('*'))
							break;
						case 'template':
							return o.doc.querySelector('template')
							break;
						case 'templates':
							return Array.from(o.doc.querySelectorAll('template'))
							break;
						case 'polymer':
							return Array.from(o.doc.querySelectorAll('dom-module'))
							break;
						default:
							if(key in o) return o[key]
							else if(key in o.doc) return o.doc[key]
							break;
					}
					return null
				}
			})
		},
		json(string){return JSON.parse(string)},
		exports(string){
			let output = {}
			try{output.module = eval(string);}
			catch(e){output.error = e}
			return output
		},
		get(url){
			let type = window.app.source.identity(url).type
			return fetch(url).then(res=>res.text()).then(string=>{
				if(type in Parse) return Parse[type](string)
				return Parse.parse(string,type)
			})
		}
	}
	return Parse
})