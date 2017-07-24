(function(export_scroll){ return export_scroll() })
(function(){
	return function external_module(){
		const notifiers = Symbol.for('notifiers')
		const notifies = Symbol.for('notifies')
		const styles = Symbol('element style')
		const three_dimension = Symbol('3D')
		const transform_data = Symbol('transform data')
		const transformers = [
			'transform',
			'transition-timing-function',
			'transition-delay',
			'transition-duration',
			'transition-property',
			'will-change',
			'perspective',
			'opacity',
			'backface-visibility',
			'z-index'
		]
		const transformations = Symbol('transformations')
		const transit = Symbol.for('transformation information')
		const transitioning = 'transitioning'
		
		const transforms = {
			each(string){
				string = string.replace(/ /g,'').split(')').join(')|')
				return string.split('|')
			},
			devalue(string){
				let t = {}
				if(typeof string === 'string') string = string.trim()
				if(typeof string === 'string' && string.length > 0){
					this.each(string).forEach(def=>{
						if(typeof def === 'string'){
							if(def.includes('(')){
								let kv = def.split('(')
								let key = kv[0]
								let value = kv[1].replace(')','').trim()
								t[key]=value.split(',')
							}
						}
					})
				}
				else t.translate3d=[0,0,0]
				return t
			},
			defValue(v){
				if(typeof v === 'string') v = v.trim()
				if(typeof v === 'string' && v.length > 0) return v
				if(Array.isArray(v)) return v.join(',')
				return undefined
			},
			stringValue(o){
				let s = []
				for(let key in o) {
					let v = this.defValue(o[key])
					if(v)s.push(`${key}(${v})`)
				}
				return s.join(' ')
			},
			symbols:new Map(),
			types:new Map([
				['translate3d',{
					default:'0px,0px,0px',
					unit:['px','px','px'],
					units:['px','%','vh','vw','em','rem','pt'],
					names:['x','y','z'],
					values:[0,0,0]
				}],
				[ 'scale3d', {
					default:'1,1,1',
					unit:['','',''],
					names:['x','y','z'],
					values:[1,1,1]
				} ],
				[ 'rotate3d',{
					default:'0,0,0,0deg',
					unit:['','','','deg'],
					names:['x','y','z','deg'],
					values:[0,0,0,0]
				} ],
				[ 'skew', {
					default:'0deg,0deg',
					unit:['deg','deg'],
					names:['x','y'],
					values:[0,0]
				} ],
				[ 'perspective', {
					default:'1000px',
					unit:['px'],
					units:['px','%','vh','vw','em','rem','pt'],
					names:['perspective'],
					values:[1000]
				} ]
			]),
			value(v){
				let o=[0,0,0]
				if(typeof v === 'string') o = v.split(',')
				else if(Array.isArray(v)) o = v
				if(o.length < 3) o.push(0)
				if(o.length < 3) o.push(0)
				return o
			}
		}
		
		transforms.symbol = i => Symbol.for(`${i} value`)
		
		
		class Transformation{
			constructor(op,a,b){
				if(op[transit]) this.promises = op[transit].clear()
				if(!Array.isArray(this.promises)) this.promises = []
				op.addEventListener('transitionend',this.transitionend.bind(this),false)
				this.clear = function(){
					op.removeEventListener('transitionend',this.transitionend.bind(this),false)
					delete op[transit]
					return this.promises
				}
				op[transit] = this
				this.then = (cb)=>{
					let promise = new Promise(success=>success(cb))
					this.promises.push(promise)
					op[transitioning]  = true
					if(typeof b === 'object') Object.assign(a,b)
					set_css(op,a)
					return this
				}
			}
			transitionend(e){
				return Promise.all(this.clear()).then((cbs)=>{
					let len = cbs.length
					return cbs[len-1](e)
				})
			}
		}
		
		class TransformDefinition extends String{
			constructor(v,key){
				if(!transforms.types.has(key)) throw new TypeError(`TransformDefinition(ValidValue,ValidType) must contain a valid type: ${Array.from(transforms.types.keys())}`)
				let type = transforms.types.get(key)
				if(Array.isArray(v)) v = v.join(',')
				if(typeof v !== 'string') v = type.default
				if(v.split(',').length !== type.unit.length) v = type.default
				super(v)
				this.key=key
				this.units = type.unit
				this.array=this.values().map((v,i)=>{return v+type.unit[i]})
			}
			list(k,v){
				if(!this.array) this.array = this.split(',')
				if(typeof k !== 'undefined'){
					if(typeof v !== 'undefined') this.array[k]=v
					return this.array[k]
				}
				return this.array;
			}
			type(index){ return this.units[index] }
			get angle(){return this.values()[3]}
			set angle(x){return this.list(3,x+this.type(3)) }
			get x(){return this.values()[0]}
			set x(x){ return this.list(0,x+this.type(0)) }
			get y(){return this.values()[1]}
			set y(x){ return this.list(1,x+this.type(1)) }
			get z(){return this.values()[2]}
			set z(x){ return this.list(2,x+this.type(2)) }
			get prime(){
				let p = {}
				p[this.key] = this.valueOf()
				return p
			}
			get transform(){ return `${this.key}(${this.valueOf()})` }
			values(){return this.list().map(x=>parseFloat(x))}
			valueOf(){
				if(this.array) return this.array.join(',')
				return this.toString()
			}
		}
		
		class TransformsType{
			constructor(type){
				this.type = type
				let data = transforms.types.get(type)
				for(let i of data.names){
					let symbol = transforms.symbol(i)
					if(!transforms.symbols.has(symbol)) transforms.symbols.set(symbol,i)
					Object.defineProperty(this,i,{
						get(){ return this.get(symbol) },
						set(value){ return this.set(symbol,value) }
					})
				}
			}
			get(symbol){
				if(typeof symbol !== 'symbol') symbol = transforms.symbol(symbol)
				if(symbol in this) return this[symbol]
				return this[symbol] = get_valuable(this.type,symbol)
			}
			set(symbol,value){
				if(typeof symbol !== 'symbol') symbol = transforms.symbol(symbol)
				return this[symbol] = get_valuable(this.type,symbol,value)
			}
			get data(){
				let value = []
				let data = transforms.types.get(this.type)
				for(let name of data.names) value.push(this.get(name))
				return {
					[this.type]:value.join(',')
				}
			}
		}
		
		
		const Transformer = Base => class extends Base{
			
			get dimension(){
				if(three_dimension in this) return this[three_dimension]
				return this[three_dimension] = get_3d(this.style)
			}
			
			prime( x , styles ){
				let ddd = this.dimension.transform(x)
				let values = ddd.style
				values.transform = `${ddd.transformObject}`
				return new Transformation(this,values,styles)
			}
			
			get transformations(){ return get_transformations(this) }
			
			transition(props,duration,timing,delay){
				let css = {
					transitionTimingFunction:timing || 'ease',
					transitionProperty:props ? props:'transform,opacity',
					transitionDuration:typeof duration === 'number' ? duration+'ms':(duration || '210ms')
				}
				css.willChange = css.transitionProperty
				if(typeof delay !== 'undefined') css.transitionDelay = typeof delay === 'number' ? delay+'ms':(delay || '210ms')
				return Object.assign(this.style,css)
			}
			
			get transitioning(){ return this.hasAttribute(transitioning) }
			set transitioning(x){ return set_transitioning(this,x) }
			
		}
		
		//exports
		return Base => class extends Transformer(Base){
			
			get face(){ return window.getComputedStyle(this).backfaceVisibility }
			set face(value){
				this.style.webkitBackfaceVisibility = value
				this.style.backfaceVisibility = value
				return this.style.backfaceVisibility
			}
			
			get opacity(){ return parseFloat(window.getComputedStyle(this).opacity) }
			set opacity(value){ return this.style.opacity = value }
			
			get perspective(){ return this.transformations.perspective.perspective.number }
			set perspective(p){
				let perspective = this.transformations.perspective
				perspective.perspective = p
				this.prime(perspective.data).then(()=>{})
			}
			
			get scale(){ return this.transformations.scale }
			set scale(xyz){
				if(Array.isArray(xyz) !== true) xyz = xyz.split(',')
				let scale = this.transformations.scale
				scale.x = xyz[0]
				scale.y = xyz[1]
				scale.z = xyz[2]
				this.prime(scale.data).then(()=>{})
			}
			get scale_x(){ return this.scale.x.number }
			get scale_y(){ return this.scale.y.number }
			get scale_z(){ return this.scale.z.number }
			set scale_x(x){
				this.scale.x = x
				this.prime(this.scale.data).then(()=>{})
			}
			set scale_y(y){
				this.scale.y = y
				this.prime(this.scale.data).then(()=>{})
			}
			set scale_z(z){
				this.scale.z = z
				this.prime(this.scale.data).then(()=>{})
			}
			
			get skew(){ return this.transformations.skew }
			set skew(xy){
				if(Array.isArray(xy) !== true) xy = xy.split(',')
				let skew = this.transformations.skew
				skew.x = xy[0]
				skew.y = xy[1]
				this.prime(skew.data).then(()=>{})
			}
			get skew_x(){ return this.skew.x.number }
			get skew_y(){ return this.skew.y.number }
			set skew_x(x){
				this.skew.x = x
				this.prime(this.skew.data).then(()=>{})
			}
			set skew_y(y){
				this.skew.y = y
				this.prime(this.skew.data).then(()=>{})
			}
			
			get rotate(){ return this.transformations.rotate }
			set rotate(xyzd){
				if(Array.isArray(xyzd) !== true) xyzd = xyzd.split(',')
				let rotate = this.transformations.rotate
				rotate.x = xyzd[0]
				rotate.y = xyzd[1]
				rotate.z = xyzd[2]
				rotate.deg = xyzd[3]
				this.prime(rotate.data).then(()=>{})
			}
			get rotate_deg(){ return this.rotate.deg.number }
			set rotate_deg(deg){
				this.rotate.deg = deg
				this.prime(this.rotate.data).then(()=>{})
			}
			get rotate_x(){ return this.rotate.x.number }
			get rotate_y(){ return this.rotate.y.number }
			get rotate_z(){ return this.rotate.z.number }
			set rotate_x(x){
				this.rotate.x = x
				this.prime(this.rotate.data).then(()=>{})
			}
			set rotate_y(y){
				this.rotate.y = y
				this.prime(this.rotate.data).then(()=>{})
			}
			set rotate_z(z){
				this.rotate.z = z
				this.prime(this.rotate.data).then(()=>{})
			}
			
			get x(){ return this.xyz.x.number }
			set x(x){
				this.xyz.x = x
				this.prime(this.xyz.data).then(()=>{})
			}
			
			get xy(){ return this.xyz }
			set xy(xy){
				if(Array.isArray(xy) !== true) xy = xy.split(',')
				let xyz = this.xyz
				xyz.x = xy[0]
				xyz.y = xy[1]
				this.prime(xyz.data).then(()=>{})
			}
			
			get xyz(){ return this.transformations.xyz }
			set xyz(xy){
				if(Array.isArray(xy) !== true) xy = xy.split(',')
				let xyz = this.transformations.xyz
				xyz.x = xy[0]
				xyz.y = xy[1]
				xyz.z = xy[2]
				this.prime(xyz.data).then(()=>{})
			}
			
			get y(){ return this.xyz.y.number }
			set y(y){
				this.xyz.y = y
				this.prime(this.xyz.data).then(()=>{})
			}
			
			get z(){ return this.xyz.z.number }
			set z(z){
				this.xyz.z = z
				this.prime(this.xyz.data).then(()=>{})
			}
			
			get z_index(){ return parseInt(window.getComputedStyle(this).zIndex) }
			set z_index(value){ return this.style.zIndex = value }
			
		}
		
		//shared actions
		function get_3d(css){
			return {
				css,
				get(k){return this.transformObject.get(k)},
				set(k,v){return this.transformObject.set(k,v)},
				get style(){
					if(styles in this) return this[styles]
					let s = {}
					if(typeof this.css === 'object') transformers.map(key=>s[key] = this.css[key])
					return this[styles]=s
				},
				transform( values ){
					let assign
					if(typeof values === 'string') assign = get_transform_object(values).value
					else if(typeof values === 'object'){
						for(let key in values){
							let v = transforms.defValue(values[key])
							if(v) values[key] = v
						}
						assign = values
					}
					if(assign) Object.assign(this.transformObject.value,assign)
					return this
				},
				get transformObject(){
					if(transform_data in this) return this[transform_data]
					return this[transform_data] = get_transform_object(this.style.transform)
				}
			}
		}
		
		function get_transformations(element){
			if(!(transformations in element)) element[transformations] = {}
			return new Proxy({
				element,
				get dimension(){ return this.element.dimension},
				get value(){ return this.dimension.transformObject.value }
			},{
				get(o,name){
					if(name in o) return o[name]
					let type_name
					switch(name){
						case 'rotate':
							type_name = 'rotate3d'
							break
						case 'scale':
							type_name = 'scale3d'
							break
						case 'x':
						case 'y':
						case 'z':
						case 'xy':
						case 'xyz':
							type_name = 'translate3d'
							break
						default:
							type_name = name
					}
					if(!(type_name in o.element[transformations])) {
						o.element[transformations][type_name] = new TransformsType(type_name)
					}
					return o.element[transformations][type_name]
				}
			})
		}
		
		function get_transform_object(v){
			return {
				value:transforms.devalue(v),
				get(key){
					if(key in this.value) return new TransformDefinition(this.value[key],key)
					if(key === 'x' || key === 'y') key = 'translate3d'
					if(key in this.value) return new TransformDefinition(this.value[key],key)
					return undefined
				},
				set(key,value){
					if(key instanceof TransformDefinition) this.value[key.key] = key+''
					else if(typeof key === 'string' && typeof value !== 'undefined'){
						if(value === null) delete this.value[key]
						else this[key] = value
					}
					return undefined
				},
				valueOf(){ return transforms.stringValue(this.value) },
				toString(){ return this.valueOf() }
			}
		}
		
		function get_valuable(type,symbol,value){
			let data = transforms.types.get(type)
			let name = typeof symbol === 'symbol' ? transforms.symbols.get(symbol):symbol
			let index = data.names.indexOf(name)
			let units = 'units' in data ? data.units:[data.unit[index]]
			let number
			let unit
			if(typeof value === 'string'){
				number = parseFloat(value)
				unit = units.map(u=>(u ? value.includes(u):null) || u).filter(u=>u!==null)[0]
			}
			else if(typeof value === 'number') number = value
			if(typeof number === 'undefined') number = data.values[index]
			if(typeof unit === 'undefined') unit = data.unit[index]
			if(typeof value === 'undefined') value = number
			return {
				number, symbol, type, unit, value,
				valueOf(){ return `${this.number}${this.unit}` },
				toString(){ return this.valueOf() }
			}
		}
		
		function set_css(element,obj,value){
			if(typeof value === 'undefined' && typeof obj === 'object') return Object.assign(element.style,obj)
			else if(typeof obj === 'string') element.style[obj] = value
			return null
		}
		
		function set_transitioning(el,active){
			if(active) el.setAttribute(transitioning,'')
			else el.removeAttribute(transitioning)
			return active
		}
		
		
		
	}
})


