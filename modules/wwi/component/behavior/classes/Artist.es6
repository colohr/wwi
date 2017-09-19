window.fxy.exports('design',(design,fxy)=>{
	const artist = Symbol('Artist')
	const artist_gradients = Symbol('Artist Gradients')
	const artist_palettes = Symbol('Artist Palettes')
	const artist_palette = Symbol('Artist Palette')
	const artist_patterns = Symbol('Artist Patterns')
	
	
	class Artist extends Map{
		static get(element){ return artist in element ? element[artist]:element[artist] = new Artist() }
		constructor(){ super() }
		add(type,value){ return add_artist_value(this,type,value) }
		get colors(){ return fxy.require('design/colors') }
		get gradients(){ return get_gradients(this) }
		get palette(){ return get_palette(this) }
		set palette(palette){ return set_palette(this,palette) }
		get palettes(){ return get_palettes(this) }
		get patterns(){ return get_patterns(this) }
	}
	
	//exports
	design.artist = _ => new Artist()
	design.Artist = Artist
	
	//shared actions
	function get_gradients(artist){
		if(!artist.has(artist_gradients)) artist.set(artist_gradients,List())
		return artist.get(artist_gradients)
	}
	function get_palette(artist){
		if(!artist.has(artist_palette)) return null
		return artist.get(artist_palette)
	}
	function get_palettes(artist){
		if(!artist.has(artist_palettes)) artist.set(artist_palettes,List())
		return artist.get(artist_palettes)
	}
	function get_patterns(artist){
		if(!artist.has(artist_patterns)) artist.set(artist_patterns,List())
		return artist.get(artist_patterns)
	}
	
	function set_palette(artist,pallete){
		if(fxy.is.text(pallete)) pallete = artist.palettes[pallete]
		if(fxy.is.object(pallete)) artist.set(artist_palette,pallete)
		return get_palette(artist)
	}

})