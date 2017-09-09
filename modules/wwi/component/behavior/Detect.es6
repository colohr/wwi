(function(get_detect){ return get_detect() })
(function(){
    return function export_detect(behavior,fxy){
        const Detect = Base => class extends Base{
        	get detector(){ return fxy.require('data/detect').component(this) }
        }
        //load
	    return load()
        //shared actions
        function load(){
        	if(!fxy.is.nothing(fxy.require('data/detect'))) return Detect
	        fxy.port.eval(window.url.modules.logic('detect.es6')).then(_=>behavior.Detect=Detect)
	        return null
        }
    }
})