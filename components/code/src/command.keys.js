(function (command_keys) { return command_keys() })
(function () {
	const keys = Symbol.for('Editor Keys')
	const element = Symbol.for('Code Editor Element')
	const event = Symbol.for('Key Event')
	
	const ids = {
		action: {
			"Cmd-\'": "emit"
			//"Ctrl-Right": "goSubwordRight",
			//"Cmd-Left": "goLineStartSmart",
			//"Ctrl-Alt-Up": "scrollLineUp",
			//"Ctrl-Alt-Down": "scrollLineDown",
			//"Shift-Cmd-L": "splitSelectionByLine",
			//"Shift-Tab": "indentLess",
			//"Esc": "singleSelectionTop",
			//"Cmd-L": "selectLine",
			//"Shift-Ctrl-K": "deleteLine",
			//"Cmd-Enter": "insertLineAfter",
			//"Shift-Cmd-Enter": "insertLineBefore",
			//"Cmd-D": "selectNextOccurrence",
			//"Shift-Cmd-Space": "selectScope",
			//"Shift-Cmd-M": "selectBetweenBrackets",
			//"Cmd-M": "goToBracket",
			//"Cmd-Ctrl-Up": "swapLineUp",
			//"Cmd-Ctrl-Down": "swapLineDown",
			//"Cmd-/": "toggleCommentIndented",
			//"Cmd-J": "joinLines",
			//"Shift-Cmd-D": "duplicateLine",
			//"F9": "sortLines",
			//"Cmd-F9": "sortLinesInsensitive",
			//"F2": "nextBookmark",
			//"Shift-F2": "prevBookmark",
			//"Cmd-F2": "toggleBookmark",
			//"Shift-Cmd-F2": "clearBookmarks",
			//"Alt-F2": "selectBookmarks",
			//"Alt-Q": "wrapLines",
			//"Cmd-K Cmd-Backspace": "delLineLeft",
			//"Backspace": "smartBackspace",
			//"Cmd-K Cmd-K": "delLineRight",
			//"Cmd-K Cmd-U": "upcaseAtCursor",
			//"Cmd-K Cmd-L": "downcaseAtCursor",
			//"Cmd-K Cmd-Space": "setSublimeMark",
			//"Cmd-K Cmd-A": "selectToSublimeMark",
			//"Cmd-K Cmd-W": "deleteToSublimeMark",
			//"Cmd-K Cmd-X": "swapWithSublimeMark",
			//"Cmd-K Cmd-Y": "sublimeYank",
			//"Cmd-K Cmd-G": "clearBookmarks",
			//"Cmd-K Cmd-C": "showInCenter",
			//"Shift-Ctrl-Up": "selectLinesUpward",
			//"Shift-Ctrl-Down": "selectLinesDownward",
			//"Cmd-F3": "findUnder",
			//"Shift-Cmd-F3": "findUnderPrevious",
			//"Shift-Cmd-[": "fold",
			//"Shift-Cmd-]": "unfold",
			//"Cmd-K Cmd-J": "unfoldAll",
			//"Cmd-K Cmd-0": "unfoldAll",
			//"Cmd-H": "replace",
		},
		hints: {
			start: [
				{regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
				{regex: /(function)(\s+)([a-z$][\w$]*)/, token: ["keyword", null, "variable-2"]},
				{regex: /(?:function|var|return|if|for|while|else|do|this)\b/, token: "keyword"},
				{regex: /true|false|null|undefined/, token: "atom"},
				{regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
				{regex: /\/\/.*/, token: "comment"},
				{regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
				{regex: /\/\*/, token: "comment", next: "comment"},
				{regex: /[-+\/*=<>!]+/, token: "operator"},
				{regex: /[\{\[\(]/, indent: true},
				{regex: /[\}\]\)]/, dedent: true},
				{regex: /[a-z$][\w$]*/, token: "variable"},
				{regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
			],
			comment: [
				{regex: /.*?\*\//, token: "comment", next: "start"},
				{regex: /.*/, token: "comment"}
			],
			meta: {
				dontIndentStates: ["comment"],
				lineComment: "//"
			}
		},
		names: {
			3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
			19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
			36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
			46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
			106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
			173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
			221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
			63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
		},
		get(named, key_code){
			let id = {}
			console.log(named,key_code)
			var value = Object.keys(this.action).filter(name=>{
				let names = name.split(' ').filter(inner=>named === inner)
				return names.length > 0
			})
			if(value.length) {
				id.modifier = value[0]
				id.command = this.action[value[0]]
			}
			return id
		}
	}
	for (let i = 0; i < 10; i++) ids.names[i + 48] = ids.names[i + 96] = String(i)
	for (let i = 65; i <= 90; i++) ids.names[i] = String.fromCharCode(i)
	for (let i = 1; i <= 12; i++) ids.names[i + 111] = ids.names[i + 63235] = "F" + i
	
	
	const Commands = {
		get(text){
			return {
				get parts(){ return this.text.split(' ') },
				text,
				get target(){ return this.parts[1] },
				get type(){ return this.parts[0] },
				get input(){ return Commands.input(this.text) }
			}
		},
		input(text,expression){
			let regular_expression = expression ? this.regs[expression]:this.regs.value
			let matches = regular_expression.exec(text) //text.match(regular_expression) // regular_expression.match(text)
			if(matches && matches.length > 1) return matches[1]
			return null
		},
		regs:{
			action:/\(([^)]+)\)/,
			value:/{([^}]+)}/,
		}
	}
	
	class Direction {
		constructor(e, id, editor) {
			this[element] = editor
			if(e){
				this.character = e.key
				this.id = id.toLowerCase()
				this.name = ids.names[e.keyCode || e.which]
				this.number = e.keyCode || e.which
				this.type = e.type
			}
			this.id = id
			let code = editor.code
			this.line = {
				first:code.getLine(code.firstLine()),
				last:code.getLine(code.lastLine()),
				value:code.value.trim()
			}
			this.command = Commands.get(this.line.value)
		}
		emit(name){
			if('socket' in this[element]) return this[element].socket.emit(name,this.data)
			return null
		}
		get data(){ return to_data(this) }
	}
	
	class Keys extends WeakMap{
		static get symbol(){ return keys }
		constructor(editor) {
			super()
			let actions = {}
			for(let key in ids.action){
				let action = ids.action[key]
				actions[key] = (cm,e)=>{
					let direction = new Direction(null,action,editor)
					if(dispatches(direction)) editor.dispatch('key',direction)
					return action
				}
			}
			editor.code.setOption("extraKeys", actions)
			editor.code.on('keyHandled',(cm,name,e)=>{
				e.preventDefault()
				if(name === 'Enter' || e.keyCode === 3 || e.which === 3){
					let direction = new Direction(null,'emit',editor)
					if(dispatches(direction)) editor.dispatch('key',direction)
					return
				}
			})
			this.on = (key,action)=>{
				editor.code.setOption("extraKeys", actions)
				return this
			}
		}
		
	}
	
	
	
	return Keys
	
	
	function dispatches(direction){
		if(direction.id === 'emit') return true
		return false
	}
	
	function stop(keys, event) {
		if (event.type in keys.timers) {
			window.clearTimeout(keys.timers[event.type])
			delete keys.timers[event.type]
		}
		return true
	}
	
	function time(keys, event, trigger) {
		if (event instanceof Event) {
			if (!keys.timers) keys.timers = {}
			if (stop(keys, event)) keys.timers[event.type] = window.setTimeout(trigger, 100)
		}
		return null
	}
	
	function to_data(object){
		let keys = Object.keys(object)
		let data = {}
		for(let key of keys){
			if(typeof key === 'string'){
				let value = object[key]
				if(typeof value !== 'function'){
					data[key] = typeof value === 'object' && value !== null ? to_data(value):value
				}
			}
		}
		return data
	}
})
