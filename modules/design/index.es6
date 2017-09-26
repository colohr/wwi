window.fxy.exports('design', (design, fxy) => {
	const default_icon_size = 24
	const icons = {}
	//load
	load()
	//exports
	design.icon = get_icon
	design.icon.set = get_icon_set
	design.icon.get = get_icon_named
	
	//shared actions
	function get_clean_svg(html) { return html.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '') }
	
	function get_icon(data, options) {
		let info = get_icon_info(data)
		let container = document.createElement('div', options || {})
		container.innerHTML = info.html
		let icon = container.querySelector(info.selector)
		icon.setAttribute('design-icon', '')
		//icon.slot = 'icon'
		return icon
	}
	
	function get_icon_info(value) {
		let size = default_icon_size
		let info = {}
		if (fxy.is.text(value)) {
			if (value.includes('<g')) info.svg = value
			else if (value.includes('<')) info.html = value
			else info.url = value
		}
		else if (fxy.is.data(value)) info = value
		if ('size' in info) size = info.size
		else if ('svg' in info) size = default_icon_size
		else if ('url' in info) size = 'auto 100%'
		if ('svg' in info) {
			info.selector = 'svg'
			info.html = get_clean_svg(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet" >${info.svg}</svg>`)
		}
		else if ('url' in info) info.html = `<div style="background-image:url(${info.url});background-repeat:no-repeat;background-position:center center;background-size:${size};"></div>`
		if (!('selector' in info)) info.selector = 'div'
		return info
	}
	
	function get_icon_named(name) {
		if (name in design.icons) return get_icon(design.icons[name])
		return null
	}
	
	function get_icon_set(set) {
		return new Proxy(set, {
			get(o, name) {
				if (name in o) return get_icon(o[name])
				return null
			},
			has(o, name) {
				return name in o
			},
			set(o, name, value) {
				o[name] = value
				return true
			}
		})
	}
	
	function load() {
		if ('icons' in design) return null
		window.fetch(window.url.modules('design/icons.json'))
		      .then(x => x.json())
		      .then(data => {
			      for (let name in data) icons[name] = new Map(data[name])
			      design.icons = new Proxy(icons, {
				      get(o, name) {
					      if (name in o) return o[name]
					      else for (let i in o) if (o[i].has(name)) return o[i].get(name)
					      return null
				      },
				      has(o, name) {
					      for (let i in o) if (o[i].has(name)) return true
					      return name in o
				      },
				      set(o,name,value){
					      o.index[name] = value
					      return true
				      }
			      })
		      })
		      .catch(console.error)
		return null
	}
})