wwi.exports('user',(_user)=>{
	class UserSchema extends Map {
		
		constructor(controller) {
			super()
			if (!UserSchema.controller) UserSchema.controller = controller;
			this.library = null;
			this.banks = null;
			this.location = null;
			this.likes = null;
			if (!UserSchema.keys) UserSchema.keys = Object.keys(this);
		}
		
		get controller() {return this.constructor.controller}
		
		get classes() {return this.constructor.classes}
		
		get data() {return this.controller ? this.controller.data : null}
		
		get uid() {return this.controller ? this.controller.uid : null}
		
		get session() {return this.controller ? this.controller.session : {sessionToken: null, needsLogin: true}}
		
		event(key, data) { return new CustomEvent(this.constructor.reference(key), {bubbles: true, detail: data}); }
		
		dispatch(key, data) {
			window.dispatchEvent(this.event(key, data));
			return this;
		}
		
		valueChange(snapshot) {
			let key = snapshot.ref.parent.key;
			if (this.has(key)) {
				this[key] = snapshot.val();
			}
			return this.dispatch(key, this[key]);
		}
		
		get tokens() {
			return {
				fire: this.session.refreshToken,
				uid: this.uid,
				ink: this.get('ink'),
				print: this.get('print')
			};
		}
		
		log() {
			if (!this.uid) return UserSchema.needsLoginPromise()
			return window.UserSchema.post(
				this.constructor.tokenUrl + '/' + UserSchema.controller.uid,
				{
					id: UserSchema.controller.uid,
					date: new Date(),
					profile: this.profile
				});
		}
		
		get values() {
			return UserSchema.keys.filter((key) => {
				return this.has(key)
			})
		}
		
		validate(o) {
			o.user = this.data;
			return this;
		}
		
		connectClass(key) {
			if (!this.data) return this;
			if (this.classes.has(key)) {
				if (!this.has(key)) {
					let Class = this.classes.get(key)
					this.set(key, new Class())
				}
			}
			if (this.has(key)) {
				let prop = this.get(key)
				if (!prop.connected && prop.valid) {
					prop.ref.on('value', this.valueChange.bind(this))
					prop.connected = true;
				}
			}
			return this.get(key);
		}
		
		disconnectClass(key) {
			if (this.has(key)) {
				let prop = this.get(key)
				if (prop.connected) {
					prop.ref.off('value', this.valueChange.bind(this));
					delete prop.connected;
				}
				this.delete(key);
				this[key] = null;
			}
			return this;
		}
		
		connectValues() {
			if (!this.data) return this.values;
			let keys = UserSchema.keys
			keys.forEach((key) => {
				let prop = this.connectClass(key);
				if (prop) {
					if (!prop.valid) prop.user = this.data;
				}
			});
			return this.values;
		}
		
		disconnectValues() {
			let keys = UserSchema.keys
			keys.forEach(this.disconnectClass.bind(this));
			return false;
		}
		
		connect(data) {
			if (data === null) this.connected = this.disconnectValues()
			else this.connected = this.connectValues()
			window.dispatchEvent(new CustomEvent('user.changed', {bubbles: true, detail: this}));
			return this;
		}
	}
	_user.Schema = UserSchema
})