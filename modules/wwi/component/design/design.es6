window.fxy.exports('design',(design,fxy)=>{
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
	const default_icon_size = 24
	const shorthand_hex_reg = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
	const hex_to_rgb_reg = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
	
	class Color{
		constructor(value,custom_colors){
			this[alpha_opacity_transparency] = 1
			let colors = fxy.is.map(custom_colors) ? custom_colors:design.colors
			if(fxy.is.map(colors) && colors.has(value)) value = colors.get(value)
			this.rgb = get_color(value)
		}
		get blue(){ return this.rgb[2] }
		get green(){ return this.rgb[1] }
		get hex(){ return get_rgb_to_hex(this.red,this.green,this.blue) }
		get red(){ return this.rgb[0] }
		get transparency(){ return this[alpha_opacity_transparency] }
		set transparency(value){ return !fxy.is.numeric(value) ? this[alpha_opacity_transparency]:this[alpha_opacity_transparency] = value }
		transparent(x){ return this.value(fxy.is.number(x) ? x:1) }
		value(transparency){ return `rgba(${this.red},${this.green},${this.blue},${fxy.is.numeric(transparency) ? transparency:this.transparency})` }
	}
	
	//load
	load()
	
	//exports
	design.Color = Color
	design.color = (...x) =>  new Color(...x)
	design.color_names = ()=>color_names
	design.color_theme = get_color_theme
	design.icon = get_icon
	design.icon.set = get_icon_set
	design.icon.get = get_icon_named
	design.icons = fxy.exports().icons
	
	//shared actions
	function get_clean_svg(html) { return html.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '') }
	
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
	
	function get_color_theme(file_url){
		return window.fxy.doc(file_url,'regulate').then(theme_colors=>set_colors(theme_colors,true)).catch(console.error)
	}
	
	function get_component_to_hex(c) {
		let hex = c.toString(16)
		return hex.length === 1 ? "0" + hex : hex
	}
	
	function get_hex_to_rgb(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		hex = hex.replace(shorthand_hex_reg, (m, r, g, b)=>r + r + g + g + b + b)
		let result = hex_to_rgb_reg.exec(hex)
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	function get_icon(data){
		let info = get_icon_info(data)
		let container = document.createElement('div')
		container.innerHTML = info.html
		let icon = container.querySelector(info.selector)
		icon.setAttribute('design-icon','')
		icon.slot = 'icon'
		return icon
	}
	
	function get_icon_named(name){
		if(name in design.icons) return get_icon(design.icons[name])
		return null
	}
	
	function get_icon_set(set){
		return new Proxy(set, {
			get(o,name){
				if(name in o) return get_icon(o[name])
				return null
			},
			has(o,name){
				return name in o
			},
			set(o,name,value){
				o[name] = value
				return true
			}
		})
	}
	
	function get_random_color(options){
		let skip = fxy.is.data(options) && 'skip' in options ? options.skip:null
		let keys = Array.from(this.keys())
		if(Array.isArray(skip)) keys = keys.filter(key=>skip.filter(keyword=>key.includes(keyword)).length <= 0)
		let index = window.app.help.numbers.random(0, keys.length - 1)
		let values = keys.map(key=>this.get(key))
		return values[index]
	}
	
	function get_rgb_to_hex(r, g, b) { return "#" + get_component_to_hex(r) + get_component_to_hex(g) + get_component_to_hex(b) }
	
	function get_icon_info(value) {
		let size = default_icon_size
		let info = {}
		if(fxy.is.text(value)){
			if(value.includes('<g')) info.svg = value
			else if(value.includes('<')) info.html = value
			else info.url = value
		}
		else if(fxy.is.data(value)) info = value
		
		if('size' in info) size = info.size
		else if('svg' in info) size = default_icon_size
		else if('url' in info) size = 'auto 100%'
		
		if('svg' in info) {
			info.selector = 'svg'
			info.html = get_clean_svg(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet" >${info.svg}</svg>`)
		}
		else if('url' in info) info.html = `<div style="background-image:url(${info.url});background-repeat:no-repeat;background-position:center center;background-size:${size};"></div>`
		
		if(!('selector' in info)) info.selector = 'div'
		
		return info
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
		fxy.doc(...docs[0]).then(set_colors).then(()=>fxy.doc(...docs[1])).then(gui=>{
			gui.rekey('gui.')
			design.gui=gui
		}).catch(console.error)
	}
	
})