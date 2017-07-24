
(function (root, factory) {
	return factory(root)
})(window, function listoFactory(window) {
	const Timer = Symbol.for('timer')
	const Objects = Symbol.for('objects')
	const Group = Symbol.for('group')
	const Data = Symbol.for('data')
	const Controller = Symbol.for('list-o controller')
	const Sorts = Symbol.for('list-o sorts')
	const Initialized = Symbol.for('initialized')
	const ItemTemplate = Symbol.for('itemTemplate')
	const Selector = Symbol.for('ItemSelector')
	const IsHeader = Symbol.for('isHeader')
	const headerSelector = 'headerBar'
	const itemSelector = 'listItem'
	const groupSelector = 'listGroup'
	const footerSelector = 'footerBar'
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
	const SortMethods = new Map([
		['abc', AlphabeticalSort],
		['zyx', (array, key) => {return AlphabeticalSort(array, key).reverse()}]
	])
	const Template = (listo) => {
		return `
          <style>
              
              :host{
                  --list-width:441px;
                  --item-background:white;
                  --item-border:0 0 1px 0;
                  --item-border-style:solid;
                  --item-border-color:rgba(0,0,0,0.2);
                  --item-selected-background:dodgerblue;
                  --item-selected-color:white;
                  --item-padding:10px;
                  --item-color:black;
                  --header-background: rgba(0,0,0,0.6);
                  --header-background-mid: rgba(0,0,0,0.6);
                  --header-color: white;
                  --header-padding:10px 20px;
                  --sticky-shadow:drop-shadow(0px 3px 5px rgba(70,70,80,0.88));
                  --list-o-font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
              
              }
              
              :host{
                  top:0;
                  display: block;
                  overflow: hidden;
                  overflow-y:scroll;
                  pointer-events: auto;
                  position: relative;
                  background:var(--list-background,white);
                  width:var(--list-width,400px);
                  max-width: var(--list-width,400px);
                  font-family: var(--list-font, var(--list-o-font-family) );
                  box-sizing: border-box;
                  outline:none;
              }
              
              
              div,span,li,a,img,button{
                  box-sizing: border-box;
              }
              
              
              
              /*group*/
              ${listo.groupSelector}{
                max-height:200vh;
                overflow:visible;
              }
              :host([initialized]) ${listo.groupSelector}{
                transition-property:max-height;
                transition-duration:300ms;
                transition-property:max-height;
                transition-timing-function:ease-in-out;
                will-change:max-height;
              }
              
              ${listo.groupSelector}[aria-hidden="true"]{
                  max-height:0;
                  overflow:hidden;
              }
              
              /*children*/
              ${listo.itemSelector} > *,
              ${listo.headerSelector} > *{
                  position:relative;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  -webkit-user-select: none;
                  user-select: none;
                  cursor: default;
                  z-index: 1;
              }
              
              /*header-wrap*/
              .header{
                box-sizing: border-box;
              }
              
              ${listo.headerSelector} {
                  top:0;
                  overflow: visible;
                  position: relative;
                  z-index: 2;
                  
                  padding: var(--header-padding);
                  color: var(--header-color);
                  height: var(--header-height,40px);
                  max-height: var(--header-height,40px);
                  box-sizing: border-box;
                  background: var(--header-background-mid);
                  transform:scale(0.98,0.98) translateY(1px);
                  //will-change: transform;
                  //transition-property: transform;
                  //transition-duration: 200ms;
                  //transition-timing-function: ease-in-out;
                  //transform-style: flat;
                  border-radius:2px;
                
                  
              }
              
              ${listo.headerSelector} [title]{ text-transform:capitalize; }
             
              ${listo.headerSelector}:before{
                  content:'';
                  position: absolute;
                  top:0;left:0;right:0;bottom:0;
                  display: block;
                  transform:scale(0.98,0.98);
                  opacity:0;
                  background-color: var(--header-background);
                  will-change: transform,opacity;
                  transition-property: transform,opacity;
                  transition-duration: 200ms;
                  transition-timing-function: ease-in-out;
                  transform-style: flat;
                  border-radius:2px;
                   -webkit-filter:var(--sticky-shadow);
                   filter:var(--sticky-shadow);
                   z-index:0;
              }
              ${listo.headerSelector}.fixed {
                  top:${listo.offsetTop}px;
                  position: fixed;
                  z-index: 1;
                
              }
              ${listo.headerSelector}.fixed:before{
                
                opacity:1;
                transform:scale(1,0.98);
              }
              
              ${listo.headerSelector}.fixed.absolute {
                  position: absolute;
              }
              ${listo.headerSelector}.fixed.absolute:before{
                opacity:0.3;
                transform:scale(1,1.1);
              }
              
              ${listo.itemSelector}{
                  position: relative;
                  box-sizing: border-box;
                  color:var(--item-color);
                  background:var(--item-background);
                  border:var(--item-border);
                  padding:var(--item-padding);
                  cursor: default;
                  outline: none;
                  will-change: color;
                  transition-property: color;
                  transition-duration: 200ms;
                  transition-timing-function: ease-in-out;
                  z-index:0;
              }
              
              ${listo.itemSelector}:before{
                  content:'';
                  position: absolute;
                  top:0;left:0;right:0;bottom:0;
                  display: block;
                  transform:scale(0.98,0.9);
                  opacity:0;
                  will-change: transform,opacity;
                  border-radius: 2px;
                  transition-property: transform,opacity;
                  transition-duration: 200ms;
                  transition-timing-function: ease-in-out;
                  transform-style: flat;
                  background: var(--item-selected-background);
                  z-index: 0;
              
              }
              
              
              
              
              
              ${listo.itemSelector}:hover:before,
              ${listo.itemSelector}:focus:before{
                  opacity:0.5;
              }
              ${listo.itemSelector}:active:before{
                  opacity: 0.9;
              }
              
              /*item aria*/
              ${listo.itemSelector}[aria-selected="true"]{
                color:var(--item-selected-color,white);
              }
              ${listo.itemSelector}[aria-selected="true"]:before{
                  opacity:1;
              }
              ${listo.itemSelector}[aria-disabled="true"]{
                  opacity:0.7;
                  -webkit-filter:saturate(0);
                  filter:saturate(0);
                  cursor:not-allowed;
              }
              
              
              
              
              /*footer*/
              ${listo.footerSelector}{
                box-sizing: border-box;
                background:var(--footer-background,transparent);
                padding:var(--footer-padding,0px);
                height:var(--footer-height,0px);
                overflow:hidden;
              }
              
              
              button{
                  -webkit-appearance:none;
                  border:none;
                  background:transparent;
                  outline:none;
                  opacity:1;
                  transition:opacity 100ms ease-in-out;
                  will-change:opacity;
                  z-index:1;
              }
              
              
              /*prevent-event*/
                //:host([scrolling])  ${listo.itemSelector},
                :host([scrolling]) button,
                ${listo.itemSelector}[aria-disabled="true"]{
                    pointer-events:none;
                }


          
          </style>
       `;
	}
	const ItemSelect = {
		selectedClass: 'item-selected',
		selected(item){return item.classList.contains(this.selectedClass)},
		select(item){
			item.classList.toggle(this.selectedClass, true)
			item.setAttribute('aria-selected', 'true')
			item.setAttribute('tabindex', '0')
			return item
		},
		deselect(item){
			item.classList.toggle(this.selectedClass, false)
			item.setAttribute('aria-selected', 'false')
			item.setAttribute('tabindex', '-1')
			return item
		},
		disable(item){
			item.setAttribute('aria-disabled', 'true')
			item.setAttribute('disabled', '')
			return item
		},
		enable(item){
			item.setAttribute('aria-disabled', 'false')
			item.removeAttribute('disabled')
			return item
		},
		item(item){
			this.deselect(item.hasAttribute('disabled') ? this.disable(item) : this.enable(item))
			if (!item.hasAttribute('role')) item.setAttribute('role', 'option')
			return item
		}
	}
	const ItemSelector = list => {
		return new Proxy({
			list,
			current: null,
			get selected() {return this.list.items.filter((item) => {return item.classList.includes('item-selected')})},
		}, {
			get(o, k){
				if (k in o) return o[k]
				else if (k in ItemSelect) return ItemSelect[k]
				return
			},
			set(o, k, v){
				if (k === 'select' || k === 'current') {
					o.current = ItemSelect.select(v)
				} else if (k === 'deselect') {
					ItemSelect.deselect(v)
					if (o.current === v) o.current = null
				} else if (k === 'disable') {
					ItemSelect.disable(v)
				}
				else if (k === 'enable') {
					ItemSelect.enable(v)
				}
				return true
			}
		})
	}
	class ListOfObjects extends Set {
		static Controller(listo) { return new ListOfObjectsController(listo) }
		
		static nameKey(item) {
			let keys = Object.keys(item)
			let list = keys.filter((key) => { return validNames.includes(key) })
			               .map((key) => {return validNames.indexOf(key)})
			               .sort()
			return list.map((i) => {return validNames[i]})
		}
		
		constructor(...items) { super(items) }
		
		get sorts() {
			if (!this[Sorts]) return SortMethods
			return this[Sorts]
		}
		
		set sorts(value) {
			if (value instanceof Map) this[Sorts] = value
			return this[Sorts]
		}
		
		sort(type, key) {
			let sort = this.sorts.has(type) ? this.sorts.get(type) : SortMethods.get('abc')
			var array = Array.from(this)
			if (typeof key === 'undefined') {
				var keys = this.constructor.nameKey(array[0])
				if (keys.length) key = keys[0]
			}
			var list = array
			if (typeof sort === 'function') list = sort(array, key)
			return {list, key, type}
		}
		
		group(sorted) {
			var groups = new Map()
			var key = sorted.key
			sorted.list.forEach((item, index) => {
				var v = item[key]
				if (!('i' in item)) item.i = index
				if (typeof v === 'string') {
					v = v.trim().toLowerCase()
					var c = v.charAt(0)
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
			var last_scroll_top = 0;
			var ticking = false;
			var timeout;
			let callback = this.onScrollCallback.bind(this)
			
			function timeoutScroll() {
				list.removeAttribute('scrolling')
				timeout = null
				
			}
			
			function onScroll(last_scroll_top, callback) {
				callback(last_scroll_top)
			}
			
			this.onScroll = function (e) {
				if (!this.initialized) return
				if (typeof timeout === 'number') {
					window.clearTimeout(timeout)
					timeout = null
				}
				last_scroll_top = list.scrollTop
				if (!ticking) {
					window.requestAnimationFrame(function () {
						if (!list.hasAttribute('scrolling')){
							list.setAttribute('scrolling', '')
						}
						onScroll(last_scroll_top, callback);
						ticking = false;
						timeout = window.setTimeout(timeoutScroll, 100)
					});
				}
				ticking = true;
			}
		}
		
		get initialized() {
			if (typeof this[Initialized] === 'undefined') {
				let init = this.list && this.list.isConnected && this.list.parentNode !== null && Array.isArray(this.stickies) && this.list.hasAttribute('initialized')
				if (init) this[Initialized] = true
			}
			return this[Initialized] || false
		}
		
		scrollTop() { return this.list.scrollTop }
		
		fixed(bar, yes) {
			bar.classList.toggle('fixed', yes)
			return bar
		}
		
		absolute(bar, yes) {
			bar.classList.toggle('absolute', yes)
			if (!yes) bar.style.top = ''
			return bar
		}
		
		position(sticky) { return parseInt(sticky.dataset.originalPosition)}
		
		height(sticky) {return parseInt(sticky.dataset.originalHeight)}
		
		onScrollCallback() {return false}
	}
	const Header = {
		get map() {
			if (!this[Data]) this[Data] = new WeakMap()
			return this[Data]
		},
		is(header){
			//if(typeof header === 'object') console.log({header,isObj:true})
			//if(header instanceof HTMLElement) console.log({instanceOf:true})
			//if(header[IsHeader] === true) console.log({isHeader:header[IsHeader]})
			return (header instanceof HTMLElement && header[IsHeader] === true)
		},
	
		data(header){
			if (this.is(header)) {
				//console.log({header})
				if (this.map.has(header)) return this.map.get(header)
				let data = {
					map: new Map(),
					get(key){return this.map.get(key)},
					has(key){return this.map.has(key)},
					set(key, value){return this.map.set(key, value)},
					get group(){return this.map.get('group')},
					get collapsed(){return this.group.getAttribute('aria-hidden') === 'true'},
					set collapsed(collapsed){
						return this.group.setAttribute('aria-hidden',collapsed)
					},
					get position(){
						return this.get('original position')
					},
					get height(){ return this.get('original height') }
				}
				
				data.set('original position',parseInt(header.dataset.originalPosition))
				data.set('original height',parseInt(header.dataset.originalHeight))
				return this.map.set(header, data).get(header)
			}
			return null
		}
	}
	
	class ListOfObjectsController extends StickyScrollController {
		static get create() {
			return new Proxy(document, {
				get(o, k) {
					let dom = o.createElement('div')
					if (k.charAt(0) === '.') k = k.replace('.', '')
					dom.classList.toggle(k, true)
					return dom
				}
			})
		}
		
		constructor(listo) { super(listo) }
		
		get verbose() {return this.list.verbose}
		
		log(...args) { return this.verbose ? console.log(...args) : this }
		
		onScrollCallback(scrollTop) {
			let stickies = this.stickies
			stickies.forEach((sticky, i) => {
				//console.log({i,sticky})
				if(!sticky) return;
				let data = Header.data(sticky)
				if(!data) return;
				let position = data.position;
				
				if (position <= scrollTop) {
					let nextSticky = stickies[i + 1]
					let next = Header.data(nextSticky)
					let nextPosition = next ? (next.position - data.height) : 0;
					this.fixed(sticky, true)
					let stickyTop = sticky.offsetTop - this.list.offsetTop
					if (next && (scrollTop + stickyTop >= nextPosition)) {
							this.absolute(sticky, true)
							sticky.style["top"] = nextPosition + 'px'
					}
				}
				else {
					let prevSticky = stickies[i - 1];
					let prev = Header.data(prevSticky)
					this.fixed(sticky, false)
					if (prev && (scrollTop <= data.position - data.height)){
						this.absolute(prevSticky, false)
					}
				}
				if(i === 0 && scrollTop === 0){
					this.fixed(sticky,false)
					this.absolute(sticky,false)
				}
			});
		}
		
		wrap(el, wrapper) {
			el.parentNode.insertBefore(wrapper, el);
			wrapper.appendChild(el);
			return wrapper
		}
		
		get create() { return this.constructor.create }
		
		load(stickies) {
			
			if (Array.isArray(stickies) && stickies.length > 0) {
				this.stickies = stickies.map((sticky) => {
					let s = this.wrap(sticky, this.create.header)
					sticky.dataset['originalPosition'] = sticky.offsetTop
					sticky.dataset['originalHeight'] = sticky.clientHeight
					s.style.height = sticky.clientHeight + 'px'
					return sticky
				})
				this.list.setAttribute('initialized','')
				this.log('list-o initiliazed', this.initialized)
			}
			return this
		}
		
		init() {
			this.log('init list-o controller')
			let maxWidth = this.list.scrollWidth > this.list.clientWidth ? this.list.clientWidth : this.list.scrollWidth
			let s = this.list.headers.map((bar) => {
				bar.style.width = maxWidth + 'px';
				bar.style.maxWidth = maxWidth + 'px';
				bar[IsHeader] = true
				return bar;
			})
			console.log(Header)
			return this.load(s)
		}
	}
	const ListOComponent = Base => class ListO extends Base {
		get controller() {
			if (!this[Controller]) this[Controller] = ListOfObjects.Controller(this)
			return this[Controller]
		}
		
		set controller(controller) {
			if (controller instanceof ListOfObjectsController && this[Controller] !== controller) {
				this[Controller] = controller
			}
			return this[Controller]
		}
		
		get footers() {
			return Array.from(this.shadowRoot.querySelectorAll(this.footerSelector))
		}
		
		get footerSelector() {
			return this.hasAttribute('footer-selector') ? this.getAttribute('footer-selector') : `.${footerSelector}`
		}
		
		get groups() {
			return Array.from(this.shadowRoot.querySelectorAll(this.groupSelector))
		}
		
		get groupSelector() {
			return this.hasAttribute('group-selector') ? this.getAttribute('group-selector') : `.${groupSelector}`
		}
		
		get headers() {
			return Array.from(this.shadowRoot.querySelectorAll(this.headerSelector))
		}
		
		get headerSelector() {
			return this.hasAttribute('header-selector') ? this.getAttribute('header-selector') : `.${headerSelector}`
		}
		
		get items() {
			return Array.from(this.shadowRoot.querySelectorAll(this.itemSelector))
		}
		
		get itemSelector() {
			return this.hasAttribute('item-selector') ? this.getAttribute('item-selector') : `.${itemSelector}`
		}
		
		get itemTemplate() {
			if (this[ItemTemplate]) return this[ItemTemplate].cloneNode(true)
			return this.controller.create[this.itemSelector]
		}
		
		set itemTemplate(v) {
			if (!(v instanceof HTMLElement)) {
				this.controller.log(new TypeError('list-o.itemTemplate must be a valid HTMLElement'))
			} else {
				if (!this.hasAttribute('item-selector')) {
					let tag = v.tagName.toLowerCase()
					let className = tag.className.trim().split(' ')[0] || ''
					let selector = `${tag + (className ? '.' + className : '')}`
					this.setAttribute('item-selector', selector)
				}
			}
			return this[ItemTemplate] = v
		}
		
		get objects() {
			if (!this[Objects]) this[Objects] = new ListOfObjects()
			return this[Objects]
		}
		set objects(items){
			if(Array.isArray(items)) this[Objects] = new ListOfObjects(...items)
			return this[Objects]
		}
		
		get selector() {
			if (!this[Selector]) this[Selector] = ItemSelector(this)
			return this[Selector]
		}
		
		get sort() {return this.hasAttribute('sort') ? this.getAttribute('sort') : 'abc'}
		
		get verbose() {return this.hasAttribute('verbose')}
		
		clear() {
			//clear the timer && remove elements from list
			let timer = this.timer()
			if (timer) timer.clear()
			if (this[Controller]) {
				delete this[Controller][Initialized]
				delete this[Controller].stickies
				this.items.forEach((item) => {return item.remove()})
			}
			return this
		}
		
		configure(name, value) {
			if (name === 'sort') {
				if (typeof value === 'string') {
					if (this.verbose && !this.objects.sorts.has(value)) {
						console.group('list-o: sorts')
						console.warn('sort method "' + value + '" is undefined: (abc,zyx) are included')
						console.info('object.sorts method protocol = Function(array,propertyName)=>Array')
						console.info('\t - A method that receives an array & the property name of value to be sorted & return an array')
						console.info('To add a method use this.objects.sorts.set(sortName,sortMethod)')
						console.info('You may override sorts entirely by adding a Map of methods but by default the sort method will be added to the global Sorts Map so it is reusable')
						console.groupEnd()
					} else this.updateItems()
				} else console.error('list-o: sort name is not a string')
			} else if (name === 'items') {
				if (Array.isArray(value)) {
					this.objects = value
					return this.updatePushes()
				} else console.error('list-o: items was not an array of objects')
			}
			return this
		}
		
		connectTemplate() {
			//initialize the shadow root & template
			if (!this.shadowRoot) this.attachShadow({mode: 'open'})
			this.shadowRoot.innerHTML = Template(this)
			if (!this.hasAttribute('role')) this.setAttribute('role', 'listbox')
			if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0')
			if (!this.hasAttribute('aria-multiselectable')) this.setAttribute('aria-multiselectable', 'true')
			return this
		}
		
		connectController(controller) {
			//initialize &/or set the scrolling events for controller
			if(controller) this.addEventListener('scroll', controller.onScroll.bind(controller), false)
			return this
		}
		
		count(key) {
			if (key in this) {
				let value = this[key]
				if (Array.isArray(value)) return value.length
				else if (value instanceof Set || value instanceof Map) return value.size
			}
			return -1
		}
		
		disconnectController(onlyScrollingEvent) {
			if (this[Controller]) this.removeEventListener('scroll', this[Controller].onScroll.bind(this[Controller]), false)
			return !onlyScrollingEvent ? this.clear() : this
		}
		
		itemEvent(e) {
			if (e.preventDefault) e.preventDefault()
			var item = e.currentTarget
			let isSelected = ItemSelect.selected(item)
			let selector = this.selector
			let last = selector.current
			if (isSelected) selector.deselect = item
			else selector.select = item
			let collection = this.collection
			let detail = {
				get data() {
					let set = collection.has(this.item.dataset.group) ? collection.get(this.item.dataset.group) : null
					if (!set) return set
					return Array.from(set)[this.item.dataset.groupIndex] || null
				},
				isSelected,
				item,
				last,
				originalEvent: e,
				type: isSelected ? 'deselected' : 'selected'
			}
			return this.dispatchEvent(new CustomEvent(`item-${detail.type}`, {bubbles: true, composed: true, detail}))
		}
		
		push(item) {
			this.objects.add(item);
			return this.updatePushes()
		}
		
		pushGroups(groups) {
			var itemIndex = 0
			this.collection = groups
			for (let g of groups) {
				let group = g[0]
				let items = g[1]
				let header = this.controller.create[this.headerSelector]
			
				header.innerHTML = '<div title>'+group+'</div>'
				let collection = this.controller.create[this.groupSelector]
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
				this.shadowRoot.appendChild(this.controller.create[this.footerSelector])
			}
			return this
		}
		
		updateItems() {
			let controller = this.connectTemplate().controller
			this.connectController(controller)
			controller.log('will update list-o items')
			if (this.count('objects')) {
				let itemdata = this.objects.sort(this.sort)
				controller.log(itemdata)
				itemdata.list = itemdata.list.map((item) => {
					if (!item.dom) {
						item.dom = this.itemTemplate
						ItemSelect.item(item.dom)
						item.dom.addEventListener('click', this.itemEvent.bind(this), false)
					}
					item.dom.setAttribute('data-key', itemdata.key)
					item.dom.innerHTML = `<div title>${item[itemdata.key]}</div>`
					return item
				})
				this.pushGroups(this.objects.group(itemdata))
				this.controller.init()
			}
			return this;
		}
		
		timer(callback, time) {
			if (typeof callback === 'function') {
				if (this[Timer]) this[Timer].clear()
				if (typeof time !== 'number') time = 400
				return this[Timer] = {
					callback,
					clear(){
						if (typeof this.id === 'number') {
							window.clearTimeout(this.id);
							delete this.id;
						}
						return this
					},
					start(){
						this.clear().id = window.setTimeout(() => {
							delete this.id;
							this.callback()
						}, time)
						return this;
					}
				}.start()
			}
			return this[Timer]
		}
		
		updatePushes() {
			this.timer(this.updateItems.bind(this), 1500)
			return this
		}
	}
	if ('customElements' in window) {
		if (typeof window.customElements.get('list-o') === 'undefined') {
			window.customElements.define('list-o', class ListOElement extends ListOComponent(HTMLElement) {
				static get observedAttributes() {return ['sort', 'items']}
				
				constructor() { super() }
				
				connectedCallback() {
					//set shadowDom & connect to list controller
					this.connectController()
				}
				
				disconnectedCallback() {
					//mainly to clear item timer & mutation observer if they exist
					this.disconnectController()
				}
				
				attributeChangedCallback(name, oldValue, newValue) {
					var value = newValue === null ? false : newValue
					if (name === 'items' && typeof newValue === 'string') value = JSON.parse(newValue)
					this.configure(name, value);
				}
			})
		}
	} else {
		if ('Polymer' in window) console.warn('Polymer users can either use native CustomElementsV1 or include list-o/lib/polymer.html instead of list-o/list-o.html ')
		else console.warn('CustomElementsV1 is used for list-o & not "document.registerElement" from the CustomElementsV0 Spec - either use Polymer or include a CustomElementsV1 polyfill')
	}
})
