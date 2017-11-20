window.fxy.exports('gui',(gui,fxy)=>{
	let current_text = ''
	let current_canvas = null
	let current_letter = 0
	
	class LetterifyEmitter extends gui.ParticleEmitter{
		constructor(){
			super({
				count: 35,
				friction: 0.95,
				gravity: [-0.1, 0.5],
				radius: [1, 25],
				rotation: [0, 360, true],
				size:500,
				speed: [8, 12],
				velocity: 0
			})
		}
		before_render(element){
			let text = 'letterify' in element ? element.letterify : element.textContent
			current_text = text.replace(/ /g, '')
			return this
		}
		get current_canvas(){ return current_canvas }
		set current_canvas(canvas){ return current_canvas = canvas}
		get gravity(){ return fxy.random.decimal(-0.1, 0.5) }
		get ratio(){ return window.devicePixelRatio * 0.75 }
		get radius(){ return fxy.random.decimal(1, 25) }
		render(ctx,particles,width,height){
			current_letter = 0
			return function render() {
				ctx.clearRect(0, 0, width, height)
				particles.forEach(function (p, i) {
					gui.ParticleEmitter.tools.moveOnAngle(p, p.speed)
					p.speed *= p.friction
					p.radius *= p.friction
					p.velocity += p.gravity
					p.y += p.velocity
					if (p.radius < 0) return
					ctx.beginPath()
					ctx.fillStyle = fxy.modules.design.colors.random()
					ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false)
					ctx.font = `${fxy.random(5, 45)}px Arial`;
					ctx.fillText(get_text(), p.x, p.y)
					ctx.fill()
				})
			}
		}
	}
	
	//exports
	gui.ParticleEmitter.letterify = new LetterifyEmitter()
	fxy.require('element/pointer').set('letterify', gui.ParticleEmitter.letterify.event)
	
	//shared actions
	function get_text(i) {
		let l
		if (current_letter < current_text.length) {}
		else current_letter = 0
		l = current_text[current_letter]
		current_letter++
		return l
	}

	
})