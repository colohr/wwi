(function(get_command){ return get_command() }, function(){
	
	const hints = {
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
	}
	const keycodes = {
		"Ctrl-Left": "goSubwordLeft",
		"Ctrl-Right": "goSubwordRight",
		"Cmd-Left": "goLineStartSmart",
		"Ctrl-Alt-Up": "scrollLineUp",
		"Ctrl-Alt-Down": "scrollLineDown",
		"Shift-Cmd-L": "splitSelectionByLine",
		"Shift-Tab": "indentLess",
		"Esc": "singleSelectionTop",
		"Cmd-L": "selectLine",
		"Shift-Ctrl-K": "deleteLine",
		"Cmd-Enter": "insertLineAfter",
		"Shift-Cmd-Enter": "insertLineBefore",
		"Cmd-D": "selectNextOccurrence",
		"Shift-Cmd-Space": "selectScope",
		"Shift-Cmd-M": "selectBetweenBrackets",
		"Cmd-M": "goToBracket",
		"Cmd-Ctrl-Up": "swapLineUp",
		"Cmd-Ctrl-Down": "swapLineDown",
		"Cmd-/": "toggleCommentIndented",
		"Cmd-J": "joinLines",
		"Shift-Cmd-D": "duplicateLine",
		"F9": "sortLines",
		"Cmd-F9": "sortLinesInsensitive",
		"F2": "nextBookmark",
		"Shift-F2": "prevBookmark",
		"Cmd-F2": "toggleBookmark",
		"Shift-Cmd-F2": "clearBookmarks",
		"Alt-F2": "selectBookmarks",
		"Alt-Q": "wrapLines",
		"Cmd-K Cmd-Backspace": "delLineLeft",
		"Backspace": "smartBackspace",
		"Cmd-K Cmd-K": "delLineRight",
		"Cmd-K Cmd-U": "upcaseAtCursor",
		"Cmd-K Cmd-L": "downcaseAtCursor",
		"Cmd-K Cmd-Space": "setSublimeMark",
		"Cmd-K Cmd-A": "selectToSublimeMark",
		"Cmd-K Cmd-W": "deleteToSublimeMark",
		"Cmd-K Cmd-X": "swapWithSublimeMark",
		"Cmd-K Cmd-Y": "sublimeYank",
		"Cmd-K Cmd-G": "clearBookmarks",
		"Cmd-K Cmd-C": "showInCenter",
		"Shift-Ctrl-Up": "selectLinesUpward",
		"Shift-Ctrl-Down": "selectLinesDownward",
		"Cmd-F3": "findUnder",
		"Shift-Cmd-F3": "findUnderPrevious",
		"Shift-Cmd-[": "fold",
		"Shift-Cmd-]": "unfold",
		"Cmd-K Cmd-J": "unfoldAll",
		"Cmd-K Cmd-0": "unfoldAll",
		"Cmd-H": "replace",
	}
	
	class CommandMode{
		constructor(){
			this.hints = hints
			this.keycodes = keycodes
		}
	}
	
	function joinLines(cm) {
		var ranges = cm.listSelections(), joined = [];
		for (var i = 0; i < ranges.length; i++) {
			var range = ranges[i], from = range.from();
			var start = from.line, end = range.to().line;
			while (i < ranges.length - 1 && ranges[i + 1].from().line == end)
				end = ranges[++i].to().line;
			joined.push({start: start, end: end, anchor: !range.empty() && from});
		}
		cm.operation(function() {
			var offset = 0, ranges = [];
			for (var i = 0; i < joined.length; i++) {
				var obj = joined[i];
				var anchor = obj.anchor && Pos(obj.anchor.line - offset, obj.anchor.ch), head;
				for (var line = obj.start; line <= obj.end; line++) {
					var actual = line - offset;
					if (line == obj.end) head = Pos(actual, cm.getLine(actual).length + 1);
					if (actual < cm.lastLine()) {
						cm.replaceRange(" ", Pos(actual), Pos(actual + 1, /^\s*/.exec(cm.getLine(actual + 1))[0].length));
						++offset;
					}
				}
				ranges.push({anchor: anchor || head, head: head});
			}
			cm.setSelections(ranges, 0);
		});
	}
	
})

