(function(get_css_document,window){ return get_css_document(window); })
(function css_document(window){
	var not_attributes = [
		'.',
		'#',
		'=',
		'--',
		':',
		','
	];
	function OldWebSet(data){
		if(typeof data === 'object' && data !== null) this.data = data;
		else this.data = {};
		Object.defineProperty(this,'size',{
			get:function get_size(){ return this.keys().length; }
		});
		Object.defineProperty(this,'count',{
			get:function get_count(){ return this.keys().length; }
		});
	}
	OldWebSet.prototype = {
		'delete':function delete_value(name){ delete this[name]; return this; },
		get:function get_value(name){ return this.has(name) ? this.data[name]:null },
		has:function has_value(name){ return typeof this.data[name] !== 'undefined' },
		keys:function get_keys(){ return Object.keys(this.data); },
		set:function set_value(name,value){
			if(typeof value !== "undefined") {
				console.group('name',name)
				let current = this.data[name]
				if(current){
					let data = value.data
					console.log(current,data)
					//for(let item of data){
					//	for(let i of current.data){
					//		if(i.name !== item.name){
					//			current.add(item)
					//		}
					//	}
					//}
				}
				else this.data[name] = value
				console.groupEnd()
			}
			return this
		},
		values: function get_values(){
			var values = [];
			for(var name in this.data){ values.push(this.data[name]); }
			return values;
		}
	};
	function OldWebList(data){
		if(typeof data === 'object' && data !== null && Array.isArray(data)) this.data=data;
		else this.data = [];
		Object.defineProperty(this,'size',{
			get:function get_size(){ return this.data.length; }
		});
		Object.defineProperty(this,'count',{
			get:function get_count(){ return this.data.length; }
		});
	}
	OldWebList.prototype = {
		add:function add_value(value){
			if(this.has(value) !== true) this.data.push(value)
			return this
		},
		'delete':function delete_value(value){
			if(!this.has(value)) return this;
			var new_values = [];
			var count = this.data.length;
			for(var i=0;i<count;i++){
				var item = this.data[i];
				if(value !== item) new_values.push(item);
			}
			this.data = new_values;
			return this;
		},
		each:function each_item(callback){
			var count = this.count;
			callback = callback.bind(this);
			for(var i=0;i<count;i++){
				var item = this.data[i];
				callback(item,i);
			}
			return this;
		},
		index:function index_of(value){return this.data.indexOf(value) },
		has:function has_value(value){ return this.index(value) >= 0; },
		values: function get_values(){ return this.data; }
	};
	
	class WebSet extends Map{
		constructor(data){
			if(typeof data === 'object') data = Object.keys(data).map(name=>[name,data[name]])
			super(data || [])
		}
		get count(){ return this.size }
	}
	
	
	
	
	class WebList extends Set{
		constructor(data){
			super(data || [])
		}
		get count(){ return this.size }
		each(action){
			let count = this.count
			let values = Array.from(this)
			for(let i=0;i<count;i++){
				let item = values[i]
				action(item,i)
			}
			return this
		}
		index(value){
			return Array.from(this.values()).indexOf(value)
		}
	}
	
	//exports
	return function export_design(web){
		
		function OldCssDocument(doc){
			this.data = {};
			Object.defineProperty(this,'size',{
				get:function get_size(){ return this.keys().length; }
			});
			Object.defineProperty(this,'count',{
				get:function get_count(){ return this.keys().length; }
			});
			var style = get_stylesheet(doc);
			set_sheet(this,style);
		}
		OldCssDocument.prototype = Object.create(WebSet.prototype);
		
		
		OldCssDocument.prototype.design = function set_element_css_design(element,name){
			var css = this.css(name);
			if(css) return this.element(element,css);
			return element;
		};
		OldCssDocument.prototype.element = function set_element_css(element,css){
			if(typeof element === 'object' && element !== null && element.style){
				for(var name in css.data) element.style[name] = css.data[name];
				if(css.add_attribute) element.setAttribute(css.name,'');
			}
			return element;
		};
		OldCssDocument.prototype.css = function get_css_value(name){
			var data = {};
			if(this.has(name)){
				var value = this.get(name);
				if(typeof value === "string"){
					data[name] = value;
					return data;
				}
				else if(typeof value === 'object' && value !== null && value instanceof WebList){
					value.each(function(item){ data[item.name] = item.value; });
				}
			}
			var css_value = {};
			css_value.data = data;
			css_value.name = name;
			css_value.add_attribute = is_attribute_name(name);
			return css_value;
		};
		
		class CssDocument extends Map{
			constructor(doc){
				super()
				set_sheet(this,get_stylesheet(doc));
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
			css(element,...names){
				let css = this.value(...names)
				Object.assign(element.style,css)
				return element
			}
			value(...names){
				let css = {}
				for(let name of names){
					if(this.has(name)){
						let value = this.get(name)
						for(let i in value) css[i] = value[i]
					}
				}
				return css
			}
		}
		
		return CssDocument
		//shared actions
		function fix_keys(css){
			for(let key of css.keys()){
				var value = css.get(key);
				if(key.includes('--')){
					var name = key.replace('--','');
					css.set(name,value);
					css['delete'](key);
				}
				else if(key.includes(':before') || key.includes(':after') || key.includes('>')){
					css['delete'](key);
				}
			}
			return css;
		}
		function get_selector(selector_text){
			var selectors = get_selectors(selector_text)
			if(selectors.length <= 0) return null;
			var output = []
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
				var rules = Array.from(style.sheet.rules || style.sheet.cssRules);
				for(let item of rules){
					let selectors = get_selector(item.selectorText);
					let values = get_values(item.style);
					if(selectors !== null){
						for(let selector of selectors){
							if(css.has(selector)){
								let item = css.get(selector)
								for(let name in values){
									item[name] = values[name]
								}
							}
							else css.set(selector,values)
						}
					}
				}
			}
			return fix_keys(css);
		}
		function get_stylesheet(doc){
			var style = doc.head.querySelector('style[name="style"]');
			style.name = doc.file.name;
			return style;
		}
		function get_values(declaration){
			var count = declaration.length;
			let values = {}
			for(let i=0;i<count;i++){
				let name = declaration.item(i);
				let value = declaration.getPropertyValue(name);
				//var data = {};
				//data.name = name;
				//data.value = value;
				values[name] = value
			}
			return values
		}
		function is_attribute_name(name){
			if(typeof name === 'string'){
				var count = not_attributes.length;
				for(var i=0;i<count;i++){
					var value = not_attributes[i];
					if(name.indexOf(value) >= 0) return false;
				}
				return true;
			}
			return false;
		}
	}
	
	
},this)