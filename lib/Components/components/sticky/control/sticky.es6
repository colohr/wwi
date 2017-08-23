wwi.exports('sticky',(sticky,fxy)=>{
	const timer = Symbol.for('sticky list timer')
	const objects = Symbol.for('objects')
	//const Group = Symbol.for('group')
	const header_map = Symbol.for('header map')
	const controller = Symbol.for('sticky list controller')
	//const Sorts = Symbol.for('list-o sorts')
	const initialized = Symbol('sticky list controller is initialized')
	//const ItemTemplate = Symbol.for('itemTemplate')
	const is_header = Symbol('is header element')
	const item_data = Symbol('list item data')
	//const Selector =
	const Items = fxy.require('sticky/Selector')
	
	
	const validNames = ['name', 'title', 'key', 'username', 'email', 'displayName', 'text', 'itemKey', 'subject', 'core', 'type', 'id', 'uid', 'index']
	
	const AlphabeticalSort = (array, key) => {
		if (!Array.isArray(array)) return []
		return array.sort((A, B) => {
			var a, b;
			if (key in A) a = A[key]
			if (key in B) b = B[key]
			if (a && b) {
				if (a > b) return 1
				else if (a < b) return -1
			}
			return 0
		})
	}
	
	const Header = {
		get map() {
			if (header_map in this) return this[header_map]
			return this[header_map] = new WeakMap()
		},
		is(header){ return (header instanceof HTMLElement && header[is_header] === true) },
		data(header){
			if (this.is(header)) {
				if (this.map.has(header)) return this.map.get(header)
				let data = {
					map: new Map(),
					get(key){return this.map.get(key)},
					has(key){return this.map.has(key)},
					set(key, value){return this.map.set(key, value)},
					get group() {return this.map.get('group')},
					get collapsed() {return this.group.getAttribute('aria-hidden') === 'true'},
					set collapsed(collapsed) {
						return this.group.setAttribute('aria-hidden', collapsed)
					},
					get position() {
						return this.get('original position')
					},
					get height() { return this.get('original height') }
				}
				data.set('original position', parseInt(header.dataset.originalPosition))
				data.set('original height', parseInt(header.dataset.originalHeight))
				return this.map.set(header, data).get(header)
			}
			return null
		}
	};
	
	const Sorts = new Map([
		['abc', AlphabeticalSort],
		['zyx', (array, key) => {return AlphabeticalSort(array, key).reverse()}]
	])
	
	
	class Objects extends Set {
		//static Controller(listo) { return new ListOfObjectsController(listo) }
		
		static nameKey(item) {
			let keys = Object.keys(item)
			let list = keys.filter((key) => { return validNames.includes(key) })
			               .map((key) => {return validNames.indexOf(key)})
			               .sort()
			return list.map((i) => {return validNames[i]})
		}
		
		constructor(...items) { super(items) }
		
		get sorts() { return Sorts }
		
		sort(type, key) {
			let sort = this.sorts.has(type) ? this.sorts.get(type) : Sorts.get('abc')
			let array = Array.from(this)
			if (typeof key === 'undefined') {
				let keys = this.constructor.nameKey(array[0])
				if (keys.length) key = keys[0]
			}
			var list = array
			if (typeof sort === 'function') list = sort(array, key)
			return {list, key, type}
		}
		
		group(sorted) {
			let groups = new Map()
			let key = sorted.key
			sorted.list.forEach((item, index) => {
				let v = item[key]
				if (!('i' in item)) item.i = index
				if (typeof v === 'string') {
					v = v.trim().toLowerCase()
					let c = v.charAt(0)
					if (!groups.has(c)) groups.set(c, new Set())
					groups.get(c).add(item)
				}
			})
			return groups
		}
	}
	
	class StickyScrollController {
		constructor(list) {
			this.list = list
			let last_scroll_top = 0
			let ticking = false
			let timeout = null
			let callback = this.on_scroll_callback.bind(this)
			
			function timeout_scroll() {
				list.removeAttribute('scrolling')
				timeout = null
			}
			
			function on_scroll(last_scroll_top, callback) { callback(last_scroll_top) }
			
			this.on_scroll = function (e) {
				if (!this.initialized) return
				if (typeof timeout === 'number') {
					window.clearTimeout(timeout)
					timeout = null
				}
				last_scroll_top = list.scrollTop
				if (!ticking) {
					window.requestAnimationFrame(function () {
						if (!list.hasAttribute('scrolling')) list.setAttribute('scrolling', '')
						on_scroll(last_scroll_top, callback)
						ticking = false
						timeout = window.setTimeout(timeout_scroll, 100)
					});
				}
				ticking = true
			}
			
			this.update_scroll = function(new_scroll_top){
				last_scroll_top = fxy.is.number(new_scroll_top) ? new_scroll_top:last_scroll_top
				this.list.scrollTop = last_scroll_top
				return last_scroll_top
			}
			
			list.addEventListener('scroll', this.on_scroll.bind(this), false)
		}
		
		absolute(bar, yes) {
			bar.classList.toggle('absolute', yes)
			if (!yes) bar.style.top = ''
			return bar
		}
		
		get create() { return Items.create }
		
		disconnect(){
			this.list.removeEventListener('scroll', this.on_scroll.bind(this), false)
			return this
		}
		
		fixed(bar, yes) {
			bar.classList.toggle('fixed', yes)
			return bar
		}
		
		height(sticky) {return parseInt(sticky.dataset.originalHeight)}
		
		init() {
			this.log('init sticky-list controller')
			//let maxWidth = this.list.scrollWidth > this.list.clientWidth ? this.list.clientWidth : this.list.scrollWidth
			let maxWidth = (this.list.clientWidth)+'px'
			let s = this.list.headers.map((bar) => {
				bar.style.width = maxWidth;
				bar.style.maxWidth = maxWidth;
				bar[is_header] = true
				return bar;
			})
			return this.load(s)
		}
		
		get initialized() {
			if (typeof this[initialized] === 'undefined') {
				let init = this.list && this.list.isConnected && this.list.parentNode !== null && Array.isArray(this.stickies) && this.list.hasAttribute('initialized')
				if (init) this[initialized] = true
			}
			return this[initialized] || false
		}
		
		load(stickies) {
			if (Array.isArray(stickies) && stickies.length > 0) {
				this.stickies = stickies.map((sticky) => {
					let s = this.wrap(sticky, this.create.header)
					sticky.dataset['originalPosition'] = sticky.offsetTop
					sticky.dataset['originalHeight'] = sticky.clientHeight
					s.style.height = sticky.clientHeight + 'px'
					return sticky
				})
				this.list.setAttribute('initialized', '')
				//this.log('list-o initiliazed', this.initialized)
			}
			return this
		}
		
		log(...args) { return this.verbose ? console.log(...args) : this }
		
		on_scroll_callback(scrollTop) {
			let stickies = this.stickies
			stickies.forEach((sticky, i) => {
				if (!sticky) return
				let data = Header.data(sticky)
				if (!data) return
				let position = data.position
				if (position <= scrollTop) {
					let nextSticky = stickies[i + 1]
					let next = Header.data(nextSticky)
					let nextPosition = next ? (next.position - data.height) : 0
					this.fixed(sticky, true)
					let stickyTop = sticky.offsetTop - this.list.offsetTop
					if (next && (scrollTop + stickyTop >= nextPosition)) {
						this.absolute(sticky, true)
						sticky.style["top"] = nextPosition + 'px'
					}
				}
				else {
					let prevSticky = stickies[i - 1]
					let prev = Header.data(prevSticky)
					this.fixed(sticky, false)
					if (prev && (scrollTop <= data.position - data.height)) this.absolute(prevSticky, false)
				}
				if (i === 0 && scrollTop === 0) {
					this.fixed(sticky, false)
					this.absolute(sticky, false)
				}
			})
		}
		
		position(sticky) { return parseInt(sticky.dataset.originalPosition)}
		
		get verbose() {return this.list.verbose}
		
		wrap(el, wrapper) {
			el.parentNode.insertBefore(wrapper, el);
			wrapper.appendChild(el);
			return wrapper
		}
	}
	
	
	
	
	const StickyMix = Base => class extends Items.Mix(Base){
		clear(){ return item_clear(this) }
		get controller() {
			if (controller in this) return this[controller]
			return this[controller] = new StickyScrollController(this)
		}
		disconnected() { if(controller in this) this.controller.disconnect() }
		get objects() {
			if (objects in this) return this[objects]
			return this[objects] = new Objects()
		}
		set objects(items) {
			if (Array.isArray(items)) this[objects] = new Objects(...items)
			return this[objects]
		}
		push(item) {
			this.objects.add(item)
			return this.update('add')
		}
		push_groups(groups) {
			var itemIndex = 0
			this.collection = groups
			for (let g of groups) {
				let group = g[0]
				let items = g[1]
				let header = item_header(group)
				let collection = this.controller.create[this.selectors.group]
				var groupIndex = 0
				for (let item of items) {
					if (item.dom) {
						item.dom.dataset.group = group
						item.dom.dataset.index = itemIndex
						item.dom.dataset.groupIndex = groupIndex
						collection.appendChild(item.dom)
						groupIndex++
						itemIndex++
					}
				}
				this.shadowRoot.appendChild(header)
				this.shadowRoot.appendChild(collection)
				//this.shadowRoot.appendChild(this.controller.create[this.selectors.footer])
			}
			return this
		}
		set_items(...items){ return this.update('items',this[item_data] = items) }
		timer(callback,time){ return item_timer(this,callback,time) }
		update(name,value){
			if( ['add','sort','items'].includes(name) === false ||
				(name === 'sort' && !this.objects.sorts.has(value))) return this
			
			
			this.shadowRoot.innerHTML = `<style>${fxy.require('sticky/template')(this)}</style>`
			if(name !== 'items' || (name === 'items' && fxy.is.nothing(value))) update.call(this)
			else{
				let time = 1500
				if(fxy.is.array(value)) this.objects = value
				else if(fxy.is.number(value)) time = value
				this.timer(update.bind(this), time)
			}
			
			function update(){
				if (this.count('objects')) {
					let itemdata = this.objects.sort(this.sort)
					itemdata.list = Items.list(itemdata)
					this.push_groups(this.objects.group(itemdata)).controller.init()
					this.update_items().then(()=>{
						this.dispatch('items',this.items)
						if('update_scroll_top' in this){
							this.update_scroll_top(this.controller)
							delete this.update_scroll_top
						}
					})
				}
			}
			return this
		}
	}
	
	sticky.Mix = StickyMix
	//shared actions
	function item_clear(list){
		let timer = item_timer(list)
		if (timer) timer.clear()
		if (list[controller]) {
			delete list[controller][initialized]
			delete list[controller].stickies
			list.items.forEach(item => item.remove())
		}
		return list
	}
	
	function item_header(title){
		let header = Items.create[Items.selectors.header]
		header.innerHTML = `
			<div container gui horizontal center relative style="height:100%">
				<div title gui horizontal center-center relative>
					<div>${title}</div>
				</div>
			</div>
		`
		return header
	}
	
	function item_timer(list,callback,time){
		if (typeof callback === 'function') {
			if (list[timer]) list[timer].clear()
			if (typeof time !== 'number') time = 400
			return list[timer] = {
				callback,
				clear(){
					if (typeof this.id === 'number') {
						window.clearTimeout(this.id)
						delete this.id
					}
					return this
				},
				start(){
					this.clear().id = window.setTimeout(() => {
						delete this.id
						this.callback()
					}, time)
					return this
				}
			}.start()
		}
		return list[timer]
	}
	
})
