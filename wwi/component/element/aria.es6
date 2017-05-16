wwi.exports('element', (element, fxy) => {
	
	const aria_data = Symbol.for('Element Aria State Data')
	const aria_element = Symbol.for('A11y Element')
	const not_aria_name = ['role','tabindex','outline','state']
	
	
	element.aria = (el) => {
		return new Proxy(el, {
			get(o, name){
				name = get_name(name)
				if(!name) return null
				return o.getAttribute(name)
			},
			set(o, name, value){
				name = get_name(name)
				if(!name) return true
				value = get_value(name,value)
				o.setAttribute(name, value)
				return true
			},
			has(o, name){
				name = get_name(name)
				return o.hasAttribute(name)
			}
		})
	}
	
	
	function get_name(name) {
		if (fxy.is.string(name)) {
			if(name.includes('aria')) return name
			else if(not_aria_name.includes(name)) return name
			else return `aria-${name}`
		}
		return null
	}
	
	function get_value(name,value) {
		if(fxy.is.nothing(value)) return null
		switch(name){
			case 'role':
				break
			case 'tabindex':
				if(fxy.is.numeric(value)) return value+''
				break
			default:
				if(fxy.is.bool(value) || fxy.is.text(value)) return value+''
				break
		}
		return value
	}
	
})

/*
function set_state(el, state, val) {
	if (val === undefined) {
		val = true;
	} else {
		if (!states.value(state, val)) {
			val = null;
		}
	}
	if (val !== null) {
		el.setAttribute('aria-' + state, val);
	}
}

function remove_state(el, state) {
	if ( states.value(state, undefined, true) ) {
		el.removeAttribute('aria-' + state);
	} else {
		el.setAttribute('aria-' + state, false);
	}
}

function toggle_state(el, state) {
	state = get_name(state)
	var current = el[state]
	if (current === null) {
		return el[state] = true
	}
	else{
		return el[state] = false
	}
	
	console.info('Cannot toggle `aria-' + state + '` as it\'s starting value is not a boolean (it\'s `' + current + '`)');
	
};

*/