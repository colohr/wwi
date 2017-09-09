window.fxy.exports('dom', (dom, fxy) => {
	
	class Button extends fxy.require('dom/basic_element')() {
		constructor() {
			super({
				opened: true,
				opens: true,
				disabled: true,
				icon: true,
				ripple: true,
				hash:true
			})
		}
		a11y_connected(ally) {
			ally.on('keydown', e => {
				if (e.key.activates) {
					if (this.opens) {
						if (this.opened) this.opened = null
						else this.opened = true
					}
					else if(this.hash) this.go_to_hash()
				}
			})
			ally.on('click', e => {
				if (this.opens) {
					if (this.opened) this.opened = null
					else this.opened = true
				}
				else if(this.hash) this.go_to_hash()
			})
		}
		go_to_hash(){
			if(!this.hash) return;
			window.requestAnimationFrame(()=>window.app.hash=this.hash)
		}
		tricycle({cycle, name, value}, done) {
			switch (cycle) {
				case 'connected':
					if (this.hasAttribute('disabled')) this.aria.disabled = true
					else this.aria.disabled = false
					this.kind = 'button'
					break
				case 'changed':
					let tf = value === true || fxy.is.text(value) ? true : false
					switch (name) {
						case 'disabled':
							if (tf) this.aria.disabled = true
							else this.aria.disabled = false
							break
						case 'ripple':
							if (tf && !this.paper_ripple) this.shadow.appendChild(this.paper_ripple = document.createElement('paper-ripple'))
							else if (!tf && this.paper_ripple) {
								this.paper_ripple.remove()
								delete this.paper_ripple
							}
							break
						case 'icon':
							//console.log({icon:value})
							if (value) {
								this.dataset.icon = value
								get_icon(this)
							}
							break
						case 'act':
							get_action(this, this.act)
							break
						default:
							break
					}
					break
			}
			return done()
		}
	}

	
	//exports
	dom.Button = Button
	
	//shared actions
	function get_icon(button){
		let icon = fxy.require('design/icon')
		let name = button.icon
		let value = icon.get(name)
		if(value) set_icon(value)
		else get_icons().then(icons=>{if(name in icons) set_icon(icons[name])})
		
		function set_icon(icon_value){
			let view = button.query('[button-view]')
			if(view === null) view = button
			let last_icon = view.query('svg[design-icon]') || button.slots.icon.item
			if(last_icon) last_icon.remove()
			view.append(icon_value)
		}
		
		function get_icons(){
			return new Promise((success,error)=>{
				let icons = fxy.require('icons/app')
				if(!icons) return fxy.port.eval(url.component('design/icons/icons.es6')).then(()=>fxy.require('icons/app')).then(success).catch(error)
				return success(icons)
			})
		}
	}
})
