(function (root, factory) { return factory(root) }(this, function (window) {
	
	const touch = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0
	const vendors =  {
		chrome:{prefix:'webkit',vendor:'WebKit'},
		edge:{prefix:'ms',vendor:'MS'},
		firefox:{prefix:'moz',vendor:'Moz'},
		ie:{prefix:'ms',vendor:'MS'},
		opera:{prefix:'webkit',vendor:'WebKit'},
		safari:{prefix:'webkit',vendor:'WebKit'},
		other:{prefix:'webkit',vendor:'WebKit'}
	}
	
	class ClientError extends TypeError{
		constructor(msg,info){
			super(msg)
			this.info = info;
		}
	}
	
	class Browser{
		constructor(){
			this.start_time = Date.now()
			this.info = get_web_browser(this.agent)
		}
		get agent(){return window.navigator.userAgent}
		get cookie(){
			return {
				get enabled(){return window.navigator.cookieEnabled},
				get value(){return this.enabled ? window.document.cookie:''},
				get list(){return decodeURIComponent(this.value.split(';'))}
			}
		}
		get cookies(){return this.cookie.list}
		get compatability(){return get_compatability()}
		get desktop(){return this.type === 'desktop'}
		get dont_track(){return window.navigator.doNotTrack}
		get geolocation(){return get_geolocation()}
		get history(){return get_history()}
		get id(){return this.name ? this.name.toLowerCase():'other'}
		get java(){return window.navigator.javaEnabled()}
		get key(){return '-'+this.prefix+'-'}
		get language(){return window.navigator.language}
		get mobile(){return this.type === 'mobile'}
		get name(){return this.info.name}
		get online(){return window.navigator.onLine}
		get offline(){return !this.online}
		get plugins(){return window.navigator.plugins}
		get prefix(){return get_prefix(this.id);}
		get scripts(){return window.document.scripts}
		get storage(){return get_storage()}
		get stylesheets(){return window.document.styleSheets}
		get touch(){return touch}
		get type(){return this.info.type}
		get vendor(){return get_vendor(this.id)}
		vendor_info(...x){ return get_vendor_info(this,...x) }
		get version(){return this.info.version}
	}
	
    //exports
    return window.fxy.browser = new Browser()
	
	//shared actions
	function get_compatability(){
		const beacon = 'sendBeacon' in navigator
		const bluetooth = 'bluetooth' in navigator
		const custom_elements = 'customElements' in window
		const fetch = 'fetch' in window && !('polyfill' in window.fetch)
		const link_import = 'import' in document.createElement('link')
		const midi = 'requestMIDIAccess' in navigator
		const modules = modules_supported()
		const promise = 'Promise' in window
		const proxy = 'Proxy' in window
		const push = 'ServiceWorkerRegistration' in window && 'pushManager' in ServiceWorkerRegistration.prototype
		const registrations = 'ServiceWorkerRegistration' in window
		const register_element = 'registerElement' in document
		const rtc = 'RTCPeerConnection' in window
		const service_worker = 'serviceWorker' in navigator
		const shadow_dom = !!HTMLElement.prototype.attachShadow
		const template =  'content' in document.createElement('template')
		
		return test_compatability({
			beacon,
			bluetooth,
			custom_elements,
			fetch,
			link_import,
			midi,
			modules,
			promise,
			proxy,
			push,
			registrations,
			register_element,
			rtc,
			service_worker,
			shadow_dom,
			template,
			web_components:template && shadow_dom && custom_elements && link_import
		})
		
		
		function modules_supported(){
			try{ return !( eval(`(()=>{try{ return typeof import('./hello.js') }catch(e){ return e }})()`) instanceof Error )
			}catch(e){ return false }
		}
		
		function passive_events(compatability){
			try {
				let opts = Object.defineProperty({}, 'passive', {
					get: function() {
						compatability.passive_events = true
					}
				})
				window.addEventListener("test", null, opts);
			}
			catch (e) {
				compatability.passive_events = false
			}
			return compatability
			// Use our detect's results. passive applied if supported, capture will be false either way.
			//elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);
		}
		
		function test_compatability(compatability){
			return passive_events(compatability)
		}
	}
	function get_geolocation(){
		return {
			get enabled(){return 'geolocation' in window.navigator},
			get has(){return typeof this.id === 'number'},
			clear(){
				if(this.has) window.navigator.clearWatch(this.id)
				delete this.id
				return this
			},
			watch(cb,ops){
				return new Promise((res,rej)=>{
					if(!this.enabled) return rej(new ClientError('geolocation not enabled'))
					if(typeof cb === 'function') this.watcher = cb
					if(this.watcher) {
						this.clear().id = window.navigator.geolocation.watchPosition((...args)=>{
							return this.watcher(...args)
						},rej,ops)
					}
					return resolve(this)
				})
			},
			position(ops){
				return new Promise((res,rej)=>{
					if(!this.enabled) return rej(new ClientError('geolocation not enabled'))
					return window.navigator.getCurrentPosition(res,rej,ops)
				})
			}
		}
	}
	function get_history(){
		return {
			get length(){return window.history.length},
			get state(){return window.history.state},
			push(a,b,c){return window.history.pushState(a,b,c)},
			replace(a,b,c){return window.history.pushState(a,b,c)},
			off(){
				if(this.listener) {
					window.removeEventListener('popstate',this.listener,false)
					delete this.listener
				}
				return this
			},
			on(cb){
				if(typeof cb === 'function'){
					this.off().listener = cb
					window.addEventListener('popstate',this.listener,false)
				}
				return this;
			}
		}
	}
	function get_prefix(id){
		if(!id) return vendors.other.prefix
		else if(id in vendors) return vendors[id].prefix
		return vendors.other.prefix
	}
	function get_storage(){
		let memory = 'localStorage' in window ? window.localStorage:null
		return {
			enabled:memory !== null,
			data(text){
				let value = null
				if(typeof text === 'string'){
					try{ value = JSON.parse(text) }
					catch(e){ console.error(e) }
				}
				return value
			},
			delete(key){
				if(this.enabled) memory.removeItem(key)
				return this
			},
			get(key){
				if(this.enabled) return this.data(memory.getItem(key))
				return null
			},
			set(key,value){
				if(this.enabled){
					value = this.text(value)
					if(value===null) this.delete(key)
					else memory.setItem(key,value)
				}
				return this
			},
			text(data){
				if(typeof data === 'object' && data !== null){
					try{ data = JSON.stringify(data) }
					catch(e){
						console.error(e)
						data = null
					}
				}
				return data
			},
			get updates(){return window.navigator.getStorageUpdates() }
		}
	}
	function get_vendor(id){
		if(!id) return vendors.other.vendor
		else if(id in vendors) return vendors[id].vendor
		return vendors.other.vendor
	}
	function get_vendor_info(browser,object,target){
		if(typeof target !== 'string') target = null
		if(object){
			if(target && target in object) {
				return { target, supported:true, key:target, value:object[target] };
			}
			let pf = browser.prefix
			let vendor = browser.vendor
			
			if(target){
				let output
				let ckey = window._.camelCase(pf+'-'+target)
				if(ckey in object) output = { target,prefix:true, key:ckey, value:object[ckey] }
				if(!output) ckey = window._.camelCase(vendor+'-'+target)
				if(!output && ckey in object) output = { target,vendor:true, key:ckey, value:object[ckey] }
				if(!output) output = {target,key:target}
				if(typeof output.value === 'function') output.value.bind(object)
				return output
			}else{
				let ls = []
				for(let key in object){
					if(typeof key === 'string'){
						if(key.includes(pf)) ls.push({key,prefix:true,value:object[key]})
						if(key.includes(vendor)) ls.push({key,vendor:true,value:object[key]})
					}
				}
				return ls.map((t)=>{
					if(typeof t.value === 'function') t.value.bind(object)
					return t
				})
			}
		}
		return null
	}
	function get_web_browser(userAgent){
			let ua = userAgent
			let tem = null
			let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
			let type='desktop'
			let name = null
		
			if(/trident/i.test(M[1])){
				tem =  /\brv[ :]+(\d+)/g.exec(ua) || []
				name = 'IE '+(tem[1] || '')
			}
			
			if(M[1]=== 'Chrome'){
				tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
				if(tem !== null) name = tem.slice(1).join(' ').replace('OPR', 'Opera')
			}
			
			M = M[2]? [M[1], M[2], M[0]]:M
			
			if(!M.length){
				M = ua.match(/(bot|crawler(?=\/))\/?\s*(\d+)/i) || []
				if(M.length) type='bot'
			}
			else{
				if( (tem = ua.match(/version\/(\d+)/i) ) !== null) M.splice(1, 1, tem[1])
				let mobile = ua.match(/(mobile|phone|mobi|android|tablet)\/?\s*(\d+)/i) || []
				if(mobile.length) type='mobile'
				else{
					let bot = ua.match(/(bot|crawler(?=\/))\/?\s*(\d+)/i) || [];
					if(bot.length) type='bot'
				}
			}
			
			//return value
			return {
				name:name === null ? M[0]:name,
				version:isNaN(M[1]) ? 0:parseFloat(M[1]),
				type,
				base:M.length >= 2 && type !== 'bot' ? M[2]:userAgent
			}
	}
	
}))
