class KindleLibrary{
	static get library(){return window.user.library}
	static get data(){return window.user && 'library' in window.user ? window.user.library.value:null}
	static listen(listener){
		let lib = this.library
		if(!lib) return null;
		return lib.attach(listener)
	}
	static unlisten(listener){
		let lib = this.library
		if(!lib) return null;
		return lib.detach(listener)
	}
	constructor(User,BankList){
		this.bankList = BankList
		User.on('library',(e)=>{
			//console.log('user.onlibrary',e)
			let detail = e.detail
			this.data=detail.value;
		});
		this.data = (KindleLibrary.library) ? KindleLibrary.library.value:null
	}
	get app(){return ('App' in window) ? window.App:{}}
	get banks(){return this.bankList.banks}
	get data(){return this.constructor.data}
	set data(x){return this.update(x)}
	get items(){return this.itemList || []}
	set items(x){
		let lastItems = this.itemList
		return this.notify(x,lastItems)
	}
	notify(items,oldItems){
		if(Array.isArray(items)) this.itemList = items
		else this.itemList = []
		this.app.userLibrary = this.itemList
		return items
	}
	update(data){
		if(!data) data = {}
		return this.items = Object.keys(data).map((key)=> this.bankList.get(key));
	}
}