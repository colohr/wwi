(function(get_css_document,window){ return get_css_document(window); })
(function css_document(){
	//exports
	return function export_design(){
		const css_names = [':before',':after','>']
		const css_value = Symbol('css value')
		class CssDocument extends Map{
			constructor(doc){
				super()
				set_sheet(this,get_stylesheet(doc));
			}
			css(element,...names){
				this.remove(element)
				let css = this.style(...names)
				element[css_value] = names
				for(let name in css) element.style[name] = css[name]
				return element
			}
			rekey(...replace){
				let keys = this.keys()
				for(let item of replace){
					for(let key of keys){
						if(key.includes(item)){
							let name = key.replace(item,'')
							this.set(name,this.get(key))
							this.delete(key)
						}
					}
				}
				return this
			}
			remove(element){
				if(css_value in element){
					let names = element[css_value]
					let css = this.style(...names)
					for(let name in css) element.style[name] = ''
				}
				return element
			}
			style(...names){
				let css = {}
				for(let name of names){
					if(this.has(name)){
						let value = this.get(name)
						for(let i in value) css[i] = value[i]
					}
				}
				return css
			}
			value(element,name,value){
				if(typeof value === 'undefined') return element.hasAttribute(name)
				if(value === null) element.removeAttribute(name)
				else if(value === true && !name.includes('aria')) element.setAttribute(name,'')
				else element.setAttribute(name,value)
				return element
			}
		}
		return CssDocument
		//shared actions
		function fix_keys(css){
			for(let key of css.keys()){
				let value = css.get(key)
				if(key.includes('--')){
					let name = key.replace('--','')
					css.set(name,value)
					css['delete'](key)
				}
				else if(skip_key(key)) css['delete'](key)
			}
			return css
		}
		
		function skip_key(key){ return css_names.filter(name=>key.includes(name)).length }
		
		function get_selector(selector_text){
			let selectors = get_selectors(selector_text)
			if(selectors.length <= 0) return null;
			let output = []
			for(let selector of selectors){
				selector = selector.replace(/\[/g,'.').replace(/]/g,'.')
				selector = selector.replace(/"/g,'').replace(/'/g,'').replace(/=/g,'-')
				output.push(selector.split('.').filter(item=>item.length).join('.'))
			}
			return output
		}
		
		function get_selectors(selector){
			return selector.replace(':host','')
			             .replace(':root','')
			             .replace('html','')
			             .replace(/ /g,'')
			             .replace(/\n/g,'')
			             .replace(/\r/g,'')
			             .replace(/\t/g,'')
			             .split(',')
			             .map(function(n){return n.trim()})
			             .filter(function(n){return n.length > 0})
			
		}
		
		function set_sheet(css,style){
			if(style !== null) {
				let rules = Array.from(style.sheet.rules || style.sheet.cssRules)
				for(let item of rules){
					let selectors = get_selector(item.selectorText)
					let values = get_values(item.style)
					if(selectors !== null){
						for(let selector of selectors){
							if(css.has(selector)){
								let item = css.get(selector)
								for(let name in values) item[name] = values[name]
							}
							else css.set(selector,values)
						}
					}
				}
			}
			return fix_keys(css)
		}
		
		function get_stylesheet(doc){
			let style = doc.head.querySelector('style[name="style"]')
			style.name = doc.file.name
			return style
		}
		
		function get_values(declaration){
			let count = declaration.length
			let values = {}
			for(let i=0;i<count;i++){
				let name = declaration.item(i)
				let value = declaration.getPropertyValue(name)
				values[name] = value
			}
			return values
		}
		
	}
},this)