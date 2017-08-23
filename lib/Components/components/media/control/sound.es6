(function(get_sound,export_sound){ return export_sound(get_sound()) })
(function(){
	const app = window.app
	const fxy = window.fxy
	const AudioEvents = [
		'abort',
		'canplay',
		'durationchange',
		'ended',
		'error',
		'loadeddata',
		'loadedmetadata',
		'loadstart',
		'pause',
		'play',
		'playing',
		'progress',
		'seeked',
		'seeking',
		'timeupdate',
		'volumechange',
		'waiting'
	]
	const library = fxy.require('media/library')
	const get_metadata = fxy.require('media/metadata')
	const SoundLibrary = library.data
	const played = Symbol.for('audio has been played')
	
	return app.port.eval(window.url.elements('media/control/logic/tags.es6')).then(tags=>{
	
		class MediaSound extends Map {
			static get tags(){ return get_audio_tags }
			constructor(element) {
				super([['element',element]])
				this.url = element.url
				this.identity = app.source.identity(this.url)
			}
			get audio() { return this.has('audio') ? this.get('audio'):null }
			set audio(sound_data){
				let container = document.createDocumentFragment()
				let audio = new Audio(sound_data.source)
				this.set('audio',audio)
				for (let type of AudioEvents) audio.addEventListener(type, this.dispatch.bind(this), true)
				container.appendChild(audio)
				this.element.dispatch('sound',this)
				return audio
			}
			get data(){ return SoundLibrary.get(this.id) }
			get data_type() { return get_data_type(this.has('audio') ? this.get('audio').currentSrc : null) }
			disconnect(){
				let audio = this.audio
				if(audio){
					for (let type of AudioEvents) audio.removeEventListener(type, this.dispatch.bind(this), true)
				}
				return this
			}
			dispatch(event) {
				const get_time = fxy.require('media/time')
				let type = event.type.replace('change', '').replace('loaded', '').replace('update', '')
				let element = this.get('element')
				let data
				switch (type) {
					case 'duration':
						data = get_time(this.duration)
						break
					case 'metadata':
						data = {
							data:this.metadata,
							title:this.title
						}
						break
					case 'time':
						data = get_time(event.currentTarget.currentTime,true)
						break
					
				}
				return element.dispatch(type, data)
			}
			get duration(){ return this.audio !== null ? this.audio.duration:0 }
			get element(){ return this.get('element') }
			get id(){ return this.identity.id }
			get metadata(){ return 'data' in this ? this.data.metadata:{} }
			get name(){
				return this.metadata.name
				return this.identity.name.replace(`.${this.identity.type}`,'')
			}
			get playing() {
				let audio = this.audio
				if (audio) {
					if (played in audio) return !audio.paused
					else audio[played] = true
				}
				return false
			}
			play(){
				library.playing = this
				let audio = this.audio
				audio.play()
				let element = this.element
				if(element){
					let playback = element.playback
					if(playback) playback.button.state = 'pause'
					element.setAttribute('playing','')
				}
				
				return this
			}
			stop(){
				let audio = this.audio
				audio.pause()
				let element = this.element
				if(element){
					let playback = element.playback
					if(playback) playback.button.state = 'play'
					element.removeAttribute('playing')
				}
				return this
			}
			get title(){ return this.metadata.title}
		}
		
		
		
		return get_media_sound
		
		function get_data_type(text) {
			const types = { mp3: 'audio/mpeg', ogg: 'audio/ogg' }
			if (fxy.is.text(text)) {
				for (let name in types) {
					if (text.includes(name)) return {name, value: types[name]}
				}
			}
			return null
		}
		
		function get_media_sound(element){ return set_sound_element(new MediaSound(element)) }
		
		get_media_sound.get = function(url){
			let identity = app.source.identity(url)
			if(SoundLibrary.has(identity.id)) return SoundLibrary.get(identity.id)
			return null
		}
		
		function load_audio_data(audio_url) {
			return new Promise((success, error) => {
				let loader = get_audio_file_type_loader(audio_url)
				return loader.then(success).catch(error)
				
				function get_audio_file_type_loader(audio_url){
					return new Promise((success,error)=>{
						let type = app.source.type(audio_url,'song')
						switch(type){
							case 'song':
								return window.fetch(audio_url)
								             .then(result => result.json())
								             .then(success)
								             .catch(error)
								break
							default:
								if(!type) return error(new Error(`Audio source type is invalid`))
								let name = app.source.file(audio_url).replace(`.${type}`,'')
								return get_audio_tags(audio_url).then(metadata=>{
									return success({metadata, name, source:audio_url})
								}).catch(error)
						}
					})
					
				}
				
				function get_audio_tags(url){
					return new Promise((success,error)=>{
						return tags.read(url,{
							onSuccess(result) {return success(result.tags)},
							onError(e) {return error(e)}
						});
					})
				}
			})
		}
		
		function set_sound_element(media_audio){
			let media_url = media_audio.url
			let id = media_audio.id
			if(SoundLibrary.has(media_audio.id)){
				media_audio.audio = SoundLibrary.get(media_audio.id)
			}
			else{
				load_audio_data(media_url).then(function(sound_data){
					sound_data.metadata = get_metadata({identity:media_audio.identity,data:sound_data})
					media_audio.audio = SoundLibrary.set(id,sound_data).get(id)
					
				}).catch(console.error)
			}
			return media_audio
			
			
		}
		
	})
	
},function wwi_export(sound_promise){
	
	wwi.exports('media',(media)=>{
		sound_promise.then(Sound=>{
			media.Sound = Sound
		})
		
	})
})