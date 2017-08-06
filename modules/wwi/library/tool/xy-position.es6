(function(xy_position){ return xy_position() })
(function(){
    return function get_xy_position(x,y){
	    if(x instanceof Event){
		    y = x.offsetY
		    x = x.offsetX
	    }
	    else if(typeof x === 'object' && x !== null && 'x' in x) return x
	    return {x,y}
    }
})