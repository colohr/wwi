(hint=>hint())(()=>{
	return (CodeMirror,Reader) => {
		CodeMirror.defineMode('commands', function (config) {
			var parser = (0, Reader.onlineParser)({
				eatWhitespace: function eatWhitespace(stream) {
					return stream.eatWhile(Reader.isIgnored);
				},
				lexRules: Reader.LexRules,
				parseRules: Reader.ParseRules,
				editorConfig: {tabSize: config.tabSize}
			});
			return {
				config: config,
				startState: parser.startState,
				token: parser.token,
				indent: indent,
				electricInput: /^\s*[})\]]/,
				fold: 'brace',
				lineComment: '#',
				closeBrackets: {
					//pairs: '()[]{}""',
					explode: '()[]{}'
				}
			};
		});
		function indent(state, textAfter) {
			var levels = state.levels;
			// If there is no stack of levels, use the current level.
			// Otherwise, use the top level, pre-emptively dedenting for close braces.
			var level = !levels || levels.length === 0 ? state.indentLevel : levels[levels.length - 1] - (this.electricInput.test(textAfter) ? 1 : 0);
			return level * this.config.indentUnit;
		}
	}
})