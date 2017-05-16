(function(edus){ return edus() })
(function(){
    return function get_edus({ app, fxy, url }){

        let edus_dots = [app.kit.path,'edus','modules','wwi']
        let identity = app.source.identity(url)
        let parts = app.source.parts(app.source.dir(url))
        let dot_notation = parts.filter(part=>!edus_dots.includes(part)).join('.')
        
        return  identity.type !== 'es6' &&
                identity.type !== 'js' ?
                app.port(url) :
                app.port.eval(url).then(result=>{
                    return {
	                    get dot_value(){ return app.dotted(app.window,dot_notation) },
                        get name(){ return identity.name.replace(`.${identity.type}`,'') },
	                    result,
                        get value(){
	                        let dot_value = this.dot_value
	                        let value = null
                            if(fxy.is.function(this.result)){
                                value = this.result(dot_value)
                            }
                            else value = this.result
                            if(fxy.is.object(dot_value)){
		                        dot_value[this.name] = value
	                        }
                            return value
                        }
                    }
                })
    }
})