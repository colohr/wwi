(function(silly_string){ return silly_string() })
(function(){
    return window.silly = function silly(x) {
	
	    if(typeof x === 'object' && x !== null){
		    try{
			    x = JSON.stringify(x,null, 2)
		    }
		    catch(e){
			    return console.log(x)
		    }
	    }
	    if(typeof x !== 'string') return console.table(x)
	    let chars = x.split('')
	    let colors = ['blue','rgb(30,210,100)','red','orange','rgb(180,20,240)']
	    let current = -1
	    let log = {
		    chars:[],
		    colors:[]
	    }
	    for(let i=0;i<chars.length;i++){
		    let char = chars[i]
		    current = current + 1
		    if(current >= colors.length) current = 0
		    if(char.trim().length){
			    let color = colors[current]
			    let bg = colors.reverse()[current]
			    log.chars.push(`%c${char}`)
			    log.colors.push(`color:white;font-weight:normal;padding:0px 3px 0px 3px;background-color:${bg};border-radius:10px;`)
		    }else{
			    log.chars.push(`%c${char}`)
			    log.colors.push('color:normal;')
		    }
		
	    }
	    let silliness = [log.chars.join('')].concat(log.colors)
	    console.log(...silliness)
	
    }
})
