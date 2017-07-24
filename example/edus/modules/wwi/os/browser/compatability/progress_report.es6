(function(report_card){ return report_card() })
(function(){
	
    return function get_report_card_from_browser_compatability( compatability ){
	
	    return get_report_card(compatability)
	
	    function get_report_card( compatability ){
		
		    let classes = compatability
		    let subjects = Object.keys( classes )
		    let passed = subjects.filter(subject=>classes[subject] === true)
		    let failed = subjects.filter(subject=>classes[subject] === false)
		    let grade = ( passed.length / subjects.length ) * 100
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
			    grade,
			    get ['passed?']() { return this.teacher.says },
			    teacher: teacher.comment( grade )
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