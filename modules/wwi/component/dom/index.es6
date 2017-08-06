(function(get_dom){ return get_dom() })
(function(){
	return {
		mixins:[
			'module.es6',
			'app.es6',
			'page.es6'
		],
		main:'creator.es6',
		elements:[
			'elements/button.es6'
		]
	}
    //return function export_dom(loader){
    //
	 //   let files = [
		//    'creator.es6'
	 //   ]
	 //   let loads =
	 //   let loads = {
		//    dom:['module.es6','app.es6','page.es6','creator.es6'],
		//    design:['design.es6'],
		//    dom2:['button.es6']
	 //   }
    //
	 //   let dom_url = window.url.component('dom')
    //    return
    //}
})