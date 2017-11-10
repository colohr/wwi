window.fxy.exports('media',(Media)=>{
	//exports
	Media.Video = Base => class extends Base{
		changed(name,old,value){
			switch(name){
				case 'url':
					if(typeof value === 'string' && value.length && !this.loaded) this.fetch().then(_=>{}).catch(console.error)
					break
				case 'src':
					if(typeof value === 'string' && value.length) set_video_source(this,value)
					break
			}
		}
		connected(){
			this.style.display='block'
			this.style.opacity = 0
			this.style.overflow='hidden'
			this.style.transition = 'opacity 300ms ease-in'
			this.style.position = 'relative'
			this.onclick = e=>this.toggle()
			window.addEventListener('resize',this.resize.bind(this))
		}
		fetch(){
			return new Promise((success,error)=>{
				this.loaded = true
				return window.fetch(this.getAttribute('url'))
				             .then(response=>response.text())
				             .then(value=>{
					             set_video_base(this,value)
					             return success()
				             }).catch(error)
			})
		}
		get frame(){
			return {
				width:window.innerWidth,
				height:window.innerHeight
			}
		}
		resize(e){
			if(!this.video) return
			if(typeof this.timer === 'number'){
				window.clearTimeout(this.timer)
				delete this.timer
			}
			this.timer = window.setTimeout(()=>{
				delete this.timer
				this.video.size = this.frame
				
			})
		}
		toggle(){
			if(this.video){
				if(this.video.playing) this.video.stop()
				else this.video.play()
			}
		}
	}
	//shared actions
	function set_video_shadow(media){
		let shadow = media.shadow
		shadow.innerHTML = `
					<style>
						:host{
							perspective: 1000px;
						}
						:host([playing]) video{
							animation:rotate 5s infinite linear;
							transform-style: preserve-3d;
						}

						@keyframes rotate {
						  0%   {
							  transform:rotateX(0deg) rotateY(0deg);
							  filter:hue-rotate(0deg);
						   }
						  100% {
						      transform:rotateX(360deg) rotateY(360deg);
						      filter:hue-rotate(470deg);
						  }
						}
					</style>
				`;
		media.has_shadow=true
		return shadow
	}
	function set_video(video,media){
		video.style.position = 'relative'
		video.style.boxSizing = 'border-box'
		video.style.width = '100vw'
		video.style.height = 'cover'
		
		let video_item = {
			get playing(){ return media.hasAttribute('playing') },
			set playing(value){
				if(value === true) media.setAttribute('playing','')
				else media.removeAttribute('playing')
			},
			play(){
				video.muted=true
				this.playing = true
				video.play()
			},
			stop(){
				this.playing = false
				video.pause()
			},
			get size(){ return {width:video.width,height:video.height} },
			set size(size){}
		}
		video.addEventListener('canplaythrough',e=>{
			media.video.size = media.frame
			media.ready = true
			media.style.opacity = 1
			media.dispatchEvent(new CustomEvent('ready',{bubbles:true}))
			video_item.play()
		})
		return video_item
		
	}
	function set_video_source(media,source){
		if(!media.has_shadow){
			let shadow = set_video_shadow(media)
			let video = document.createElement('video')
			let video_source = document.createElement('source')
			video_source.src = source
			video.appendChild(video_source)
			media.video = set_video(video,media)
			shadow.appendChild(video)
		}
	}
	function set_video_base(media,video_text){
		if(!media.has_shadow){
			let shadow = set_video_shadow(media)
			let container = document.createElement('div')
			container.innerHTML = video_text
			let video = container.querySelector('video')
			media.video = set_video(video,media)
			shadow.appendChild(video)
		}
	}
	
})