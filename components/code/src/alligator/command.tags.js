(function(get_tags){ return get_tags() })(function(){
	
	const dummy = {
		attrs: {
			color: ["red", "green", "blue", "purple", "white", "black", "yellow"],
			size: ["large", "medium", "small"],
			description: null
		},
		children: []
	}
	
	const tags = {
		"!top": ["top"],
		"!attrs": {
			id: null,
			class: ["A", "B", "C"]
		},
		top: {
			attrs: {
				lang: ["en", "de", "fr", "nl"],
				freeform: null
			},
			children: ["animal", "plant"]
		},
		animal: {
			attrs: {
				name: null,
				isduck: ["yes", "no"]
			},
			children: ["wings", "feet", "body", "head", "tail"]
		},
		plant: {
			attrs: {name: null},
			children: ["leaves", "stem", "flowers"]
		},
		wings: dummy, feet: dummy, body: dummy, head: dummy, tail: dummy,
		leaves: dummy, stem: dummy, flowers: dummy
	}
	
	const tag = {
		extraKeys: {
			"'<'": completeAfter,
			"'/'": completeIfAfterLt,
			"' '": completeIfInTag,
			"'='": completeIfInTag,
			"Ctrl-Space": "autocomplete"
		},
		hintOptions: {schemaInfo: tags}
	}
	
	
	function completeAfter(cm, pred) {
		var cur = cm.getCursor();
		if (!pred || pred()) setTimeout(function() {
			if (!cm.state.completionActive)
				cm.showHint({completeSingle: false});
		}, 100);
		return CodeMirror.Pass;
	}
	
	function completeIfAfterLt(cm) {
		return completeAfter(cm, function() {
			var cur = cm.getCursor();
			return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
		});
	}
	
	function completeIfInTag(cm) {
		return completeAfter(cm, function() {
			var tok = cm.getTokenAt(cm.getCursor());
			if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
			var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
			return inner.tagName;
		});
	}
	
	
	return
	
})