window.fxy.exports('art',(art,fxy)=>{
	
	const tags = {
		color:fxy.tag`rgba(${'red'},${'green'},${'blue'},${'transparency'}) ${'position'}`,
		radial:fxy.tag`radial-gradient(${'axis'} ${'origin'},${'colors'})`,
		linear:fxy.tag`linear-gradient(${'axis'} ${'origin'} ${'rotation'},${'colors'})`
	}
	
	class GradientColor extends (fxy.require('design/Color')){
		constructor(color,position){
			super(color)
			this.position = position
		}
	}
	
	class Gradient{
		constructor(...items){
			this.angle = null
			this.axis = 'to'
			this.items = items.map(item=>new GradientColor(item.color,item.position))
			this.origin = 'right'
			this.type = 'linear'
			this.side = 'right'
			
		}
		get colors(){ return this.items.map(color=>tags.color(color)) }
		get rule(){ return tags[this.type](this) }
		get rotation(){
			if(fxy.is.number(this.angle)) return `${this.angle}deg`
			return ''
		}
		toString(){
			return this.rule
		}
	}
	
	class LinearGradient extends Gradient{
		constructor(...colors){
			super('linear',...colors)
		}
	}
	
	class RadialGradient extends Gradient{
		constructor(...colors){
			super(...colors)
			this.type = 'radial'
			this.origin = 'ellipsis at center'
		}
	}
	
	//exports
	art.css.linear_gradient = (...x)=>new LinearGradient(...x)
	art.css.radial_gradient = (...x)=>new RadialGradient(...x)
	
	
	
	
	
})