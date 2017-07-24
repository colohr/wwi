(function(root,factory){
    return factory(root)
})(window,function factory(window){
	var FirebaseConfig = window.FirebaseConfig || {
			apiKey: "AIzaSyBrQumigUwuzmYKI1jlVWR0YxBtNCGzZAc",
			authDomain: "kindle-sparks.firebaseapp.com",
			databaseURL: "https://kindle-sparks.firebaseio.com",
			storageBucket: "kindle-sparks.appspot.com",
			messagingSenderId: "339098789228"
		};
	var ApplicationConfig=Object.freeze({
		main:Object.freeze({
			host:`${window.location.protocol}//${window.location.host}`,
			name:'kindle-sparks',
			path:'',
			prefix:'kindle',
			get selector(){return this.name},
			resources:['bower_components','modules','components','web-components'],
			get bower_components(){return  `${this.host}/${this.path}/bower_components/`},
			get ['web-components'](){return  `${this.host}/web-components/`}
		}),
		apiName:'kpi',
		get apiHeaders(){
			return {'Kindle-Token':window.user.token}
		},
		tokenUrl:'/user/token',
		loginUrl:'/user/login',
		selectors:{
			get launcher(){return 'body > app-launcher'}
		}
	});
	
	class KPFirebase extends Map {
		constructor(defs) { super(Array.isArray(defs) ? defs : []) }
		
		get firebase() {return window.firebase}
		
		get app() {return this.firebase.app()}
		
		get db() {return this.firebase.database()}
	}
	
	class KPDB extends KPFirebase {
		constructor(name, defs) {
			super(defs)
			this.datakey = name;
		}
		
		get data() { return this.db.ref(this.datakey); }
	}
	
	window.KPFirebase = KPFirebase;
	window.GlobalDB = KPDB;
	
	window.ApplicationCofig = ApplicationConfig;
    return firebase.initializeApp(FirebaseConfig);
})