//const TransformObject = (v)=>{
//	return {
//		value:transforms.devalue(v),
//		get(key){
//			if(key in this.value) return new TransformDefinition(this.value[key],key)
//			if(key === 'x' || key === 'y') key = 'translate3d'
//			if(key in this.value) return new TransformDefinition(this.value[key],key)
//			return undefined
//		},
//		set(key,value){
//			if(key instanceof TransformDefinition) this.value[key.key] = key+''
//			else if(typeof key === 'string' && typeof value !== 'undefined'){
//				if(value === null) delete this.value[key]
//				else this[key] = value
//			}
//			return undefined
//		},
//		valueOf(){ return transforms.stringValue(this.value) },
//		toString(){ return this.valueOf() }
//	}
//}

//class OptimusPrime extends Transformer(HTMLElement){
//	static Transformer(val,key){return new Transformers.Def(val,key);}
//	constructor(){ super() }
//	connectedCallback() {
//		if (this.hasAttribute('style')) {}
//		else if(typeof this.css === 'function') this.css({display: 'flex', alignItems: 'center', justifyContent: 'center'});
//		if(typeof this.z === 'function') this.z();
//		if(typeof this.opacity === 'function') this.opacity();
//		if(typeof this.transition === 'function') this.transition();
//	}
//}

