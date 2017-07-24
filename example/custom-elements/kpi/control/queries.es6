wwi.exports('kpi',(kpi,fxy)=>{
	
	kpi.queries = {
		bank_names:`{bank_names}`,
		banks: `{
		  banks {
		    core
		    grade {
		      cardinal
		      key
		      level
		      position
		      school
		      title
		    }
		    key
		    language
		    name
		    sections {
		      bank
		      position
		      targets {
		        bank
		        items {
		          ditl
		          file
		          key
		          bank{
		            name
		          }
		        }
		        position
		        section
		        title
		      }
		      title
		    }
		    subject
		    title
		    type
		    version
		  }
		}`,
		item(bank,ditl){
			return `{
					item_versions_by_ditl(bank:"${bank}",ditl:"${ditl}"){
						original {
					      answer
					      bank
					      choices {
					        graphics {
					          class
					          src
					          tagName
					        }
					        name
					        text
					        type
					      }
					      feedback {
					        name
					        text
					        type
					      }
					      graphics {
					        class
					        src
					        tagName
					      }
					      info {
					        Name
					        Grade
					        Subject
					        Language
					        Type
					        Objective
					        Target
					        Randomize
					        DITL
					        Answer
					      }
					      passage {
					        id
					        name
					        text
					        type
					      }
					      question {
					        name
					        text
					        type
					      }
					    }
					    public {
					      answer
					      bank
					      choices {
					        graphics {
					          class
					          src
					          tagName
					        }
					        name
					        text
					        type
					      }
					      feedback {
					        name
					        text
					        type
					      }
					      graphics {
					        class
					        src
					        tagName
					      }
					      info {
					        Name
					        Grade
					        Subject
					        Language
					        Type
					        Objective
					        Target
					        Randomize
					        DITL
					        Answer
					      }
					      passage {
					        id
					        name
					        text
					        type
					      }
					      question {
					        name
					        text
					        type
					      }
					    }
					}
				}`
		},
		graphic_bank(bank){
			return `{
				graphic_bank(bank:"${bank}") {
				  name
				  graphics {
				    id
				    main_key
				    value
				    type
				  }
				  name
				  unused {
				    id
				    main_key
				    value
				    type
				  }
				  unused_key
				}
			}`
		}
	}
})