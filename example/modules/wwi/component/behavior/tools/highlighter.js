(function(window){
	
	function SelectedText(range) {
		var _s = this;
		this.text = function () {
			var _t;
			if (typeof range !== "undefined") {
				if (typeof range.toString === 'function') {
					_t = range.toString().trim();
				}
				if (typeof _t !== "string") {
					try { _t = range.text.trim(); } catch (e) { }
				}
				if (typeof _t === "string") {
					return _t;
				}
			}
			return "";
		};
		this.empty = function () { return (this.text().length <= 0); };
		this.replace = function () {
			if (this.empty() !== true) {
				if (typeof range.surroundContents === "function") {
					range.surroundContents(document.createElement('ks-high-light'));
				} else if (typeof range.pasteHTML === "function") {
					el.innerHTML = this.text();
					range.pasteHTML(el.outerHTML);
				}
			}
			return true;
		};
	}
	
	function getQOTDRoot(){
		return 'KindlePublishing' in window && window.KindlePublishing.QuestionOfTheDay ? window.KindlePublishing.QuestionOfTheDay.root:window
	}
	
	function TextRange(element) {
		this.root = getQOTDRoot();
		this.get = function getRange() {
			var range;
			if (typeof this.root.getSelection === "function" &&
				this.root.getSelection() &&
				this.root.getSelection().rangeCount > 0) {
				range = this.root.getSelection().getRangeAt(0);
			}
			else if (typeof document.getSelection &&
				document.getSelection &&
				document.getSelection().rangeCount > 0) {
				range = document.getSelection().getRangeAt(0);
			}
			else if (document.selection &&
				typeof document.selection.createRange === "function") {
				range = document.selection.createRange();
			}
			return range;
		};
		this.clear = function clearSelection() {
			try {
				if (this.root.getSelection) {
					this.root.getSelection().removeAllRanges();
				} else if (document.selection) {
					document.selection.empty();
				}
			} catch (e) { }
			return true;
		};
		this.text = function getSelectedText() { return new SelectedText(this.get()); }
	}
	
	function KindleSparksHighlighter(element) {
		var body = window.document.body;
		var self = this;
		var hl = {
			addClass: function (c) {
				c.split(' ').forEach(function (cls) {
					body.classList.toggle(cls, true);
				});
				return this;
			},
			removeClass: function (c) {
				c.split(' ').forEach(function (cls) {
					body.classList.toggle(cls, false);
				});
				return this;
			},
			hasClass(c){
				return body.classList.contains(c);
			},
			unclass: function () {
				return this.removeClass('ks-hl-down ks-hl-move');
			},
			down: function () {
				return this.unclass().addClass('ks-hl-down');
			},
			move: function () {
				return this.unclass().addClass('ks-hl-move ks-hl-prevent');
			},
			up: function () {
				return this.unclass();
			},
			active: function () {
				return this.hasClass('ks-hl-down');
			},
			moved: function () {
				return this.hasClass('ks-hl-move');
			}
		};
		var textRange;
		var selection;
		
		function prevent(e) {
			e.stopPropagation();
			hl.unclass().addClass('ks-hl-prevent');
			textRange.clear();
			timeClear();
		}
		let eligableElements = ['[body-question]','[item-passage]']
		let downEvent = 'PointerEvents' in window ? 'pointerdown':'mousedown'
		let upEvent = 'PointerEvents' in window ? 'pointerup':'mouseup'
		eligableElements.forEach(querySelector=>{
			let el = element.querySelector(querySelector)
			if(el){
				let s = el.style
				s.cursor='text'
				if('webkitUserSelect' in s) s.webkitUserSelect = 'text'
				if('msUserSelect' in s) s.msUserSelect = 'text'
				if('mozUserSelect' in s) s.mozUserSelect = 'text'
				s.userSelect='text'
				s.ponterEvents = 'auto'
				
				el.addEventListener(downEvent,function(e){
					if(e.stopPropagation) e.stopPropagation()
					//if(e.preventDefault) e.preventDefault()
					let targ = e.currentTarget
					textRange = new TextRange(targ);
				},false)
				el.addEventListener(upEvent,function(e){
					if(e.stopPropagation) e.stopPropagation()
					//if(e.preventDefault) e.preventDefault()
					let targ = e.currentTarget
					if (textRange) {
						textRange.text().replace();
					}
					textRange = null;
				},false)
			}
		})
	};
	Definite((app,Behaviors)=>{
		Behaviors.Highlighter =	class HighlighterBehavior{
			constructor(){}
			item(item){
				item.highlightTool = new KindleSparksHighlighter(item);
				item.highlighterRoot = function(){
					return this.shadowRoot ? this.shadowRoot:this;
				}
				item.getHighlights = function(){
					return this.highlighterRoot().querySelectorAll('.ks-hl')
				}
				item.getActiveHighlights = function(){
					return this.highlighterRoot().querySelectorAll('.ks-hl.active');
				}
			}
		};
		
	},['KindlePublishing.Behaviors'])
	
})(window);