//return value if module is global & name === module name or use module proxy to specify custom behavior
//return OptimusPrimer;

//Base = ThreeDimensional(Base)
//Base = CSSBase(Base);
//Base = StyleFace(Base);
//Base = StyleZ(Base);
//Base = StyleOpacity(Base);
//	if(typeof Hitter === 'function') Base = Hitter(Base);
//	return Transition(Base)
//};




//const ThreeDimensional = Base => class extends Base{
//
//}

//const ThreeD = css=>{
//	return {
//		css,
//		get(k){return this.transformObject.get(k)},
//		set(k,v){return this.transformObject.set(k,v)},
//		get style(){
//			if(styles in this) return this[styles]
//			let s = {}
//			if(typeof this.css === 'object') transformers.map(key=>s[key] = this.css[key])
//			return this[styles]=s
//		},
//		transform( values ){
//			let assign
//			if(typeof values === 'string') assign = TransformObject(values).value
//			else if(typeof values === 'object'){
//				for(let key in values){
//					let v = transforms.defValue(values[key])
//					if(v) values[key] = v
//				}
//				assign = values
//			}
//			if(assign) Object.assign(this.transformObject.value,assign)
//			return this
//		},
//		get transformObject(){
//			if(transform_data in this) return this[transform_data]
//			return this[transform_data] = TransformObject(this.style.transform)
//		}
//	}
//}




