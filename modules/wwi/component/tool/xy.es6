window.fxy.exports('tool',(tool)=>{
	//exports
	tool.xy = new Proxy(get_xy,{
		get(o,name){
			if(name === 'travel') return get_travel
			if(name in o) return o[name]
			return null
		}
	})
	
	//shared actions
	function get_travel(start,e){
		let end = get_xy(e)
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
				else if(travel.axis.vertical) return travel.offset.y <= 0 ? 'up':'down'
				return 'center'
			},
			start
		}
	}
	function get_xy(x,y){
		if(x instanceof Event){
			y = x.offsetY
			x = x.offsetX
		}
		else if(typeof x === 'object' && x !== null && 'x' in x) return x
		return {x,y}
	}
})
