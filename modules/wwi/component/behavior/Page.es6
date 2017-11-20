(function(get_page){ return get_page() })
(function(){
    return function export_page(behavior,fxy){
	
	    //exports
	    //dom.Page = Page
    	return Base=>class extends Base{
		    constructor(...x){
			    super(...x)
			    this.addEventListener('animationend', app_page_transitioned.bind(this), false)
			    this.at('app-page')
		    }
		    get page_data(){ return get_page_data(this) }
	    }
	
	    
	
	    //shared actions
	    function app_page_transitioned(e){
		    let page = e.currentTarget
		    if('transitioned' in page) page.transitioned(e)
	    }
	    function get_page_data(element){
	        let attributes = Array.from(element.attributes)
		    let data = fxy.is.data(element.constructor.data) ? element.constructor.data:{}
		    for(let item of attributes){
	        	let name = item.name
                if(name.includes('page-')){
                    name = fxy.id._(name.replace('page-',''))
			        let value = get_page_data_value(item)
			        if(value === '' || value === 'true') value = true
			        else if(value === 'false') value = false
			        data[name] = value
		        }
		    }
		    let name = data.name || element.localName.replace('-page','')
		    if(!('title' in data)) data.title = name.replace(/-/g,' ')
		    if(!('name' in data)) data.name = fxy.id._(name)
		    return data
	    }
	    function get_page_data_value(item){
		    let value = item.value
		    if(value === '' || value === 'true') value = true
		    else if(value === 'false') value = false
		    else if(value.includes('=')){
		    	let data = {}
		    	let values = fxy.inputs(value).map(x=>x.split('='))
			    for(let x of values) {
		    		let y = x[1]
				    if(y === 'null') y = null
				    else if(y === 'true') y = true
				    else if(y === 'false') y = false
		    		data[x[0]] = fxy.is.nothing(y) ? '':y
			    }
			    value = data
		    }
		    return value
	    }
    }
})