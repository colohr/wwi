wwi.exports('media',(media,fxy)=>{
	const media_listener = Symbol.for('media event listener')
	const media_playlist = Symbol.for('media playlist')
	
	class Playlist extends Map{
		constructor(playlist_data){
			super()
			this.update_data(playlist_data)
			
		}
		get data(){ return this.get('data') }
		set data(playlist_data){
			if(fxy.is.data(playlist_data)) {
				this.set('data',playlist_data)
				//if(media_listener in this){
				//	let listener = this.listener
				//	if(listener.has_listener && listener.listener.has('data')){
				//		return listener.dispatch('data',playlist_data)
				//	}
				//}
			}
			return playlist_data
		}
		from_media_player(media_player){
			let items = media_player.items
			if(Array.isArray(items)) return this.update(...items)
			return this
			
		}
		get listener(){
			if(media_listener in this) return this[media_listener]
			this[media_listener] = document.createElement('media-listener')
			return this[media_listener]
		}
		get loaded(){return this.has('data') }
		on(name,listener){
			if(this.has(name)) {
				return listener(new CustomEvent(name,{
					bubbles:true,
					detail:this.get(name)
				}))
			}
			return this.listener.on(name,listener)
		}
		update(...items){
			console.log({playlist_items:items})
			let data = this.has('data') ? this.get('data'):{items:[]}
			items.map(item=>item.url).forEach(url=>{
				if(!data.items.includes(url)) data.items.push(url)
			})
			this.data = data
			return this
		}
		update_data(playlist_data){
			let data = this.data || {title:'Playlist',items:[]}
			if(fxy.is.data(playlist_data)){
				for(let name in playlist_data){
					if(name in data && typeof data[name] === typeof playlist_data[name]){
						data[name] = playlist_data
					}
				}
			}
			return this.data = data
		}
		
	}
	
	create_playlist.Playlist = Playlist
	create_playlist.Mix = Base => class extends Base{
		get playlist(){
			if(media_playlist in this) return this[media_playlist]
			return this[media_playlist] = create_playlist(null).from_media_player(this)
		}
		set playlist(value){
			return this[media_playlist] = value
		}
	}
	media.Playlist = Playlist
	media.playlist = create_playlist
	
	function create_playlist(source){
		let playlist = new Playlist(source)
		if(fxy.is.text(source)) load_playlist_data(playlist,source)
		return playlist
	}
	
	function load_playlist_data(playlist,source){
		window.fetch(source).then(response=>response.json()).then(playlist_data=>{
			return playlist.data = playlist_data
		}).catch(e=>{
			console.error( `Error loading Playlist data from source`)
			console.error(e)
		})
	}
	
	wwi.define('media-listener', class extends fxy.require('dom/basics').Element{

	})
	
})