(function(get_element){ return get_element() })
(function(){
    return function export_element(snappy,fxy){
        //external
        return Base => class extends Base{
	        add(...items){
	        	let snappy = this.snappy
		        let first = items[0]
		        let loading= false
		        if(!this.loaded && first){
	        		let img = first.querySelector('img')
			        if(img){
				        img.onload = e=>{
				        	this.loaded=true
					        snappy.style().actions()
				        }
				        loading=true
			        }
		        }
		        items.forEach(item=>snappy.container.appendChild(item))
		        if(!loading) snappy.style().actions()
		        return this
	        }
	        connected(){
	        	window.app.on('resized',e=>this.reset())
	        }
	        reset(){
		        if('snappy_grid' in this) this.add(...(this.snappy.reset()))
		        return this
	        }
	        get snappy(){
		        if('snappy_grid' in this) return this.snappy_grid
		        return this.snappy_grid = fxy.require('snappy/grid')(this)
	        }
        }
    }
})