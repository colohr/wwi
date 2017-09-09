/*!
 * displace.js 1.2.0 - Tiny javascript library to create moveable DOM elements.
 * Copyright (c) 2017 Catalin Covic - https://github.com/catc/displace
 * License: MIT
 */
(function(get_displace){ return get_displace()() })
(function(){
    return function get_displace_export(){
	    const default_options = {
		    constrain: false,
		    handle: null,
		    highlightInputs: false,
		    onMouseDown: null,
		    onMouseMove: null,
		    onMouseUp: null,
		    onTouchStart: null,
		    onTouchMove: null,
		    onTouchStop: null,
		    relativeTo: null
	    }
	    
	    
	    
	    const move = (0, generate_move)()
	    const touch_events = window.fxy.browser.touch
	    const passive = window.fxy.browser.compatability.passive_events
	    const windex = Symbol('x data')
	    const windex_index = '9982034802398403298042938'
	    
	    
    	class Displace{
	    	
		    static get active(){ return windex in this ? this[windex]:null }
		    static set active(displace){
			    if(windex in this && this[windex] !== displace) {
			    	this[windex].el.style.zIndex = this[windex].z
			    }
			    this[windex] = displace
			    this[windex].el.style.zIndex = windex_index
			    return this[windex]
		    }
    		constructor(el,opts){
			    if (!el) throw Error('Must include moveable element')
			    this.el = el
			    this.opts = opts
			    this.set('z',this.style.zIndex)
			    setup.call(this)
		    }
		    get active(){ return Displace.active === this }
		    destroy() {
			    let events = this.events
			    this.handle.removeEventListener('mousedown', events.mousedown, false)
			    document.removeEventListener('mousemove', events.mousemove, false)
			    document.removeEventListener('mouseup', events.mouseup, false)
			    if(touch_events){
				    this.handle.removeEventListener('touchstart', events.touchstart,  passive ? { passive: true } : false)
				    document.removeEventListener('touchmove', events.touchmove, false)
				    document.removeEventListener('touchstop', events.touchstop, false)
			    }
			    this.data = null
			    this.events = null
			    this.el = null
			    this.handle = null
			    this.opts = null
			    delete this[windex]
		    }
		    get(name){ return windex in this ? this.windex.get(name):null }
		    has(name){ return windex in this ? this.windex.has(name):false }
		    reinit() { return setup.call(this) }
		    set(name,value){ return this.windex.set(name,value) }
		    get style(){ return get_style(this.el) }
		    get windex(){ return windex in this ? this[windex]:this[windex] = new Map() }
		    get z(){ return this.has('z') ? this.get('z'):''}
	    }
	    
	    return Displace
     
	    
	    //shared actions
	    function generate_clamp(min, max) { return function (val) { return Math.min(Math.max(val, min), max) } }
	
	    function generate_move() {
		    if (window.requestAnimationFrame) {
			    return function (el, x, y) {
				    window.requestAnimationFrame(function () {
					    el.style.left = x + 'px'
					    el.style.top = y + 'px'
				    })
			    }
		    }
		    return function (el, x, y) {
			    el.style.left = x + 'px'
			    el.style.top = y + 'px'
		    }
	    }
	
	    function get_style(el) { return window.getComputedStyle(el) }
	    
	    function is_input(e){
		    let target = e.target.tagName.toLowerCase()
		    if (target === 'input' || target === 'textarea') return true
		    return false
	    }
	    
	    function is_relative(el) { return window.getComputedStyle(el).position === 'relative' }
	    
	    function setup() {
		    let data = {}
		    const el = this.el
		    let opts = this.opts || default_options
		    el.style.position = 'absolute'
		    this.handle = opts.handle || el
		    if (opts.constrain) {
			    let relTo = opts.relativeTo || el.parentNode
			    let traverse = el
			    let minX = 0
			    let minY = 0
			    while (traverse !== relTo) {
				    traverse = traverse.parentNode
				    if ((0, is_relative)(traverse)) {
					    minX -= traverse.offsetLeft;
					    minY -= traverse.offsetTop;
				    }
				    if (traverse === relTo) {
					    minX += traverse.offsetLeft;
					    minY += traverse.offsetTop;
				    }
			    }
			    let maxX = minX + relTo.offsetWidth - el.offsetWidth
			    let maxY = minY + relTo.offsetHeight - el.offsetHeight
			    data.xClamp = (0, generate_clamp)(minX, maxX)
			    data.yClamp = (0, generate_clamp)(minY, maxY)
		    }
		    this.data = data
		    this.events = { mousedown: mousedown.bind(this), mouseup: mouseup.bind(this), touchstart: touchstart.bind(this), touchstop: touchstop.bind(this) }
		    this.handle.addEventListener('mousedown', this.events.mousedown, false)
		    if(touch_events) this.handle.addEventListener('touchstart', this.events.touchstart, passive ? { passive: true } : false)
		    this.opts = opts
		    return this
	    }
	    
	
	    // mouse events
	    function mousedown(e) {
		    let opts = this.opts
		    if (opts.highlightInputs && is_input(e)) return
		    const el = this.el
		    let events = this.events
		    if (typeof opts.onMouseDown === 'function') opts.onMouseDown(el, e)
		    let wOff = e.clientX - el.offsetLeft
		    let hOff = e.clientY - el.offsetTop
		    events.mousemove = mousemove.bind(this, wOff, hOff)
		    Displace.active = this
		    document.addEventListener('mousemove', events.mousemove, false)
		    document.addEventListener('mouseup', events.mouseup, false)
	    }
	
	    function mousemove(offsetW, offsetH, e) {
		    const el = this.el
		    let data = this.data
		    let opts = this.opts
		    if (typeof opts.onMouseMove === 'function') opts.onMouseMove(el, e)
		    let x = e.clientX - offsetW
		    let y = e.clientY - offsetH
		    if (opts.constrain) {
			    x = data.xClamp(x)
			    y = data.yClamp(y)
		    }
		    move(el, x, y)
		    e.preventDefault()
		    return false
	    }
	
	    function mouseup(e) {
		    const el = this.el
		    let events = this.events
		    let opts = this.opts
		    if (typeof opts.onMouseUp === 'function') opts.onMouseUp(el, e)
		    document.removeEventListener('mouseup', events.mouseup, false)
		    document.removeEventListener('mousemove', events.mousemove, false)
	    }
	
	    // touch events
	    function touchstart(e) {
		    let opts = this.opts;
		    if (opts.highlightInputs && is_input(e)) return
		    const el = this.el
		    let events = this.events
		    if (typeof opts.onTouchStart === 'function') opts.onTouchStart(el, e)
		    let touch = e.targetTouches[0]
		    let wOff = touch.clientX - el.offsetLeft
		    let hOff = touch.clientY - el.offsetTop
		    events.touchmove = touchmove.bind(this, wOff, hOff);
		    document.addEventListener('touchmove', events.touchmove, false)
		    document.addEventListener('touchend', events.touchstop, false)
		    document.addEventListener('touchcancel', events.touchstop, false)
	    }
	
	    function touchmove(offsetW, offsetH, e) {
		    const el = this.el
		    let data = this.data
		    let opts = this.opts
		    if (typeof opts.onTouchMove === 'function') opts.onTouchMove(el, e)
		    let touch = e.targetTouches[0]
		    let x = touch.clientX - offsetW
		    let y = touch.clientY - offsetH
		    if (opts.constrain) {
			    x = data.xClamp(x)
			    y = data.yClamp(y)
		    }
		    move(el, x, y)
		    e.preventDefault()
		    return false
	    }
	
	    function touchstop(e) {
		    const el = this.el
		    let events = this.events
		    let opts = this.opts
		    if (typeof opts.onTouchStop === 'function') opts.onTouchStop(el, e)
		    document.removeEventListener('touchmove', events.touchmove, false)
		    document.removeEventListener('touchend', events.touchstop, false)
		    document.removeEventListener('touchcancel', events.touchstop, false)
	    }
	    
    }
	
})