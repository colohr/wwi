wwi.exports('dom',(dom,fxy)=>{
	
	const custom_element_holder = Symbol.for('Custom Element')
	const is = fxy.is
	
	const Memory = fxy.require('element/memory')
	const Symbols = fxy.symbols
	
	
	
	const Basic = {
		get A11y(){
			return fxy.require('element/a11y')
		},
		get Aria() {
			return fxy.require('element/aria')
		},
		get Actions() {
			return fxy.require('element/actions')
		},
		get Attributes() {
			return fxy.require('element/attributes')
		},
		get Callback() {
			return this.Actions.Callback
		},
		get Classes() {
			return fxy.require('element/classes')
		},
		get Changed() {
			return this.Routes.Changed
		},
		get Connected() {
			return this.Routes.Connected
		},
		get Define() {
			return fxy.require('element/define')
		},
		get Design() {
			return fxy.require('element/design')
		},
		get Detector(){
			return fxy.require('element/detector')
		},
		get Disconnected() {
			return this.Routes.Disconnected
		},
		get Events() {
			return Memory.Events
		},
		get Memorize(){
			return fxy.require('element/memorize')
		},
		get Mixins(){
			return fxy.require('element/mixins')
		},
		get Pointer() {
			return Symbols.Pointer
		},
		get Slots(){
			return fxy.require('element/slots')
		},
		get Symbols(){
			return Symbols
		},
		get Routes(){
			return this.Tricycle.Routes
		},
		get Template(){
			return fxy.require('element/template')
		},
		get Tricycle() {
			return fxy.require('element/tricycle')
		},
		get Types(){
			return Memory.Types
		},
		get Element(){
			return get_basic_element()
		}
	}
	
	
	//dom.Element = Basic.Element
	
	
	//----------------dom exports---------------
	const basics = new Proxy({
			get keys(){ return Object.keys(Basic)},
			get names(){ return this.keys.map(key=>key.toLowerCase()) },
			get items(){ return this.keys.map(key=>{ return { key,name:key.toLowerCase() }})},
			get(name_or_key){
				let match = this.items.filter(key_name=>{ return key_name.key === name_or_key || key_name.name === name_or_key })[0]
				return match ? Basic[match.key] : null
			},
			has(name_or_key){ return this.keys.includes(name_or_key) || this.names.includes(name_or_key) }
		},{
		get(o,name){
			if(typeof name !== 'string' && name in o) return o[name]
			return o.get(name)
		},
		has(o,name){
			if(typeof name !== 'string') return name in o
			return o.has(name)
		},
		set(o,name,value){
			if(name in Basic) console.warn(`dom.basics already has a ${name} value. did not set`)
			else Basic[name] = value
			return true
		}
	})
	
	
	
	dom.basics = basics
	dom.create = create_basic_element
	
	
	//----------------wwi elements------------
	
	wwi.create = (...x)=>{
		let CustomElement = get_basic_element(...x)
		function wwi_create(...definitions){
			if(definitions.length === 1) definitions.push(CustomElement)
			return wwi.define(...definitions)
		}
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	wwi.template = (doc)=>{
		const template = doc.currentScript.ownerDocument.querySelector('template')
		return function(...x){
			let creator = create_basic_element(...x)
			creator.Element.template = template
			return creator
		}
	}
	
	wwi.component = function(doc, base, properties){
		const template = doc.currentScript.ownerDocument.querySelector('template')
		const identity = get_element_identity({template})
		
		function wwi_component_create(CustomWebComponent){ return wwi.define(identity.element_name,CustomWebComponent) }
		Object.defineProperty(wwi_component_create,'basics',{ get(){ return basics } })
		
		base = is.nothing(base) ? HTMLElement : base
		base = Basic.Attributes(base)
		base = Basic.Template(base)
		base = Basic.Define(base)
		
		wwi_component_create.Element = class extends base { constructor(definitions) { super(); this.attach_template().define(definitions); } }
		wwi_component_create.Element.observedAttributes = get_observed_attributes(wwi_component_create.Element,properties)
		wwi_component_create.Element.template = template
		return wwi_component_create
	}
	
	function get_observed_attributes(Base,properties){
		if ( !Array.isArray(properties) ) properties = []
		if ('observedAttributes' in Base) properties = properties.concat(Base.observedAttributes.filter(prop => !properties.includes(prop)))
		return properties
	}
	
	wwi.element = function( doc, ...mixes ){
		const template = doc.currentScript.ownerDocument.querySelector('template')
		const identity = get_element_identity({ template })
		const creator = create_basic_element()
		creator.Element = get_element_with_require_mixes( creator.Element, ...mixes )
		function wwi_element_create(base,extension){
			base.template = template
			let args = [identity.element_name,base]
			if(extension) args.push(extension)
			return wwi.define(...args)
		}
		wwi_element_create.creator = creator
		Object.defineProperty(wwi_element_create,'Element',{ get(){ return this.creator.Element } })
		return wwi_element_create
	}
	
	wwi.button = function( doc, ...mixes ){
		const template = doc.currentScript.ownerDocument.querySelector('template')
		const identity = get_element_identity({template})
		return wwi_element_creator({
			get base_element(){
				return Basic.Memorize(Basic.A11y(basics.Button))
			},
			identity,
			mixes,
			template
		})
	}
	
	
	
	function wwi_element_creator({ base_element, identity, mixes, template }){
		const creator = create_basic_element(base_element)
		creator.Element = get_element_with_require_mixes( creator.Element, ...mixes )
		function wwi_element_create(base,extension){
			base.template = template
			let args = [identity.element_name,base]
			if(extension) args.push(extension)
			return wwi.define(...args)
		}
		wwi_element_create.creator = creator
		Object.defineProperty(wwi_element_create,'Element',{ get(){ return this.creator.Element } })
		return wwi_element_create
	}
	
	
	//----------shared actions---------
	//function create(...x){ return get_basic_element(...x) }
	
	
	
	
	//basic element
	function create_basic_element(...x){
		let CustomElement = get_basic_element(...x)
		function wwi_create(...definitions){
			if(definitions.length === 1) definitions.push(CustomElement)
			return wwi.define(...definitions)
		}
		wwi_create.Element = CustomElement
		return wwi_create
	}
	
	function get_basic_element(Base, properties){
		if (is.nothing(Base)) Base = HTMLElement
		Base = Basic.Attributes(Base)
		Base = Basic.Classes(Base)
		Base = Basic.Design(Base)
		Base = Basic.Template(Base)
		Base = Basic.Slots(Base)
		Base = Basic.Actions(Base)
		Base = Basic.Define(Base)
		Base = Basic.Detector(Base)
		return get_basic_element_class(Base, properties)
	}
	
	function get_basic_element_class(Base, properties){
		if (!Base) Base = HTMLElement
		if (!Array.isArray(properties)) properties = []
		if ('observedAttributes' in Base) {
			properties = properties.concat( Base.observedAttributes.filter( prop => {
				return !properties.includes(prop)
			}))
		}
		class ElementClassDefinition extends Basic.Tricycle(Base) {
			static get observedAttributes() { return this[Symbols.Properties] }
			constructor(definitions,template) {
				super()
				if(is.nothing(definitions)) definitions = {}
				this.attach_template(template).define(definitions)
			}
		}
		ElementClassDefinition[Symbols.Properties] = properties || [];
		return ElementClassDefinition
	}
	
	
	//element mixins & identity
	function get_element_identity({ template, name }){
		let template_id = get_element_template_id({name,template})
		let element_name = get_element_name({name,template_id})
		return { element_name,  template_id }
	}
	
	function get_element_name({name,template_id}){
		var element_name =  is.text(name) ? name : null
		if(!element_name && is.text(template_id)) element_name =  template_id.replace('-template','')
		return element_name
	}
	
	function get_element_require_mixes(...names){
		return new Set( names.map(name=>{ return fxy.require(`element/${name}`) }) )
	}
	
	function get_element_with_require_mixes(Base, ...names){
		if(names.length === 0) return Base
		let mixes = get_element_require_mixes(...names)
		for(let mix of mixes) Base = mix(Base)
		return Base
	}
	
	function get_element_template_id({name,template}){
		var template_id = is.element(template,  HTMLTemplateElement) ? template.id : null
		if( !template_id && is.text(name) ) template_id = `${name || ''}-template`
		return  template_id
	}
	
	
	
	
	//------------wwi elements-----------
	wwi.define('dom-template', class extends Basic.Element{
		render( data, tagger, styles){
			let html = tagger(data)
			return this.shadow.innerHTML = `
				<style>
					:host{ display:block; }
				</style>
				${styles || ''}
				${html}
			`
		}
	})
	
	
	
})


//version girly
//Basic.Mix = function(...mixes){ return ElementMix(this,mixes) }


//const ElementClass = (Base, properties) => {
//	if (!Base) Base = HTMLElement
//	if (!Array.isArray(properties)) properties = []
//	if ('observedAttributes' in Base) {
//		properties = properties.concat( Base.observedAttributes.filter( prop => {
//			return !properties.includes(prop)
//		}))
//	}
//	//if (properties.length) Basic.Define(Base)
//	class ElementClassDefinition extends Basic.Tricycle(Base) {
//		//static get ui() { return {display: 'inline-block'} }
//		static get observedAttributes() { return this[Symbols.Properties] }
//		constructor(definitions,template) {
//			super()
//			if(fxy.is.nothing(definitions)) definitions = {}
//			this.attach_template(template).define(definitions)
//		}
//
//	}
//	ElementClassDefinition[Symbols.Properties] = properties || [];
//	return ElementClassDefinition
//}
//
//const BasicElement = (Base, properties) => {
//	if (fxy.is.nothing(Base)) Base = HTMLElement
//	Base = Basic.Attributes(Base)
//	Base = Basic.Classes(Base)
//	Base = Basic.Design(Base)
//	Base = Basic.Template(Base)
//	Base = Basic.Slots(Base)
//	Base = Basic.Actions(Base)
//	Base = Basic.Define(Base)
//	Base = Basic.Detector(Base)
//	return ElementClass(Base, properties);
//}

/*

const ElementMix = (basic, mixes) => {
	let Not = [
		'Aria',
		'Actions',
		'Events',
		'Element',
		'Callback',
		'Changed',
		'Connected',
		'Disconnected',
		'Mix',
		'Mixins',
		'Symbols',
		'Types',
		'getPointer'
	]
	let Mixes = {
		funcs: null,
		type: null,
		Base(Base){
			if (!Base) Base = HTMLElement
			if (this.type) {
				Base = this.type(Base);
			}
			if (this.funcs) {
				this.funcs.forEach((m) => {
					Base = m(Base);
				})
			}
			return Base;
		}
	}
	if (Array.isArray(mixes)) {
		Mixes.funcs = mixes.map((name) => {
			if (Not.includes(name)) return null;
			if (name in basic) {
				let v = basic[name]
				if (typeof v === 'function') return basic[name];
			}
			return null;
		}).filter((v) => {
			return v !== null
		});
	}
	return Mixes;
}
 */