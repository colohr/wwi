(function (get_css) { return get_css() })
(function () {
	return function () {
		class Css extends Map {
			static values(declaration) {
				let count = declaration.length
				let values = new Set()
				for (let i = 0; i < count; i++) {
					let name = declaration.item(i)
					let value = declaration.getPropertyValue(name)
					values.add({name, value})
				}
				return values
			}
			
			static selector(selector_text) {
				let parts = selector_text.replace(':host', '').replace(':root', '').replace('html', '').replace(/ /g, '').replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '').split(',')
				let selector = parts.map(n => n.trim()).filter(n => {return n.length > 0}).join(',')
				if (selector.length <= 0) return null
				return selector
			}
			
			constructor(doc, ...options) {
				super()
				let style = doc.head.querySelector('style[name="style"]')
				if (style !== null) {
					let rules = Array.from(style.sheet.rules || style.sheet.cssRules)
					let list = new Set(rules)
					for (let item of list) {
						let selector = Css.selector(item.selectorText)
						let values = Css.values(item.style)
						if (selector === null) for (let value of values) this.set(value.name, value.value)
						else this.set(selector, values)
					}
				}
				if (options.length) {
					if (options.includes('disable storage')) this[Symbol.for('disable storage')] = true
					if (options.includes('extend')) {
						let last_option_or_extension = options[options.length - 1]
						if (typeof last_option_or_extension === 'object' && last_option_or_extension !== null) Object.assign(this, last_option_or_extension)
					}
					if (options.includes('regulate')) this.regulate()
				}
			}
			
			regulate() {
				for (let key of this.keys()) {
					if (key.includes('--')) {
						let name = key.replace('--', '')
						this.set(name, this.get(key))
						this.delete(key)
					} else if (key.includes('#') || key.includes('.') || key.includes('[') || key.includes(':')) {
						this.delete(key)
					} else {
						let v = this.get(key)
						if (v.includes('var')) {
							this.delete(key)
						}
					}
				}
				return this
			}
		}
		
		//exports
		return Css
	}
})