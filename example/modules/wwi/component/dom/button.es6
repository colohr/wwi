wwi.exports('dom', (dom, fxy) => {
	const Timers = new WeakMap()
	const Basic = fxy.require('dom/basics')
	class Button extends Basic.Element {
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
							console.log({icon:value})
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
	Basic.Button = Button
	
	//-------------shared actions-------------
	function get_icon(button){
		let icon = fxy.require('design/icon')
		let name = button.icon
		let value = icon.get(name)
		if(value) set_icon(value)
		else get_icons().then(icons=>{if(name in icons) set_icon(icons[name])})
		
		function set_icon(icon_value){
			let view = button.query('[button-view]')
			if(view === null) view = button
			let last_icon = view.query('svg[design-icon]')
			if(last_icon) last_icon.remove()
			view.append(icon_value)
		}
		
		function get_icons(){
			return new Promise((success,error)=>{
				let icons = fxy.require('icons/app')
				if(!icons) return window.app.port.eval(url.component('design/icons/icons.es6')).then(()=>fxy.require('icons/app')).then(success).catch(error)
				return success(icons)
			})
		}
		//if ('va11y' in wwi) {
		//	wwi.va11y.repo.icon[button.icon].then(icon => {
		//		if (icon !== null) button.view.append(icon)
		//		delete button.dataset.icon
		//	})
		//}
	}
})



//Button.prototype.addEventListener = function (type, fn, capture) {
//	let events = this.memory.getset('acts-events')
//
//	events.set(type, function eventListener(e) {
//		if (this.memory.has('acts')) {
//			let acts = this.memory.get('acts')
//			if (acts.has(e.type)) acts.get(e.type)(e)
//		}
//		return fn(e)
//	})
//	return EventTarget.prototype.addEventListener.call(this, type, events.get(type), capture)
//}
//
//Button.prototype.removeEventListener = function (type, fn, capture) {
//	if (this.memory.has('acts-events')) {
//		let events = this.memory.get('acts-events')
//		if (events.has(type)) {
//			return EventTarget.prototype.removeEventListener.call(this, type, events.get(type), capture)
//		}
//	}
//	return EventTarget.prototype.removeEventListener.call(this, type, fn, capture)
//}

	//function set_timer({type, act, e, has}) {
	//	if (!Timers.has(e)) Timers.set(e, new Map())
	//	let timers = Timers.get(e)
	//	if (timers.has(type)) {
	//		let timer_value = timers.get(type)
	//		timer_value.count = timer_value.count + 1
	//		if (timer_value.count >= 50) {
	//			window.clearInterval(timer_value.timer)
	//			return timers.delete(type)
	//		}
	//		if (timers.size === 0) Timers.delete(e)
	//		else timers.set(type, timer_value)
	//		return undefined
	//	}
	//	let timer = window.setInterval(function () { return get_action(this.e, this.act) }.bind({e, act}), 900)
	//	return timers.set(type, {timer, count: 0})
	//}
	//
	//function remove_timer({type, act, e, has}) {
	//	if (Timers.has(e)) {
	//		let timers = Timers.get(e)
	//		if (timers.has(type)) {
	//			window.clearInterval(timers.get(type).timer)
	//			timers.delete(type)
	//		}
	//		if (timers.size === 0) Timers.delete(e)
	//	}
	//	return undefined
	//}
	//
	//function get_action(e, act) {
	//	let done = get_act(e, act)
	//	if (done.has) return remove_timer(done)
	//	return set_timer(done)
	//}
	//
	//function get_act(e, trigger_event) {
	//	var trigger_target = null
	//	let triggers = trigger_event.split(':')
	//	let trigger = triggers.length === 2 ? triggers[1] : null
	//	let type = triggers[0]
	//	var has = false
	//	if (type && trigger) {
	//		let action = find_action(e)
	//		if (typeof action === 'function') {
	//			//console.log(trigger_target)
	//			let acts = e.memory.getset('acts')
	//			acts.set(type, action.bind(trigger_target))
	//			has = true
	//		}
	//	}
	//	return {type, act: trigger_event, e, has}
	//	function find_action(t) {
	//		if (typeof t === 'object' && t !== null) {
	//			var has = check_element(t)
	//			var p = t.parentElement
	//			if (fxy.is.object(p)) {
	//				has = check_element(p)
	//				if (!has && p.offsetParent) has = check_element(p.offsetParent)
	//			}
	//			if (!has && t.offsetParent) p = t.offsetParent
	//			if (fxy.is.object(p)) {
	//				has = check_element(p)
	//				if (!has && p.offsetParent) has = check_element(p.offsetParent)
	//			}
	//			if (!has) return find_action(get_parent(t))
	//			else return has
	//		}
	//		return null
	//	}
	//
	//	function check_element(t) {
	//		if (_.has(t, trigger)) {
	//			trigger_target = t
	//			return _.get(t, trigger)
	//		} else if ('constructor' in t && _.has(t.constructor.prototype, trigger)) {
	//			trigger_target = t
	//			return _.get(t.constructor.prototype, trigger)
	//		}
	//		return null
	//	}
	//
	//	function get_parent(t) {
	//		return t.parentElement !== null ? t.parentElement : t.offsetParent
	//	}
	//}
