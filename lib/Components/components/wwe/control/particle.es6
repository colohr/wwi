wwi.exports('wwe', (wwe,fxy) => {

	let current_canvas
	
	const tools = {
		getAngle: function (t, n) {
			var a = n.x - t.x, e = n.y - t.y;
			return Math.atan2(e, a) / Math.PI * 180
		}, getDistance: function (t, n) {
			var a = t.x - n.x, e = t.y - n.y;
			return Math.sqrt(a * a + e * e)
		}, moveOnAngle: function (t, n) {
			var a = this.getOneFrameDistance(t, n);
			t.x += a.x, t.y += a.y
		}, getOneFrameDistance: function (t, n) {
			return {x: n * Math.cos(t.rotation * Math.PI / 180), y: n * Math.sin(t.rotation * Math.PI / 180)}
		}
	}
	
	class ParticleEmitter {
		static get tools(){ return tools }
		constructor(options) {
			this.options = typeof options === "object" && options !== null ? options : {
				color: [0, 255],
				count: 25,
				friction: 0.9,
				gravity: 0.1,
				opacity: [0, 0.5, true],
				radius: [10, 20],
				rotation: [0, 360, true],
				size:200,
				speed: [8, 12],
				velocity: 0
			}
			this.keys = Object.keys(this.options)
		}
		get count(){ return this.options.count }
		get color() {
			return `rgb(${r(...this.options.color)},${r(...this.options.color)},${r(...this.options.color)})`
		}
		
		get gravity() {
			return this.options.gravity
		}
		
		get friction() {
			return this.options.friction
		}
		
		get opacity() {
			return r(...this.options.opacity)
		}
		
		
		
		get radius() {
			return r(...this.options.radius)
		}
		
		get ratio(){ return window.devicePixelRatio }
		
		get rotation() {
			return r(...this.options.rotation)
		}
		
		get speed() {
			return r(...this.options.speed)
		}
		
		get velocity() {
			return this.options.velocity
		}
		
		particle(canvas) {
			let particle = {
				x: canvas.width / 2,
				y: canvas.height / 2,
			}
			for (let key of this.keys) particle[key] = this[key]
			return particle
		}
		
		canvas(element,{x,y}) {
			let canvas = document.createElement('canvas')
			canvas.style.position = 'absolute'
			this.current_color = get_color(element)
			document.body.appendChild(canvas)
			canvas.style.left = (x - this.size/2) + 'px'
			canvas.style.top = (y - this.size/2) + 'px'
			canvas.style.pointerEvents = 'none'
			canvas.style.width = this.size + 'px'
			canvas.style.height = this.size + 'px'
			canvas.style.zIndex = '1000'
			canvas.width = this.size * this.ratio
			canvas.height = this.size * this.ratio
			return this.current_canvas = canvas
		}
		get current_canvas(){ return current_canvas }
		set current_canvas(canvas){ return current_canvas = canvas}
		
		particles() {
			let particles = []
			for (var i = 0; ++i < this.count;) particles.push(this.particle(this.current_canvas))
			return particles
		}
		get size(){ return this.options.size }
		render(ctx,particles,width,height){
			let current_color = this.current_color
			return function render() {
				ctx.clearRect(0, 0, width, height)
				particles.forEach(function (p, i) {
					tools.moveOnAngle(p, p.speed)
					if ('opacity' in p) {
						p.opacity -= 0.01
						if (p.opacity < 0) return;
						if (p.radius < 0) return;
						ctx.globalAlpha = p.opacity
					}
					if ('speed' in p) p.speed *= p.friction
					if ('radius' in p) p.radius *= p.friction
					if ('velocity' in p) {
						p.velocity += p.gravity
						p.y += p.velocity
					}
					ctx.beginPath()
					ctx.fillStyle = current_color || "#5293ff"
					ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false)
					ctx.fill()
				})
			}
			
		}
		event(e) {
			let center = get_center(e)
			let element = e.currentTarget || e.target
			let pointer_name = element.getAttribute('pointer')
			let pointer = ParticleEmitter[pointer_name]
			
			if('before_render' in pointer) pointer.before_render(element)
			let canvas = pointer.canvas(element,center)
			let ctx = canvas.getContext('2d')
			let particles = pointer.particles()
			let render = pointer.render(ctx,particles,canvas.width,canvas.height);
	
				
             (function renderLoop() {
                 requestAnimationFrame(renderLoop)
                 render()
             })();
             
			setTimeout(function () {
				document.body.removeChild(canvas)
				pointer.current_canvas = null;
			}, 3000);
			
			
		}
	}
	
	
	ParticleEmitter.explode = new ParticleEmitter()
	fxy.require('element/pointer').set('explode', ParticleEmitter.explode.event.bind(ParticleEmitter.explode))
	
	wwe.ParticleEmitter = ParticleEmitter
	
	
	
	function get_center(e) {
		let element = e.currentTarget || e.target
		let x = 'clientX' in e ? e.clientX : (element.offsetLeft + (element.clientWidth / 2))
		let y = 'clientY' in e ? e.clientY : (element.offsetTop + (element.clientHeight / 2))
		return {x, y}
	}
	

	function get_color(element) {
		let color = 'rgba(100,100,100,0.5)'
		if (element) {
			if ('event_color' in element) return element.event_color
			else if (element.hasAttribute('event-color')) color = element.getAttribute('event-color')
			let computed_style = window.getComputedStyle(element)
			if (computed_style.backgroundColor && computed_style.backgroundColor !== 'rgba(0, 0, 0, 0)') return computed_style.backgroundColor
			else if (computed_style.color) return computed_style.color
			else if (computed_style.borderColor) return computed_style.borderColor
		}
		return color
	}
	
	function r(a, b, c) {
		return parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0))
	}
	
	
	
})