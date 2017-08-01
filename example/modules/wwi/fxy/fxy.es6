(function(get_fxy){ return get_fxy() })
(function(){
    return function export_fxy({kit,port,source}){
        let folder = source.url(kit.modules,'wwi','fxy',)
        let class_url = source.url(folder,'fxy.class.es6')
        let files = [
            source.url(folder,'symbols.es6'),
            source.url(folder,'url.es6'),
	        source.url(folder,'uid.es6')
        ]
        //return value
        return load().then(_=>{
            return load_file(source.url(folder,'broadcast.es6'))
        }).catch(console.error)
        //shared actions
        function load(){
            return load_file(class_url).then(get_fxy=>get_fxy()).then(fxy=>{
                let promises = files.map(file=>load_file(file))
                return fxy.all(...promises)
            })
        }
        
        function load_file(file){
            return port.eval(file)
        }
    }
})