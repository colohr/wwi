(function setup(setup_color,setup_gradient,setup_module,window){
	let Color = setup_color(window.fxy)
	Color = setup_gradient(Color,window.fxy)
	//exports
	return setup_module(Color,window.fxy)
	
})( function setup_color(fxy){
	const alpha_opacity_transparency = Symbol('color alpha, opacity or transparency')
	const color_names = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
		"beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
		"cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
		"darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
		"darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
		"darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
		"firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
		"gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
		"honeydew":"#f0fff0","hotpink":"#ff69b4",
		"indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
		"lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
		"lightgray":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
		"lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
		"magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
		"mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
		"navajowhite":"#ffdead","navy":"#000080",
		"oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
		"palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
		"rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
		"saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
		"tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
		"violet":"#ee82ee",
		"wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
		"yellow":"#ffff00","yellowgreen":"#9acd32"};
	const shorthand_hex_reg = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
	const hex_to_rgb_reg = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
	
	class Color{
		static get module(){ return get_color_module() }
		static get set_color(){ return set_colors }
		constructor(value,custom_colors){
			this[alpha_opacity_transparency] = 1
			let colors = fxy.is.map(custom_colors) ? custom_colors:fxy.require('design/colors')
			if(fxy.is.map(colors) && colors.has(value)) value = colors.get(value)
			this.identity = value
		}
		get blue(){ return this.rgb[2] }
		get green(){ return this.rgb[1] }
		get hex(){ return get_rgb_to_hex(this.red,this.green,this.blue) }
		get red(){ return this.rgb[0] }
		get rgb(){ return get_color(this.identity) }
		get transparency(){ return this[alpha_opacity_transparency] }
		set transparency(value){ return !fxy.is.numeric(value) ? this[alpha_opacity_transparency]:this[alpha_opacity_transparency] = value }
		transparent(x){ return this.value(fxy.is.number(x) ? x:1) }
		value(transparency){ return `rgba(${this.red},${this.green},${this.blue},${fxy.is.numeric(transparency) ? transparency:this.transparency})` }
		toString(){ return this.value() }
	}
	
	//exports
	return Color
	
	//shared actions
	function get_color(value){
		if(fxy.is.array(value)) return value
		if(fxy.is.text(value)){
			value = value.trim()
			if(value.length > 0){
				if(value in color_names) value = color_names[value]
				if(value.includes(',')) {
					value = value.replace('rgba','').replace('rgb','').replace('(','').replace(')','').trim()
					return value.split(',').map(x=>fxy.numeral(x).value)
				}
				if(value.charAt(0) !== '#') value = `#${value}`
				value = get_hex_to_rgb(value)
				if(value !== null) return [value.r,value.g,value.b]
			}
		}
		return [255,255,255]
	}
	
	function get_color_module(){
		return new Proxy((...x)=>new Color(...x),{
			get(o,name){
				switch(name){
					case 'is':
						return get_is()
					case 'names':
						return color_names
					case 'theme':
						return get_color_theme
				}
				if(name in o) return o[name]
				return null
			}
		})
		
	}
	
	function get_color_theme(file_url){
		return window.fxy.doc(file_url,'regulate').then(theme_colors=>set_colors(theme_colors,true)).catch(console.error)
	}
	
	function get_component_to_hex(c) {
		let hex = c.toString(16)
		return hex.length === 1 ? "0" + hex : hex
	}
	
	function get_hex_to_rgb(hex) {
		hex = hex.replace(shorthand_hex_reg, (m, r, g, b)=>r + r + g + g + b + b)
		let result = hex_to_rgb_reg.exec(hex)
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	function get_is(){
		return {
			color:is_color,
			dark:is_dark,
			light:is_light,
			mid:is_mid
		}
	}
	
	
	
	function get_rgb_to_hex(r, g, b) { return "#" + get_component_to_hex(r) + get_component_to_hex(g) + get_component_to_hex(b) }
	
	function is_color(value){}
	
	function is_dark(value){
		let color = get_color(value)
		let points = color.red+color.green+color.blue
		let mid = ((255*3) / 2)-50
		console.log({points,mid})
		if(points < mid) return true
		return false
	}
	
	function is_light(value){
		let color = get_color(value)
		let points = color.red+color.green+color.blue
		let mid = ((255*3) / 2)+50
		console.log({points,mid})
		if(points > mid) return true
		return false
	}
	
	function is_mid(value){
		let color = get_color(value)
		let points = color.red+color.green+color.blue
		let mid = ((255*3) / 2)
		console.log({points,mid})
		if(points < mid+50 && points > mid-50 ) return true
		return false
	}
	
	
	
},
	function setup_gradient(Color,fxy){
		const tags = {
			color:fxy.tag`rgba(${'red'},${'green'},${'blue'},${'transparency'}) ${'position'}`,
			radial:fxy.tag`radial-gradient(${'axis'} ${'origin'},${'colors'})`,
			linear:fxy.tag`linear-gradient(${'axis'} ${'origin'} ${'rotation'},${'colors'})`
		}
		
		class GradientColor extends Color{
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
		Color.Gradient = Gradient
		Color.LinearGradient = LinearGradient
		Color.RadialGradient = RadialGradient
		return Color
		//art.css.linear_gradient = (...x)=>new LinearGradient(...x)
		//art.css.radial_gradient = (...x)=>new RadialGradient(...x)
	
	
},function setup_module(Color){
	return window.fxy.exports('design',(design,fxy)=>{
		
		//load
		load()
		
		//exports
		design.Color = Color
		design.color = Color.module
		//design.color = (...x) =>  new Color(...x)
		//design.color.is =
		//design.color_names = ()=>color_names
		//design.color_theme = get_color_theme
		function get_random_color(options){
			let skip = fxy.is.data(options) && 'skip' in options ? options.skip:null
			let keys = Array.from(this.keys())
			if(Array.isArray(skip)) keys = keys.filter(key=>skip.filter(keyword=>key.includes(keyword)).length <= 0)
			let key = fxy.random.item(keys)
			return this.get(key)
		}
		
		function set_colors(colors,custom_theme=false){
			colors.color = function(color){ return new Color(color,colors) }
			colors.custom_theme = custom_theme
			colors.random = get_random_color.bind(colors)
			colors.transparent = function(color,transparency){
				if(color instanceof Color) return color.transparent(transparency)
				return colors.color(color).transparent(transparency)
			}
			if(custom_theme !== true) design.colors = colors
			return colors
		}
		
		function load(){
			let docs = [[url.component('design/css/colors.css'),'regulate'],[url.component('design/css/attr.css'),'design']]
			fxy.doc(...docs[0]).then(set_colors)
			   .then(()=>fxy.doc(...docs[1]))
			   .then(gui=>{
					gui.rekey('gui.')
					design.gui=gui
				})
			   .catch(console.error)
		}
		
	})
},this)



