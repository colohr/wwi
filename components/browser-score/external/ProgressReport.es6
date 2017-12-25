(function(get_progress_report){ return get_progress_report() })
(function(){
    return function export_progress_report(browser_score,fxy){
	    
    	//exports
	    return Base => class extends Base{
	    	get report_card(){ return get_report_card(fxy.browser.compatibility) }
	    }
	    
	    //shared actions
	    function get_report_card( compatibility ){
		    let classes = compatibility
		    let subjects = Object.keys( classes )
		    let passed = subjects.filter(subject=>classes[subject] === true)
		    let failed = subjects.filter(subject=>classes[subject] === false)
		    let value = ( passed.length / subjects.length ) * 100
		    return {
			    get grade(){ return (this.value.toFixed(2))+'%' },
			    failed,
			    value
		    }
	    }
    }
})