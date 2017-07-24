class FirebaseControl{
	constructor(dataType){
		this.dataType=dataType || '/'
	}
	get firebase(){
		return {
			get app(){return window.firebase.app();},
			get auth(){return window.firebase.auth();},
			get database(){return this.app.database();},
			get currentUser(){return this.auth.currentUser;}
		};
	}
	get app(){return this.firebase.app}
	get auth(){return this.firebase.auth;}
	get db(){
		if(!this.database) this.database = this.firebase.database.ref(this.dataType);
		return this.database;
	}
	logout(){ return this.auth.signOut(); }
	
}