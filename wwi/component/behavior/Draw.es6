(function(position){ return position() })
(function(){
	return function external_module(behavior,fxy){
		
	
		//export
		return window.app.port
		             .eval(window.url.component('behavior/logic/artist.es6'))
		             .then(get_artist=>get_artist(fxy)).then(export_draw_tool)
		
		//shared actions
		function export_draw_tool(Artist){
			
			behavior.Draw = Base => class extends Base{
				get artist(){ return Artist.get(this) }
				get canvas(){
					let canvas = this.query('[canvas-view]')
					if(!canvas.sized){
						canvas.height = this.height
						canvas.width = this.width
						canvas.sized = true
					}
					return canvas
				}
				get draw(){ return get_drawing_tool(this.canvas,this) }
			}
			
			
			function get_drawing_tool(canvas,element){
				const tool = new Proxy({
					canvas,
					clear(){ return this.context.clearRect(0, 0, this.width, this.height) },
					get color(){ return { stroke:this.element.stroke,  fill:this.element.fill } },
					get context(){ return this.canvas.getContext('2d')},
					element,
					get height(){ return this.canvas.height },
					position(...x){ return fxy.require('tool/xy-position')(...x) },
					travel(...x){ return fxy.require('tool/travel')(...x) },
					get width(){ return this.canvas.width }
				},{
					get(o,name){
						let value = fxy.require('tool/proxy-value')(name,o)
						if(value) return value
						switch(name){
							case 'circle':
								return (position,...options)=>{
									o.context.beginPath()
									let circle = [position.x,position.y].concat(options)
									if(circle.length === 2) circle.push(5)
									if(circle.length === 3) circle.push(0)
									if(circle.length === 4) circle.push(2*Math.PI)
									if(o.color.stroke) o.context.strokeStyle = o.color.stroke
									o.context.arc(...circle)
									return tool
								}
								break
							case 'fill':
								if(o.color.fill) o.context.fillStyle = o.color.fill
								o.context.fill()
								return tool
								break
							case 'line':
								return (from,to)=>{
									o.context.moveTo(from.x,from.y)
									o.context.lineTo(to.x,to.y)
									if(o.color.stroke) o.context.strokeStyle = o.color.stroke
									o.context.stroke()
									return tool
								}
								break
							
							case 'start':
								o.clear()
								return tool
								break
							case 'stroke':
								if(o.color.stroke) o.context.strokeStyle = o.color.stroke
								o.context.stroke()
								return tool
								break
						}
					}
				})
				return tool
			}
		}
		
	}
	
})

