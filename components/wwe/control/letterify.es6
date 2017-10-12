wwi.exports('wwe',(wwe,fxy)=>{
	let current_text = ''
	let current_canvas = null
	let current_letter = 0
	
	class LetterifyEmitter extends wwe.ParticleEmitter{
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
		get gravity(){ return app.help.numbers.rand(-0.1, 0.5) }
		get ratio(){ return window.devicePixelRatio * 0.75 }
		get radius(){ return app.help.numbers.rand(1, 25) }
		get current_canvas(){ return current_canvas }
		set current_canvas(canvas){ return current_canvas = canvas}
		before_render(element){
			let text = 'letterify' in element ? element.letterify : element.textContent
			current_text = text.replace(/ /g, '')
			return this
		}
		render(ctx,particles,width,height){
			current_letter = 0
			return function render() {
				ctx.clearRect(0, 0, width, height)
				particles.forEach(function (p, i) {
					wwe.ParticleEmitter.tools.moveOnAngle(p, p.speed)
					p.speed *= p.friction
					p.radius *= p.friction
					p.velocity += p.gravity
					p.y += p.velocity
					if (p.radius < 0) return
					ctx.beginPath()
					ctx.fillStyle = wwi.modules.design.colors.random()
					ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false)
					ctx.font = `${app.help.numbers.random(5, 45)}px Arial`;
					ctx.fillText(get_text(), p.x, p.y)
					ctx.fill()
				})
			}
		}
	}
	
	
	wwe.ParticleEmitter.letterify = new LetterifyEmitter()
	
	fxy.require('element/pointer').set('letterify', wwe.ParticleEmitter.letterify.event)
	
	
	function get_text(i) {
		var l
		if (current_letter < current_text.length) {}
		else current_letter = 0
		l = current_text[current_letter]
		current_letter++
		return l
	}

	
})