//const CSSBase = Base => class extends Base{
//
//}

//const StyleFace = Base => class extends Base{
//	face(value){
//		if(typeof value === 'undefined') return this.style.backfaceVisibility;
//		this.style.webkitBackfaceVisibility = value;
//		this.style.backfaceVisibility = value;
//		return this.style.backfaceVisibility;
//	}
//};

//const StyleZ = Base => class extends Base{
//	z(value){
//		if(typeof value === 'undefined' && this.style.zIndex) return parseInt(this.style.zIndex);
//		if(typeof value === 'undefined') value = 1;
//		return this.style.zIndex=value;
//	}
//};

//const StyleOpacity = Base => class extends Base{
//	opacity(value){
//		if(typeof value === 'undefined' && this.style.opacity) return parseInt(this.style.opacity)
//		if(typeof value === 'undefined') value = 1
//		return this.style.opacity=value
//	}
//}

//const Transformers={
//	get Def(){return TransformDefinition;},
//	get Dimensional(){return ThreeDimensional;},
//	get CSS(){return CSSBase;},
//	get Transition(){return TransitionBase;},
//	get Style(){
//		return {
//			get Z(){return StyleZ;},
//			get Opacity(){return StyleOpacity;},
//			get Face(){return StyleFace}
//		}
//	},
//	ThreeD( style ){
//		this[three_dimension] = get_3d(this.style || style)
//		return this[three_dimension]
//	}
//};



