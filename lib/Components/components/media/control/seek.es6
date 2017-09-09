window.fxy.exports('media',(media,fxy)=>{
	
	const seek_control = Symbol('seek control')
	const MediaSeek = {
		right_click:null,
		repeating:false,
		seeking:false,
		seeking_volume:false,
		active:false
	}
	
	class SeekControl{
		constructor(){
			this.right_click = false
			
		}
		connect(element,type){
			this.element=element
			this.type = type
			switch(type){
				case 'seek':
					element.addEventListener('mousedown', handle_bar.bind(this), false)
					element.addEventListener('mousemove', seek.bind(this), false)
					element.addEventListener('click', function(e){e.stopPropagation()}, false)
					break
				case 'volume':
					this.bar = {}
					this.bar.volume = {
						length:this.bar.clientHeight,
						value:0.1
					}
					this.bar.value = '100%'
					element.container.addEventListener('mousedown', handle_volume.bind(this), false)
					element.container.addEventListener('mousemove', volume.bind(this), false)
					element.container.addEventListener('click', function(e){e.stopPropagation()}, false)
					element.button.addEventListener('click',volume_toggle.bind(this),false)
					break
			}
			return this
		}
		get audio(){ return this.controller.audio }
		is_right_click(e){ return (e.which === 3) ? true : false }
		get seek_value(){ return MediaSeek.value }
		set seek_value(value){ return MediaSeek.value = value }
		get seeking(){ return MediaSeek.seeking }
		set seeking(value){ return MediaSeek.seeking = value }
		get seeking_volume(){ return MediaSeek.seeking_volume }
		set seeking_volume(value){ return MediaSeek.seeking_volume = value }
		get time(){ return this.controller.time }
		
	}
	
	const SeekMix = Base => class extends Base{
		get control(){
			if(seek_control in this) return this[seek_control]
			return this[seek_control] = new SeekControl()
		}
	}
	
	MediaSeek.Mix = SeekMix
	
	//load
	document.documentElement.addEventListener('mouseup', remove_seek, false)
	
	//exports
	media.seek = MediaSeek
	
	//shared actions
	function move(e, target, type) {
		var value
		if (type === 'seek') {
			value = Math.round(((e.clientX - target.offset().left) + window.pageXOffset) * 100 / target.parentNode.offsetWidth)
			return value
		}
		else if(type === 'volume'){
			let offset = (target.offset().top + target.offsetHeight) - window.pageYOffset
			value = Math.round((offset - e.clientY))
			if (value > 100) value = 100
			if (value < 0) value  = 0
			return value
		}
	}
	
	function handle_bar(e) {
		let target = this.element
		let control = this
		MediaSeek.target = this
		control.right_click = control.is_right_click(e)
		control.seeking = true
		!control.right_click && target.bar.classList.add('progress__bar--active')
		seek(e)
	}
	
	function handle_volume(e) {
		let control = this
		MediaSeek.target = this
		control.right_click = control.is_right_click(e)
		control.seeking_volume = true
		volume(e)
	}
	
	function remove_seek() {
		let target = MediaSeek.target
		if(!target) return
		if (target.type === 'seek' && target.seeking && target.right_click === false && target.audio.readyState !== 0) {
			target.audio.currentTime = target.audio.duration * (target.seek_value / 100)
			let time = target.time.value(target.audio.currentTime,true)
			target.time.minutes = time.minutes
			target.time.seconds = time.seconds
			target.element.bar.classList.remove('progress__bar--active');
		}
		
		target.seeking = false
		target.seeking_volume = false
		delete MediaSeek.target
		
	}
	
	function seek(e) {
		e.preventDefault()
		let target = e.currentTarget
		let control = target.control
		if (control.seeking && control.right_click === false && target.audio.readyState !== 0) {
			control.seek_value = move(e, control.element.design.of(target.bar), 'seek')
			control.element.bar.value = control.seek_value + '%'
			control.element.bar.style.width = control.element.bar.value
		}
	}
	
	function volume(e) {
		e.preventDefault()
		e.stopPropagation()
		let control = this
		if (control.seeking_volume && control.right_click === false) {
			control.volume_value = move(e, this.element.design.of(this.element.bar), 'volume')
			let value = control.volume_value / 100
			if (value <= 0) {
				control.audio.volume = 0
				control.audio.muted = true
				this.element.button.state = fxy.symbols.disable
			}
			else {
				if(control.audio.muted) control.audio.muted = false
				control.audio.volume = value
				this.element.button.state = 'volume'
			}
			control.bar.value = control.volume_value + '%'
			control.element.bar.style.height = control.bar.value
			
		}
	}
	
	function volume_toggle(e) {
		
		let button = e.currentTarget
		let control = this
		let audio = this.audio
		let bar = this.element.bar
		if (audio.muted) {
			if (parseInt(control.bar.volume.length, 10) === 0) {
				bar.style.height = control.bar.volume.value * 100 + '%'
				audio.volume = this.volume_value
			}
			else {
				bar.style.height = control.bar.value
			}
			audio.muted = false
			button.state = 'volume'
		}
		else {
			audio.muted = true
			bar.style.height = 0
			button.state = fxy.symbols.disable
		}
	}
})
