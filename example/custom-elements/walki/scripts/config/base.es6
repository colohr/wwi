(function(root,factory){
    return factory(root)
})(window,function factory(window){
	
	const KindleEmitter = Base => class extends Base{
		get emitters(){
			if(!this[Emitters]) this[Emitters] = new Map()
			return this[Emitters];
		}
		listen(key,listener){
			if(this.has(key)){
				this.get(key).listeners.add(listener);
			}
			return this;
		}
		off(key){
			if(this.emitters.has(key)){
				let emitter = this.emitters.get(key);
				for(let listener of emitter.listeners){
					if(listener instanceof HTMLElement) listener.removeEventListener(listener.key,listener.callback);
				}
				if(emitter.global){
					window.removeEventListener(emitter.key,emitter.callback);
				}
				this.emitters.delete(key);
			}
			return this;
		}
		emit(key,detail){
			if(this.emitters.has(key)){
				if(typeof detail !== 'object') detail = {value:detail}
				let emitter = this.emitters.get(key);
				let event = new CustomEvent(key,{bubbles:true,detail});
				if(emitter.global){
					window.dispatchEvent(event);
				}else{
					for(let listener of emitter.listeners){
						if(listener instanceof HTMLElement){ listener.dispatchEvent(event); }
						else if(typeof listener === 'function'){
							listener(event);
						}else if(typeof listener === 'obect' && listener !== null){
							if(typeof listener.dispatchEvent === 'function'){
								listener.dispatchEvent(event);
							}else if(typeof listener.routeEvent === 'function'){
								listener.routeEvent(event);
							}
						}
					}
				}
				if(typeof emitter.callback === 'function'){
					emitter.callback(event);
				}
			}
			return this;
		}
		on(key,callback,global){
			if(this.emitters.has(key)) this.emitters.off(key);
			this.emitters.set(key,Emitter(key,callback,global));
			return this;
		}
	}
	
	const KindleUserMixin = Base => class extends Base{
		unsetUser(){
			this.list = [];
			let data = this.data;
			if(data && this.uid && typeof data.child === 'function'){
				this.data.child(this.uid).off('value',this.onValue.bind(this));
				delete this.uid;
			}
			return this;
		}
		onValue(ss){
			this.dataValue=ss ? ss.val():null;
			if(this.has && this.has('user')) this.get('user').emit(this.datakey,this.dataValue);
			return true;
		}
		setValue(value){
			let data = this.data;
			if(data && typeof data.child === 'function'){
				if(this.uid) return this.data.child(this.uid).update(value).then(()=>{return this});
			}
			return new Promise((resolve)=>{return resolve({needsLogin:true})})
		}
		setEvent(uid){
			let data = this.data;
			this.uid = uid;
			if(data && typeof data.child === 'function') this.data.child(uid).on('value',this.onValue.bind(this));
			return this;
		}
		setUser(user){
			if(user===null) this.delete('user')
			else this.set('user',user);
			var uid = null
			if(this.has('user')) uid = this.get('user').uid;
			if(typeof uid !== 'string') this.delete('user');
			if(this.uid) this.unsetUser();
			return this.has('user') ? this.setEvent(uid):this;
		}
	}
	
	class KindleLicense extends KindleUserMixin(GlobalDB){
		constructor(user){
			super('license')
			if(typeof user === 'object' && user !== null) this.setUser(user);
		}
	}
	
	class KindleProductOrders extends GlobalDB{
		constructor(user){
			var def;
			if(user !== null) def = [['user',user]]
			super('orders',def)
			if(this.has('user')) this.setUser(this.get('user'));
		}
		getExpires(items){
			var expires = 'Expired'
			items.forEach((item)=>{
				if(expires === 'Expired' && item.expires) expires = item.expires;
			});
			return expires;
		}
		itemList(purchases){
			var items = []
			if(Array.isArray(purchases)){
				items = purchases.map((item)=>{
					if(item && item.order && item.order.items){
						let expires = this.getExpires(item.order.items)
						return {
							title:item.order.items[0].name,
							value:item.order.items.length +' items '+item.order.total,
							detail:item.date+' > '+expires,
							item
						}
					}
				});
			}
			return items;
		}
		unsetUser(){
			this.list = [];
			if(this.uid){
				this.data.child(this.uid).off('value',this.onValue.bind(this));
				delete this.uid;
			}
			return this;
		}
		onValue(ss){
			if(!ss) return null;
			let value = ss ? ss.val():null;
			var list = []
			if(value) list = Object.keys(value).map((key)=>{return value[key]});
			this.list = this.itemList(list);
			this.get('user').emit('orders',this.list);
			return true;
		}
		setEvent(uid){
			this.uid = uid;
			this.data.child(uid).on('value',this.onValue.bind(this));
			return this;
		}
		setUser(user){
			if(user===null) this.delete('user')
			else this.set('user',user);
			var uid = null;
			if(this.has('user')) uid = this.get('user').uid;
			if(typeof uid !== 'string') this.delete('user');
			if(this.uid) this.unsetUser();
			return this.has('user') ? this.setEvent(uid):this;
		}
	}
	
	
	
	const KindleLicenseProperty = Prototype => {
		if(!Prototype.KindleProductOrders) {
			Prototype.KindleProductOrders = new KindleProductOrders(Prototype.user);
			Prototype.setUser = function(user){
				if(!user.emitters.has('orders')){
					user.on('orders',function(e){
						let Items = e.detail;
						var best = null
						Items.forEach((value)=>{
							let items = value && value.item && value.item.order && value.item.order.items ? value.item.order.items:[];
							if(items.length){
								items.forEach((item)=>{
									if(item.type === 'user' && item.expiration){
										let license = {
											value,
											item,
											get type(){return this.item && this.item.type ? this.item.type:'trial'},
											get today(){return new Date()},
											get expires(){ return this.item && this.item.expiration ? new Date(this.item.expiration):this.today; },
											get expired(){return this.today >= this.expires},
											toJSON(){
												let o = {today:this.today,type:this.type,expires:this.expires,expired:this.expired}
												for(var key in o){
													if(typeof o[key] === 'undefined') delete o[key];
												}
												return o;
											}
										}
										if(!best) best = license;
										if(best && best.expired && !license.expired) best = license;
									}
								})
							}
						});
						if(best) best.value.license = true;
						user.emit('active-license',best || {
								get today(){return new Date()},
								get type(){return 'trial'},
								get expires(){ return this.today; },
								get expired(){return true},
								toJSON(){ return {today:this.today,type:this.type,expires:this.expires,expired:this.expired} }
							});
						this.items = Items;
						
						
					}.bind(this));
					
				}
				return this.KindleProductOrders.setUser(user);
			};
		}
		return Prototype
	}
	
	
	window.KindleEmitter = KindleEmitter;
	window.KindleUserMixin = KindleUserMixin;
	window.KindleProductOrders = KindleProductOrders;
	window.KindleLicense = KindleLicense;
	window.KindleLicenseProperty = KindleLicenseProperty;
	
    return;
})