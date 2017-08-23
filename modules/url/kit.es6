(function(get_kit,window){ return get_kit(window) })
(function(window){
	return function(base_data) {
		class BaseKit {
			constructor(base) {
				this.base = base
			}
			get dir() { return window.fxy.file.dir(this.selfie.getAttribute('src')) }
			get edus() { return this.has('edus') }
			get (name) { return this.selfie.getAttribute(name) }
			has(name) { return this.selfie.hasAttribute(name) }
			get host() { return window.fxy.file.host }
			get modules(){ return this.base.modules }
			get path() { return this.get('path') || this.dir }
			remove(name) { return this.selfie.removeAttribute(name) }
			get selfie(){ return this.base.element }
			set (name, value) { return this.selfie.setAttribute(name, value) }
			url(...x) {
				x.unshift(this.dir);
				return window.fxy.file.url(...x)
			}
		}
		
		//exports
		return get_kit()
		
		//shared actions
		function create_kit() {
			let head = window.document.head
			let base = get_base()
			if (base === null) {
				base = window.document.createElement('base')
				base.href = window.location.origin
				base.setAttribute('url-kit', '')
				let before = get_before_target()
				if (before !== null) head.insertBefore(base, before)
				else head.appendChild(base)
			}
			//return value
			return base
			
			//shared actions
			function get_base() { return window.document.head.querySelector('base') }
			
			function get_before_target() {
				let target = null
				let scripts = Array.from(head.querySelectorAll('script'))
				if (scripts.length) target = scripts[0]
				if (target === null) {
					let links = Array.from(head.querySelectorAll('link'))
					if (links.length) target = links[0]
				}
				if (target === null) {
					let metas = Array.from(head.querySelectorAll('meta'))
					if (metas.length) {
						let last = metas[metas.length - 1]
						if (last.nextElementSibling) target = last.nextElementSibling
					}
				}
				if (target === null) {
					let title = head.querySelector('title')
					if (title !== null && title.nextElementSibling) target = title.nextElementSibling
				}
				return target
			}
		}
		
		function get_kit() {
			if(typeof base_data === 'object' && base_data !== null) return window.kit = new BaseKit(base_data)
			else if ('kit' in window) return window.kit
			else if ('app' in window && 'kit' in window.app) return window.app.kit
			return window.kit = kit_proxy(find_kit())
			
			//shared actions
			function get_element_control(proxy, element) {
				if (element instanceof HTMLElement) {
					return {
						get: function kit_get(name) {return element.getAttribute(name)},
						has: function kit_has(name) { return typeof name !== 'string' ? false : element.hasAttribute(name) },
						remove: function kit_remove(name) {
							if (typeof name === 'string') element.removeAttribute(name)
							return proxy
						},
						set: function kit_set(name, value) {
							if (typeof name === 'string') {
								if (value === true) value = ''
								else if (value === false) value = null
								if (value === null) element.removeAttribute(name)
								else element.setAttribute(name, value)
							}
							return proxy
						}
					}
				}
				else if (typeof element === 'object' && element !== null && 'has' in element && 'get' in element && 'set' in element && 'remove' in element) {
					return element
				}
				return null
			}
			
			function find_kit() {
				let head = window.document.head
				let kit = head.querySelector('url-kit')
				if (kit !== null) return kit
				return create_kit()
			}
			
			function kit_proxy(element) {
				if (typeof element !== 'object' || element === null) throw new Error(`url kit is not a valid object`)
				return new Proxy(element, {
					deleteProperty(o, name) {
						let control = get_element_control(this, o)
						if (control) control.remove(name)
						return true
					},
					get (o, name) {
						let value = null
						if (name in o) value = o[name]
						if (typeof value === 'function') value = value.bind(o)
						if (value !== null) return value
						let control = get_element_control(this, o)
						if (name in control) value = control[name]
						if (typeof value === 'function') value = value.bind(control)
						return value
					},
					set (o, name, value) {
						let control = get_element_control(this, o)
						if (control) control.set(name, value)
						return true
					},
					has(o, name) {
						let control = get_element_control(this, o)
						if (control) return control.has(name)
						return false
					}
				})
			}
		}
	}
},this)