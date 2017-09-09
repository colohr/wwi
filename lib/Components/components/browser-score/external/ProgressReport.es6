(function(get_progress_report){ return get_progress_report() })
(function(){
    return function export_progress_report(browser_score,fxy){
	    
    	//exports
	    return Base => class extends Base{
	    	get report_card(){ return get_report_card(fxy.browser.compatability) }
	    }
	    
	    //shared actions
	    function get_report_card( compatability ){
		
		    let classes = compatability
		    let subjects = Object.keys( classes )
		    let passed = subjects.filter(subject=>classes[subject] === true)
		    let failed = subjects.filter(subject=>classes[subject] === false)
		    let value = ( passed.length / subjects.length ) * 100
		    const teacher = {
			    comment(grade){
				    var comment = ''
				    let passed = grade >= 90 ? true:false
				    return {
					    passed,
					    says:passed ? 'Okie dokie':'You dumb fucky. A B C D E F G H I J K L M N O P Q R S T U V W X Y & Z.'
				    }
			    }
		    }
		
		    let card = {
			    get grade(){ return (this.value.toFixed(2))+'%' },
			    get ['passed?']() { return this.teacher.says },
			    teacher: teacher.comment( value ),
			    value
		    }
		
		    //stupifications
		    card.toString = function(){
			    return `
==============================================
-----------------Report Card------------------
School of Nobility of the Internets
--------------------------
Grade: ${card.grade.toFixed(2)}%
--------------------------
Passed subjects:
	${passed.join('\n\t')}
--------------------------
Failed subjects:
	${failed.join('\n\t')}
--------------------------
Passes? ${card['passed?']}
==============================================
`;
		    }
		
		    card.valueOf = function(){ return this.toString() }
		
		    return card
		
	    }
    }
})