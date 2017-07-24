(function(travel){ return travel() })
(function(){
    return function get_travel(start,e){
	    let end = fxy.require('tool/xy-position')(e)
	    let x = end.x - start.x
	    let y = end.y - start.y
	    let x_axis = x < 0 ? -1*x:x
	    let y_axis = y < 0 ? -1*y:y
	    let axis = { x:x_axis, y:y_axis }
	    if(y_axis === x_axis) axis.center = true
	    else if(x_axis > y_axis) axis.horizontal = true
	    else if(y_axis > x_axis) axis.vertical = true
	    return {
		    axis,
		    end,
		    offset:{x, y},
		    get direction(){
			    let travel = this
			    if(travel.axis.horizontal) return travel.offset.x <= 0 ? 'left':'right'
			    else if(travel.axis.vertical) return travel.offset.y <= 0 ? 'top':'down'
			    return 'center'
		    },
		    start
	    }
    }
})