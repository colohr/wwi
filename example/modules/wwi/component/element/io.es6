wwi.exports('element',(element,fxy) => {
	
	const io_data = Symbol.for('IO Data Storage Map')
	const io_storage_key = Symbol.for('IO Data Storage Map Key')
	
	
	element.io = Base => class extends Base{
		get io_storage(){ return io_storage(this) }
		io_get_data( request ){ return io_get_data( request, this ) }
		io_set_data( request ){ return io_set_data( request, this ) }
	}
	
	//---------shared actions----------
	function io_get_data( io_request, element ){
		let io_get = element.io_render_get( io_request )
		let io_key = io_storage_clean_key( io_get )
		if( element.io_storage.has( io_key ) ) return element.io_data_update( element.io_storage.get( io_key ) )
		return app.cloud.io.get( `{${io_get}}` )
		          .then(io_get_data_value)
		          .then(data=>io_storage_save( io_key, data, element ))
		          .catch(error=>{ console.error(error) })
	}
	
	function io_get_data_value( result ){
		if(fxy.is.nothing(result)) return null
		let name = Object.keys(result)
		return result[name]
	}
	
	function io_storage(element){
		if(io_data in element) return element[io_data]
		return element[io_data] = new Map()
	}
	
	function io_storage_clean_key( key ){
		return key.replace(/ /g,'').replace(/\n/g,' ').replace(/\t/g,'')
	}
	
	function io_storage_save( key, data, element ){
		data[io_storage_key] = key
		return element.io_data_update( element.io_storage.set( key, data ).get(key) )
	}
	
})