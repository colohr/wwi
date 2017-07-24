wwi.exports('media',(media,fxy)=>{
	const is = fxy.is
	const metakeys = {
		"APIC": {},
		"COMM": {},
		"TALB": {},
		"TBPM": {},
		"TCOM": {},
		"TCON": {},
		"TCOP": {},
		"TENC": {},
		"TIT2": {},
		"TPE1": {},
		"TRCK": {},
		"TSSE": {},
		"TXXX": {},
		"TYER": {},
		"aART": {},
		"album": {},
		"artist": {},
		"comment": {
			name:'lyrics'
		},
		"genre": {},
		"lyrics": {},
		"picture": {
			name:'art'
		},
		"title": {},
		"track": {},
		"trkn": {
			name:'track'
		},
		"year": {},
		//"©ART": {},
		//"©alb": {},
		//"©day": {},
		//"©gen": {},
		//"©lyr": {},
		//"©nam": {},
		//"©too": {},
		//"©wrt:": {}
	}
	
	const metavalues = {
		"album": {
			is:'text'
		},
		"art":{
			is:'data'
		},
		"artist": {
			is:'text'
		},
		"genre": {
			is:'text'
		},
		"lyrics": {
			names:['comment','comment.text','lyrics','lyrics.lyrics'],
			is:'text'
		},
		"title": {
			is:'text'
		},
		"track": {
			names:['track','trkn'],
			is:'text'
		},
		"year": {
			is:'text'
		}
	}
	
	const get_data = (data)=>{
		
		let data_value = {}
		if(!fxy.is.data(data)) return data_value
		for(let key in data){
			let key_data = metakeys[key]
			if(key_data){
				let name
				if('name' in key_data) name = key_data.name
				else name = key
				
				let value_data = metavalues[name]
				if(value_data){
					let names = 'names' in value_data ? value_data.names:[name]
					let value = get_value_from_names(data,value_data.is,names)
					if(!fxy.is.nothing(value)){
						data_value[name] = value
					}
				}
			}
			
			
		}
		return data_value
	}
	
	function get_value_from_names(data,type,names){
		for(let name of names){
			let value = fxy.dot(name).value(data)
			if(type in is && is[type](value)){
				return value
			}
		}
		return null
	}
	
	
	class Metadata{
		constructor({data,identity}){
			let metadata = get_data(data.metadata)
			Object.assign(this,metadata)
			if(!('name' in this)) this.name =  identity.name.replace(`.${identity.type}`,'')
			if(!('title' in this)) this.title = fxy.id.proper(this.name)
			let tags = 'tags' in this && Array.isArray(this.tags) ? this.tags:[]
			if(this.title.toLowerCase().includes('instrumetal')){
				tags.push('instrumental')
				this.title = this.title.replace('instrumental','').replace('Instrumental','')
			}
			
			this.tags = tags
		}
	}
	
	media.metadata = function(metadata){ return new Metadata(metadata) }
	
})