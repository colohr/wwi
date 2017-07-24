wwi.exports('element', (element, fxy) => {
	const detector = Symbol.for('Detector object')
	const watching = Symbol.for('Detector Mutation Observer is active')
	const watching_id = Symbol.for('Detector Mutation Observer timer id')
	const watching_timeout = Symbol.for('Detector Mutation Observer timeout id')
	class Detector {
		static options(...x) { return get_detector_options(...x) }
		
		constructor(detector_element) {
			this.element = detector_element
			this.mutation_observer = new MutationObserver(this.mutation_observer_action.bind(this))
		}
		
		get active() {
			return this.element[watching]
		}
		
		set active(active) {
			if (active && !this.element[watching]) {
				if (!fxy.is.data(active)) {
					active = {target: this.element}
				}
				this.element[watching] = this.start(active)
			}
			else if (this.element[watching] && this.stop()) {
				delete this.element[watching]
			}
			return active
		}
		
		mutation_observer_action(mutations) {
			let detections = new Set(mutations)
			let detection = this.element.detection
			if (!detection) {
				this.active = false
			}
			for (let item of detections) {
				let action = detection.item(get_content(item))
				if (action) {
					console.log({action, from: 'detector'})
				}
			}
			return
		}
		
		remove() {
			if (this.active) this.active = false
			delete this.element[detector]
			return null
		}
		
		restart(target, ...x) {
			return this.active = {target, options: x}
		}
		
		start({target, options}) {
			if ('detection' in this.element) {
				let detection = this.element.detection
				options = fxy.is.array(options) ? options : fxy.is.array(detection.options) ? detection.options : []
				this.mutation_observer.observe(target, Detector.options(...options))
				return true
			}
			throw new Error(`No detection in ${this.element}. Detector stopped.
					--------------------------
					Example:
					get detection() {
						return {
							item(item){
							},
							options: undefined
						}
					}
				`)
		}
		
		stop() {
			//delete this.mutation_observer
			this.mutation_observer.disconnect()
			return true
		}
	}
	//exportation
	element.detector = Base => class extends Base {
		get detector() {
			if (!this[detector]) this[detector] = new Detector(this)
			return this[detector]
		}
	}
	//------------shared actions-----------
	const Contents = {
		symbol: Symbol.for('Detector item contents'),
		get: {
			childList(item){
				let added = new Set(item.addedNodes)
				let child = {
					item,
					text: [],
					values: [],
					get value() { return this.values.length ? this.values[0] : null }
				}
				for (let value of added) {
					let name = value.nodeName.replace('#', '')
					switch (name) {
						case 'text':
							let text = value.nodeValue.trim()
							if (text.length) child.text.push(text)
							break;
						default:
							child.values.push(value)
							break;
					}
				}
				return new Proxy(child, {
					get(o, name){
						if (name in o) return o[name]
						return null
					}
				})
			}
		},
		value(item){
			let type = item.type
			return type in this.get ?
				this.get[type](item) : null
		}
	}
	
	function get_content(item) {
		let type = item.type.replace('List', '')
		let content = {
			type,
			get contents() {
				if (!this[Contents.symbol]) this[Contents.symbol] = Contents.value(item)
				return this[Contents.symbol]
			}
		}
		return content
	}
	
	function get_detector_options(...x) {
		return {
			attributes: x[0] === false ? false : true,
			childList: x[1] || true,
			characterData: x[2] || true
		}
	}
	
	function set_done(detector) {
		if (detector.mutation_observer) {
			detector.active = false
		}
		if (typeof detector[watching_id] === 'number') {
			window.clearInterval(detector[watching_id])
			delete detector[watching_id]
		}
		if (typeof detector[watching_timeout] == 'number') {
			window.clearTimeout(detector[watching_timeout])
			delete detector[watching_timeout]
		}
		detector[watching_timeout] = setTimeout(() => {
			delete detector[watching_timeout]
			detector.active = false
		}, 50)
		return detector
	}
})
//if (!name) name = id
//var el = SlotContent(name, html)
//el.setAttribute('id', id)
//for (let key in attrs) {
//	if (!el.hasAttribute(key)) {
//		el.setAttribute(key, attrs[key])
//	}
//}
//return el





