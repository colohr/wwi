window.fxy.exports('art',(art,fxy)=>{
	class Canvas{
		static element(...x){ return new Canvas(...x) }
		static get gradient_border(){ return gradient_border }
		constructor(view){
			this.view  = view
		}
		get center(){
			return {
				x:this.width/2,
				y:this.height/2
			}
		}
		get context(){ return this.view.getContext('2d') }
		get height(){ return this.size.height }
		get set(){ return get_canvas_set(this) }
		get size(){ return this.view.getBoundingClientRect() }
		get width(){ return this.size.width }
	}
	
	//exports
	art.canvas = Canvas
	
	//shared actions
	function clear_canvas(canvas){
		canvas.context.clearRect(0,0,canvas.width,canvas.height)
		return canvas
	}
	
	function create_linear_gradient(canvas,colors){
		let context = canvas.context
		let gradient = context.createLinearGradient(0, 0, canvas.width, 0)
		let count = colors.length
		let increment = 1 / count
		for(let i=0;i<count;i++){
			let color = colors[i]
			let position = i * increment
			gradient.addColorStop(position,color)
		}
		return gradient
	}
	
	function create_radial_gradient(canvas,colors){
		let context = canvas.context
		let center = canvas.center
		let gradient = context.createRadialGradient(center.x, center.y, canvas.width/2, center.x, center.y, 0)
	    //var g2 = ctx.createRadialGradient(350, 100, 0, 350, 100, 200);
		let count = colors.length
		let increment = 1 / count
		for(let i=0;i<count;i++){
			let color = colors[i]
			let position = i * increment
			gradient.addColorStop(position,color)
		}
		return gradient
	}
	
	function fill_gradient_border(canvas,gradient,options){
		if(!fxy.is.data(options)) options = {}
		let context = canvas.context
		context.fillStyle = canvas.context.createPattern(canvas.view, options.pattern || "repeat")
		context.fillRect(0,0,canvas.width,canvas.height)
		context.lineWidth = options.width || 20
		context.strokeStyle = gradient
		context.strokeRect(0,0,canvas.width,canvas.height)
		context.fill()
		return canvas
	}
	
	function get_canvas_set(canvas){
		return new Proxy(canvas,{
			get(o,name){
				switch(name){
					case 'gradient_border':
						return (colors,options)=>gradient_border(o,colors,canvas)
						break
				}
				return null
			}
		})
	}
	
	function gradient_border(canvas,colors,options){
		let gradient_type = fxy.is.data(options) ? options.gradient || 'linear':null
		let gradient = null
		if(gradient_type === 'radial') gradient = create_radial_gradient(clear_canvas(canvas),colors)
		else gradient = create_linear_gradient(clear_canvas(canvas),colors)
		return fill_gradient_border(canvas,gradient,options)
	}
	
	//function gradient(canvas,colors){
		//let ctx = canvas.getContext('2d')
		//let width = size.width
		//let g1 = ctx.createLinearGradient(0, 0, width, 0);
		//ctx.clearRect(0,0,width,size.height)
		
		
		//		    g1.addColorStop(0,"magenta");
		//		    g1.addColorStop(0.5,"yellow");
		//		    g1.addColorStop(1,"black");
		//		    ctx.fillStyle = g1;
		//		    ctx.strokeStyle = "red";
		//		    ctx.lineWidth = 10;
		//		    ctx.fillRect(0, 0, 50, 50);
		//		    ctx.strokeRect(0, 0, 50, 50);
		
		
		
		//let pattern = ctx.createPattern(canvas, "repeat");
		//ctx.fillStyle = pattern;
		//ctx.fillRect(0,0,width,size.height);
		//ctx.lineWidth = 20;
		//ctx.strokeStyle = g1;
		//ctx.strokeRect(0,0,width,size.height);
		//ctx.fill();
		//return pattern
	//}
	
})