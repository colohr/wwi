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
	function WebSet(data){
		if(typeof data === 'object' && data !== null) this.data = data;
		else this.data = {};
		Object.defineProperty(this,'size',{
			get:function get_size(){ return this.keys().length; }
		});
		Object.defineProperty(this,'count',{
			get:function get_count(){ return this.keys().length; }
		});
	}
	WebSet.prototype = {
		'delete':function delete_value(name){ delete this[name]; return this; },
		get:function get_value(name){ return this.has(name) ? this.data[name]:null },
		has:function has_value(name){ return typeof this.data[name] !== 'undefined' },
		keys:function get_keys(){ return Object.keys(this.data); },
		set:function set_value(name,value){
			if(typeof value !== "undefined") this.data[name] = value
			return this
		},
		values: function get_values(){
			var values = [];
			for(var name in this.data){ values.push(this.data[name]); }
			return values;
		}
	};
	
	function WebList(data){
		if(typeof data === 'object' && data !== null && Array.isArray(data)) this.data=data;
		else this.data = [];
		Object.defineProperty(this,'size',{
			get:function get_size(){ return this.data.length; }
		});
		Object.defineProperty(this,'count',{
			get:function get_count(){ return this.data.length; }
		});
	}
	WebList.prototype = {
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
	
	//exports
	return function export_design(web){
		function CssDocument(doc){
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
		CssDocument.prototype = Object.create(WebSet.prototype);
		CssDocument.prototype.design = function set_element_css_design(element,name){
			var css = this.css(name);
			if(css) return this.element(element,css);
			return element;
		};
		CssDocument.prototype.element = function set_element_css(element,css){
			if(typeof element === 'object' && element !== null && element.style){
				for(var name in css.data) element.style[name] = css.data[name];
				if(css.add_attribute) element.setAttribute(css.name,'');
			}
			return element;
		};
		CssDocument.prototype.css = function get_css_value(name){
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
		
		return CssDocument
		//shared actions
		function fix_keys(css){
			var keys = css.keys();
			var count = css.count;
			for(var i=0;i<count;i++){
				var key = keys[i];
				var value = css.get(key);
				if(key.includes('--')){
					var name = key.replace('--','');
					css.set(name,value);
					css['delete'](key);
				}
				else if(key.includes('#') || key.includes('.') || key.includes('[') || key.includes(':')){
					css['delete'](key);
				}
			}
			return css;
		}
		function get_selector(selector_text){
			var parts =  selector_text.replace(':host','')
			                          .replace(':root','')
			                          .replace('html','')
			                          .replace(/ /g,'')
			                          .replace(/\n/g,'')
			                          .replace(/\r/g,'')
			                          .replace(/\t/g,'')
			                          .split(',');
			var selector = parts.map(function(n){return n.trim()})
			                    .filter(function(n){return n.length > 0})
			                    .join(',');
			if(selector.length <= 0) return null;
			if(selector.includes('[') && selector.includes(']') && !selector.includes('=')){
				return selector.replace('[','').replace(']','');
			}
			return selector;
		}
		function set_sheet(css,style){
			if(style !== null) {
				var rules = Array.from(style.sheet.rules || style.sheet.cssRules);
				var list = new WebList(rules);
				list.each(function(item){
					var selector = get_selector(item.selectorText);
					var values = get_values(item.style);
					if(selector === null) values.each(function(value){ css.set(value.name,value.value); });
					else css.set(selector,values);
				})
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
			var values = new WebList();
			for(let i=0;i<count;i++){
				let name = declaration.item(i);
				let value = declaration.getPropertyValue(name);
				var data = {};
				data.name = name;
				data.value = value;
				values.add(data);
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