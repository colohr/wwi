(function(get_module){ return get_module() })
(function(){
    return function external_module(behavior){
	
	    class Constraints {
		    static get view() {
			    if (!this[Symbol.for('view')]) this[Symbol.for('view')] = new Constraints(window.document.body)
			    return this[Symbol.for('view')]
		    }
		
		    constructor(element) {
			    this.element = element
		    }
		
		    get isBody() {return this.element.tagName === 'body'}
		
		    get view() {return this.constructor.view}
		
		    get bounds() {return this.element.getBoundingClientRect()}
		
		    get height() {
			    if (this.isBody) return window.innerHeight
			    return this.element.clientHeight
		    }
		
		    get width() {
			    if (this.isBody) return window.innerWidth
			    return this.element.clientWidth
		    }
		
		    get top() {
			    if (this.isBody) return 0
			    return this.element.clientTop
		    }
		
		    get left() {
			    if (this.isBody) return 0
			    return this.element.clientLeft
		    }
		
		    outside(el) {
			    let b = el.getBoundingClientRect()
			    var top = false
			    var left = false
			    var right = false
			    var bottom = false
			    if (this.top > b.top - 3) top = true
			    if (this.left > b.left - 3) left = true
			    if (this.width < (b.left + b.width) + 3) right = true
			    if (this.height < (b.top + b.height) + 3) bottom = true
			    return {top, left, right, bottom, get yes() {return this.top || this.left || this.right || this.bottom}}
		    }
	    }
	    
	    const Hitter = (el) => {
		    if ((typeof el === 'object' && el !== null && typeof el.querySelector === 'function') || el instanceof HTMLElement) {
			    el.hitterRect = function () { return Hitter.Rect(this, this.onHit); }
			    el.hits = function (rect2) {
				    this.boundries = Hitter.Hits(this.hitterRect(), typeof rect2.hitterRect === 'function' ? rect2.hitterRect() : rect2);
				    return this.boundries.hit;
			    };
			    el.hit = function(target){
				    return Hitter.Hits(this.hitterRect(), typeof target.hitterRect === 'function' ? target.hitterRect() : target);
				
			    }
			    return el;
		    }
		    return Hitter.Mixin(el);
	    }
	    
	    Hitter.constraint = (el) => {return new Constraints(el)}
	    
	    Hitter.Rect = (el, onHit) => {
		    // (1)
		    var box = el.getBoundingClientRect()
		    let boundry = window.app.boundry;
		    return {
			    isHitterRect: true,
			    onHit,
			    element:el,
			    y: Math.round(box.top + boundry.scroll.top - boundry.client.top),
			    x: Math.round(box.left + boundry.scroll.left - boundry.client.left),
			    box,
			    get width() {return this.box.width},
			    get height() {return this.box.height},
			    get top() {
				    return this.y;
			    },
			    get left() {
				    return this.x;
			    },
			    get right() {
				    return this.x + this.width;
			    },
			    get bottom() {
				    return this.y + this.height;
			    }
		    };
	    }
	    
	    Hitter.Hits = function hitDetector(rect1, rect2) {
		    if (rect2.isHitterRect !== true) rect2 = Hitter.Rect(rect2)
		    let right = rect1.x < rect2.x + rect2.width;
		    let left = rect1.x + rect1.width > rect2.x;
		    let top = rect1.y < rect2.y + rect2.height;
		    let bottom = rect1.height + rect1.y > rect2.y;
		    let out = {
			    target:rect2,
			    tester:rect1,
			    sides: {right, left, top, bottom},
			    get difference(){
				    let sides = this.sides
				    let dif = {
					    left:['left','right'],
					    right:['right','left'],
					    bottom:['bottom','top'],
					    top:['top','bottom']
				    }
				    for(let side in dif){
					    let keys = dif[side]
					    dif[side] = this.tester[keys[0]] - this.target[keys[1]]
				    }
				    return dif
			    },
			    get hits(){
				    let dif = this.difference
				    let hits = {}
				    for(let side in dif){
					    let v = dif[side]
					    if(v <= 5 && v >= -5) hits[side] = true
				    }
				    return hits
			    }
		    }
		    if (left && right && top && bottom) {
			    if (rect2.onHit) rect2.onHit(rect1, rect2);
			    if (rect1.onHit) rect1.onHit(rect2, rect1);
			    out.hit = true;
		    } else out.hit = false;
		    return out;
	    }
	    
	    Hitter.Mixin = Base => class extends Base {
		    hitterRect() {return Hitter.Rect(this, this.onHit)}
		    hit(target){
			    return Hitter.Hits(this.hitterRect(), typeof target.hitterRect === 'function' ? target.hitterRect() : target)
			
		    }
		    hits(rect2) {
			    this.boundries = Hitter.Hits(this.hitterRect(), typeof rect2.hitterRect === 'function' ? rect2.hitterRect() : rect2)
			    return this.boundries.hit;
		    }
	    }
	    
        //exports
        return behavior.Hit = Hitter.Mixin
    }
})



