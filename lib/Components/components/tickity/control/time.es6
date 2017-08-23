wwi.exports('tickity',(tickity,fxy)=>{
	
	const clock_hands = Symbol('tickity clock hands')
	const default_tick = 1000
	const tickity_time = Symbol('tickity time')
	const last_rotation = Symbol('tickity last rotation')
	
	class TickityTime extends tickity.Model{
		
		get hands(){
			if(clock_hands in this) return this[clock_hands]
			return this[clock_hands] = hands()
		}
		get rotation(){
			if(!this[last_rotation]) this[last_rotation] = {last:0}
			return this[last_rotation]
		}
		start(){
			this.stop().timer = window.setInterval(update.bind(this),this.tick)
			return this.update()
		}
		stop(){
			if(typeof this.timer === 'number'){
				window.clearInterval(this.timer)
				delete this.timer
			}
			return this
		}
		text(){
			return tickity.zero(this.data.hours) + ":" + tickity.zero(this.data.minutes)
		}
		get tick(){ return this.element.tick || default_tick }
		get ticking(){ return 'timer' in this  }
		
		value(){
			let hours, minutes, seconds
			let date = new Date()
			seconds = date.getSeconds()
			if (seconds === 0) this.hands.sec++
			seconds += (this.hands.sec * 60)
			minutes = date.getMinutes()
			hours = date.getHours()
			if (hours > 12) { hours -= 12; }
			return {hours,minutes,seconds}
		}
		
		
	}
	
	//exports
	//tickity.time = (element)=>{return new TickityTime(element)}
	tickity.Time = Base => class extends tickity.Size(Base){
		get control(){ return this.time }
		resize({height,width}){
			if(this.time.is_button){
				this.style.right = '-2px';
				this.style.top = '-3px';
			}else{
				//let ratio = tickity.gold(parseFloat(width)).value(0)
				this.style.bottom = '-' + (width / 5) + 'px'
				this.style.right = '-' + (width / 5) + 'px'
			}
		}
		start(){
			this.time.start()
			return this
		}
		stop(){
			this.time.stop()
			return this
		}
		get tick(){
			return this.hasAttribute('tick') ? fxy.numeral(this.getAttribute('tick')).value:default_tick
		}
		get ticking(){ return this.time.ticking }
		get time(){
			if(tickity_time in this) return this[tickity_time]
			return this[tickity_time] = new TickityTime(this)
		}
		update(time) {
			let clock = get_clock(this)
			let rotation = this.time.rotation
			if (!this.time.is_button) rotate(clock.seconds, 'seconds', time.seconds)
			if (rotation.last > 0) {}
			else {
				rotation.last = 0
				rotate(clock.minutes, 'minutes', time.minutes)
				rotate(clock.hours, 'hours', time.hours)
			}
			rotation.last = rotation.last + 1
		}
	}
	
	
	//shared actions
	function hands(){
		return {
			sec:0,
			min:0,
			hr:0,
			preHr:-1,
			preMin:-1,
		}
	}
	
	function get_clock(element){
		return {
			get seconds() {
				return element.query('[seconds]')
			},
			get minutes() {
				return element.query('[minutes]')
			},
			get hours() {
				return element.query('[hours]')
			}
		}
	}
	
	
	
	function rotate(element, key, value){
		switch (key) {
				case 'hours':
					transform(element, {rotateZ: 30 * value})
					break
				case 'minutes':
					transform(element, {rotateZ: 6 * value})
					break
				case 'seconds':
					transform(element,{rotateZ:6 * value})
					break
			}
			return null
	}
	
	function transform(element, value) {
		value.rotateZ = value.rotateZ + 'deg'
		element.style.transform = transform_value(value)
		return this
	}
	
	function transform_value(value){
		let v = ''
		if (fxy.is.data(value)) {
			for (let key in value) {
				if (v.length) v += ' ';
				v += key + '(' + value[key] + ')'
			}
		}
		else if (typeof value === 'string') v = value
		return v
	}
	
	function update(){
		window.requestAnimationFrame(_=>this.update())
	}
	
	
})