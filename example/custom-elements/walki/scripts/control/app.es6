(function(window){
	class Maps{
		constructor(...args){
			this.map = new Map()
		}
		get(key){return this.map.get(key)}
		set(key,value){return this.map.set(key,value)}
		has(key){return this.map.has(key)}
		delete(key){return this.map.delete(key)}
		get size(){return this.map.size}
	}
	const AppView = function(b){
		if(!Array.isArray(b)) b = []
		return [
			{
				properties:{
					id:{type:String,reflectToAttribute:true},
					animating:{type:Boolean,reflectToAttribute:true},
					headerType:String,
					active:{type:Boolean,reflectToAttribute:true,observer:'handleOnView'},
					viewFrame:{type:Object},
					controlsScrolling:{type:Boolean,value:false,reflectToAttribute:true},
					list:{type:String,notify:true},
					renderView:{
						type:Boolean,
						computed:'_computeRenderView(animating,active)'
					}
				},
				handleOnView(active,oldActive){
					if(typeof active === 'boolean' && typeof this.onActive === 'function'){
						this.onActive(active);
					}
				},
				_computeRenderView(animating,active){ return (animating !== true && active === true); },
				attached(){
					this.setAttribute('app-view','');
				}
			}
		
		].concat(b)
	};
	
	class PageModule {
		static get app(){return document.querySelector('#app')}
		static get pages(){return this.app.pages}
		static get views(){
			var pages = this.pages
			if(pages) return pages.items
			return []
		}
		constructor( name , elements ){
			this.name=name;
			this.elements=elements || [];
			this.loaded=false;
			if(this.elements.length === 0) this.elements.push(this.prefix+'-'+this.name);
		}
		get prefix(){return WebRouter.prefix;}
		get main() { return this.elements[0]; }
		get element(){return this.constructor.views.filter((item)=>{ return item.getAttribute('name') === this.name })[0]}
		get view(){
			if(this.element){
				var el = this.element
				if(el.hasAttribute('app-view')) return el
				return el.children.item(0)
			}
			return null
		}
		get active(){return this[Symbol.for('active')]}
		set active(x){
			var el = this.element;
			if(el){
				var view = this.view;
				view.active=true;
				el.active=true;
				if(x){
					view.setAttribute('role','main')
					//view.setAttribute('tabindex','0')
					view.setAttribute('aria-disabled','false')
				}
				else {
					view.removeAttribute('role')
					//view.setAttribute('tabindex','-1')
					view.setAttribute('aria-disabled','true')
				}
			}
			var val = x !== true ? false:true;
			this[Symbol.for('active')] = val;
			if(!this[Symbol.for('active')]) this.hide()
			return this[Symbol.for('active')]
		}
		focus(){
			if(this.element) this.element.focus();
			return this;
		}
		blur(){
			if(this.element) this.element.blur()
			return this
		}
		show(){
			this.element.classList.toggle('show',true)
			return this
		}
		hide(){
			this.element.classList.toggle('show',false)
			return this
		}
		
	}
	
	class WebRouter extends Maps{
		static get isDev(){return true}
		static get config(){
			if(!this[Symbol.for('Config')]){
				this[Symbol.for('Config')] = {
					get pages(){
						return [
							'account',
							'today',
							'banks',
							'license',
							'question-of-the-day',
							'qotd',
							'features',
							'not-found',
							'subscribe',
							'welcome',
							'elements'
						];
					},
					host:window.baseUrl || window.location.protocol+'//'+window.location.hostname,
					path:window.mainPath || this.isDev ? 'main_dev':'main',
					get source_url(){return `${this.host}/${this.path}`},
					get app_url(){return `${this.source_url}/app`},
					get page_url(){ return `pages` },
					get prefix(){
						if(!this[Symbol.for('Prefix')]){
							var el = window.App || window.document.body.querySelector('#app')
							this[Symbol.for('Prefix')] = el ? el.tagName.split('-')[0].toLowerCase():'app'
						}
						return this[Symbol.for('Prefix')]
					}
				}
			}
			return this[Symbol.for('Config')]
		}
		static get pages(){return this.config.pages}
		static get prefix(){return this.config.prefix }
		constructor( element ){
			super();
			this.element=element;
			window.addEventListener('route',this.routeChanged.bind(this))
			window.addEventListener('user.changed',(e)=>{
				if(this.refreshOnLogin){
					delete this.refreshOnLogin
					let hash = window.location.hash
					window.location.hash = 'today'
					window.location.hash = hash
				}
			})
		}
		get config(){ return this.constructor.config;}
		get loading(){return this.element.loading}
		set loading(v){return this.element.loading=v}
		
		
		
		get import(){return window.app.import}
		get pages(){return this.config.pages;}
		get promise(){return window.app.promise}
		get loggedIn(){return 'user' in window && window.user.loggedIn === true}
		pageUrl(name){ return `${this.config.page_url}/${name}.html`; }
		getPage(named){
			if(this.has(named)) return this.get(named);
			let pageModule = new PageModule(named);
			return this.set(named,pageModule).get(named);
		}
		notifyUserRequired(page){
			if(this.loading=true) this.loading=false
			this.refreshOnLogin=true
			let selector = window.app.launcher.selector
			if(selector) window.user.popover.present( window.app.launcher )
			return null
		}
		load(page){
			let valid
			
			function hasValidUser(pg){
				if(pg === 'qotd'){
					if( !('user' in window) || !window.user.loggedIn || !('session' in window.user) || !('expirationTime' in window.user.session) ) return false
					else if( window.user.session.expirationTime >= Date.now() ) return true
					return false
				}
				return true
			}
			if(page === 'qotd' && !('user' in window)){
				Definite((app,u,l)=>{
					return app.el.router.load(page)
				},['user','launcher'])
				return false
			}
			
			
			valid = hasValidUser(page)
			
			if(valid !== true) return this.notifyUserRequired(page)
			
			this.loading=true;
			let pageModule = this.getPage(page);
			if(pageModule.loaded) {
				this.loading=false;
				if(page === 'qotd'){
					if(window.location.hash.includes('/')){
						if(window.KindlePublishing && window.KindlePublishing.QuestionOfTheDay){
							window.KindlePublishing.QuestionOfTheDay.openByHash(window.location.hash)
						}
					}
				}
				return pageModule;
			}
			if(!pageModule.url) pageModule.url = this.pageUrl(pageModule.main);
			return this.import(pageModule.url).then(function(){
				return this.handleImport(pageModule);
			}.bind(this)).catch(this.handleError);
		}
		open(module){
			if(this.currentModule && this.currentModule !== module) this.close(this.currentModule);
			module.opened=true;
			this.currentModule=module;
			return this.element.activateModule(this.currentModule);
		}
		close(module){
			this.lastModule = module
			module.opened=false;
			module.active=false
			return this;
		}
		routeChanged(e){
			let route = e.detail;
			let page = route.page;
			if(!page){
				if(this.loggedIn) page = 'qotd'
				else page = 'today'
			}
			else if(page === 'login') page = 'today'
			if(page){
				let module = this.load(page);
				if(module instanceof PageModule){
					return this.open(module);
				}
			}
			else console.error('Page for routeChanged = '+page);
		}
		handleImport(module){
			module.loaded=true;
			return this.open(module);
		}
		handleError(e){
			console.error(e);
			window.location.hash='not-found'
		}
	}
	
	class SearchFilter{
		constructor( values , terms , all , schema , pushers , keys){
			this.values= values || {};
			this.terms = terms || {}
			this.all=all || {};
			this.schema = schema;
			this.pushers = pushers || {};
			this.keys=keys || null;
		}
		get resultSchema(){return Object.create(this.schema);}
		find(getter){
			var o = [];
			var getters = this.values;
			var has = _.get(getters,getter);
			if(has) o = has;
			return o;
		}
		filter(search){
			var results=this.resultSchema;
			for(var key in search){
				var term = search[key]
				if(typeof term === 'string'){
					results[key] = this.find(term)
				}else if(Array.isArray(term) && typeof term[0] === 'string'){
					results[key] = this.find(term.join('.'))
				}else{
					results[key] = term;
				}
			}
			return results;
		}
		getAll(){
			return this.filter(this.all);
		}
		pushable( value , results ){
			for(var key in this.pushers){
				let pusher = this.pushers[key];
				var push=false;
				if(typeof pusher === 'function'){
					push = this.pushers[key](value)
				}else if(typeof pusher === 'string'){
					push = value.includes(pusher);
				}
				if(push === true){
					for (var skey in results) {
						results[skey].push(key);
						results[skey].push(pusher);
					}
				}
			}
			return results;
		}
		search(value){
			var o = this.resultSchema;
			if(value){
				var _terms = this.terms;
				var _pushed = []
				value = value.trim().toLowerCase()
				o = this.pushable(value,o);
				for(var key in _terms){
					var bank = _terms[key]
					var terms = bank.terms;
					if(!_pushed.includes(key)){
						var matches = terms.filter(function(term){
							if(term.includes(value) || value.includes(term)) return true;
							return false;
						});
						if(matches.length > 0){
							if(this.keys) o[bank[this.keys.key]].push(bank[this.keys.value]);
							_pushed.push(key);
						}
					}
				}
			}
			return o;
		}
	}
	
	window.AppView = AppView;
	window.PageModule = PageModule;
	window.WebRouter = WebRouter;
	window.SearchFilter = SearchFilter;
	
})(window)