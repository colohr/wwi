wwi.exports('media',(media,fxy)=>{
	
	const playing = Symbol.for('audio playing')
	const Library = {
		get playing(){return this[playing]},
		set playing(sound){ return set_audio_is_playing(sound) }
	}
	Library.data = new Map()
	
	
	
	media.library = Library
	
	
	function set_audio_is_playing(sound){
		let current = Library[playing]
		if(current) current.stop()
		if(fxy.is.nothing(sound)) delete Library[playing]
		Library[playing] = sound
		app.fire('media library',{library:Library,value:Library[playing],name:'playing'})
		return Library[playing]
	}
	
})