wwi.exports('element',(element)=>{
	const ElementStyle = Base => class extends Base {
		ui(key, value) {
			if (typeof key === 'object' && key !== null) {
				Object.assign(this.style, key);
				return this.style;
			}
			if (key && typeof key === 'string') {
				if (typeof value !== 'undefined') this.style[key] = value;
				return this.style[key];
			}
			return this.style;
		}
		
		get height() {
			var x = null;
			if (this.hasAttribute('height')) {
				x = this.getAttribute('height')
				if (!x || x === 'auto') x = null;
				else x = parseFloat(x)
			}
			if (!x) x = this.clientHeight;
			return x;
		}
		
		set height(x) {
			if (x === null) {
				this.removeAttribute('height');
				this.style.height = ''
			}
			else {
				var h = parseFloat(x)
				if (isNaN(x)) h = x;
				else if (typeof x === 'string') h = x;
				else h = h + 'px'
				this.setAttribute('height', h);
				this.style.height = h
			}
			return this.style.height;
		}
		
		get width() {
			var x = null;
			if (this.hasAttribute('width')) {
				x = this.getAttribute('width')
				if (!x || x === 'auto') x = null;
				else x = parseFloat(x)
			}
			if (!x) x = this.clientWidth;
			return x;
		}
		
		set width(x) {
			if (x === null) {
				this.removeAttribute('width');
				this.style.width = ''
			}
			else {
				var h = parseFloat(x)
				if (isNaN(x)) h = x;
				else if (typeof x === 'string') h = x;
				else h = h + 'px'
				this.setAttribute('width', h);
				this.style.width = h
			}
			return this.style.width;
		}
		
		get size() {
			return this.getBoundingClientRect()
		}
		
		set size(size) {
			if (typeof size === 'number' || typeof size === 'string') {
				this.height = size;
				this.width = size;
			} else if (typeof size === 'object' && size === null) {
				if (typeof size.height !== 'undefined') this.height = size.height;
				if (typeof size.width !== 'undefined') this.width = size.width;
			}
			return size;
		}
	}
	element.design = ElementStyle
})