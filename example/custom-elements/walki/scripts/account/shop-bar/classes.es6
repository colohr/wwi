(function(root,factory){
    return factory(root)
})(window,function factory(window){
	
	
	const KPDB = window.GlobalDB;

	
	class KPBundle {
		constructor(user) {
			this.items = [];
			this.user = user;
		}
		
		clear() {
			this.items = []
			return this;
		}
		
		getTotal() {
			var price = 0;
			this.items.forEach((item) => {
				price += item.price;
			})
			return price;
		}
		
		get total() {return this.getTotal()}
		
		remove(index) {
			return this.items.splice(index, 1)
		}
		
		json() {
			return {
				items: this.items,
				total: this.total
			}
		}
	}
	
	
	class KPShopper extends KPDB {
		constructor(user) {
			super('shopper/' + user.uid)
			this.updateUser(user);
		}
		
		get userId() {return this.bundle.user.uid}
		
		get user() {return this.bundle.user.json()}
		
		get email() {return this.bundle && this.bundle.user.email ? this.bundle.user.email : null}
		
		get order() {return this.bundle.json()}
		
		get loggedIn() {return typeof this.userId === 'string'}
		
		updateUser(user) {
			this.bundle = new KPBundle(user)
			this.date = Date.now()
			return this;
		}
		
		payload(payload) {
			return {
				payload,
				user: this.user,
				order: this.order,
				date: this.date
			}
		}
	}
	
	
	window.KPShopper = KPShopper;
	window.KPBundle = KPBundle;
	
    return;
})
