window.fxy.exports('data',(data,fxy)=>{
	const data_detect = Symbol.for('data detect')
	const detections = [
		'attributes', //attribute
		'attributeOldValue', //old
		'attributeFilter', //filter
		'characterData', //text
		'characterDataOldValue', //old
		'childList', //elements
		'subtree' //all
	]
	const has_observer = Symbol('has observer')
	
	class Detect extends Set{
		static get component(){ return get_component }
		static get detections(){ return detections }
		constructor(...x){
			super()
			this.element = x.filter(item=>fxy.is.element(item))[0] || null
			let options = x.filter(item=>fxy.is.data(item)&&(!fxy.is.element(item)))[0] || null
			if(!options && this.element) this.options = get_options(this.element)
			else this.options = options
			if(this.element) {
				this.element.setAttribute('detector-component','')
				if(this.options.element) set_detection(this,this.element.shadowRoot || this.element)
				if(this.options.start) this.start(this.element)
			}
		}
		destroy(){
			for(let item of this) item.destroy()
			return this
		}
		detect(...elements){
			elements.forEach(element=>set_detection(this,element))
			return this
		}
		dispatch(name,item){
			if(this.element) {
				let detail = {name,item}
				let event = new CustomEvent('detect',{composed:true,detail})
				this.element.dispatchEvent(event)
			}
			if(this.changed) this.changed(name,item)
			return this
		}
		get(element){
			for(let item of this) if(item.element === element) return item
			return null
		}
		start(element,options){
			let item = this.get(element)
			if(item) item.start(options)
			return this
		}
		stop(){
			for(let item of this) item.stop()
			return this
		}
		
	}
	
	//exports
	data.detect = Detect
	//shared actions
	function get_component(element){
		if(data_detect in element) return element[data_detect]
		return element[data_detect] = new Detect(element)
	}
	
	function get_options(object){
		let options = {}
		if(fxy.is.element(object)){
			let attributes = Array.from(object.attributes)
			for(let item of attributes){
				if(item.name.indexOf('detect-') === 0){
					let name = item.name.replace('detect-','')
					options[name] = item.value
				}
			}
		}
		else if(fxy.is.data(object)){
			if(object instanceof Detect && fxy.is.data(object.options)) options = object.options
			else options = object
		}
		return get_value()
		//shared actions
		function get_value(){
			let value = {}
			for(let i in options){
				let x = options[i]
				let name = get_name(i)
				switch(name){
					case 'attributes':
						value[name] = true
						if(x === 'old') value.attributeOldValue=true
						break
					case 'characterData':
						value[name] = true
						if(x === 'old') value.characterDataOldValue=true
						break
					case 'attributeFilter':
						value.attributeFilter = fxy.in(value)
						break
					default:
						value[name] = true
				}
			}
			options.mutation_observer_options = value
			return options
		}
		function get_name(name){
			switch(name){
				case 'text': return 'characterData'
				case 'attribute': return 'attributes'
				case 'filter': return 'attributeFilter'
				case 'elements': return 'childList'
				case 'all': return 'sublist'
				default:
					if(detections.includes(name)) return name
					let medial = fxy.id.medial(name)
					if(detections.includes(name)) return medial
			}
			return null
		}
	}
	
	function set_detection(detect,element){
		if(fxy.is.element(element) || has_observer in element) return true
		element[has_observer] = true
		detect.add({
			destroy(){
				detect.delete(this.stop())
				if(this.element) delete this.element[has_observer]
				return true
			},
			observer:new MutationObserver(observe),
			element,
			start(options){
				if(this.watching)return this
				this.watching=true
				this.observer.observe(this.element,fxy.is.data(options) ? options:element.options.mutation_observer_options)
				return this
			},
			stop(){
				if(this.watching) this.observer.disconnect()
				delete this.watching
				return this
			}
		})
		return true
		//shared actions
		function observe(mutations){
			for (let i of mutations) {
				let type = i.type
				let name = type
				switch(type){
					case 'characterData': name = 'text'
					case 'childList': name = 'elements'
					case 'attributes': name = 'attribute'
				}
				if(name in detect) detect[name](i)
				else detect.dispatch(name,i)
			}
		}
	}
})