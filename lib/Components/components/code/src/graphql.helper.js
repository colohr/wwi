(hint=>hint())(()=>{
	return (CodeMirror,Reader) => {
		CodeMirror.registerHelper('hint', 'graphql', function (editor, options) {
			var schema = options.schema;
			if (!schema) {
				return;
			}
			var cur = editor.getCursor();
			var token = editor.getTokenAt(cur);
			var rawResults = (0, Rules.getAutocompleteSuggestions)(schema, editor.getValue(), cur, token);
			var tokenStart = token.type !== null && /"|\w/.test(token.string[0]) ? token.start : token.end;
			var results = {
				list: rawResults.map(function (item) {
					return {
						text: item.label,
						type: item.detail,
						description: item.documentation,
						isDeprecated: item.isDeprecated,
						deprecationReason: item.deprecationReason
					};
				}),
				from: {line: cur.line, column: tokenStart},
				to: {line: cur.line, column: token.end}
			};
			if (results && results.list && results.list.length > 0) {
				results.from = CodeMirror.Pos(results.from.line, results.from.column);
				results.to = CodeMirror.Pos(results.to.line, results.to.column);
				CodeMirror.signal(editor, 'hasCompletion', editor, results, token);
			}
			return results;
		});
		
		CodeMirror.defineMode('graphql-variables', function (config) {
			var parser = (0, Reader.onlineParser)({
				eatWhitespace: function eatWhitespace(stream) {
					return stream.eatSpace();
				},
				lexRules: LexRules,
				parseRules: ParseRules,
				editorConfig: { tabSize: config.tabSize }
			});
			
			return {
				config: config,
				startState: parser.startState,
				token: parser.token,
				indent: indent,
				electricInput: /^\s*[}\]]/,
				fold: 'brace',
				closeBrackets: {
					pairs: '[]{}""',
					explode: '[]{}'
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
		
		/**
		 * The lexer rules. These are exactly as described by the spec.
		 */
		var LexRules = {
			// All Punctuation used in JSON.
			Punctuation: /^\[|]|\{|\}|:|,/,
			
			// JSON Number.
			Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,
			
			// JSON String.
			String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,
			
			// JSON literal keywords.
			Keyword: /^true|false|null/
		};
		
		/**
		 * The parser rules for JSON.
		 */
		var ParseRules = {
			Document: [(0, Reader.p)('{'), (0, Reader.list)('Variable', (0, Reader.opt)((0, Reader.p)(','))), (0, Reader.p)('}')],
			Variable: [namedKey('variable'), (0, Reader.p)(':'), 'Value'],
			Value: function Value(token) {
				switch (token.kind) {
					case 'Number':
						return 'NumberValue';
					case 'String':
						return 'StringValue';
					case 'Punctuation':
						switch (token.value) {
							case '[':
								return 'ListValue';
							case '{':
								return 'ObjectValue';
						}
						return null;
					case 'Keyword':
						switch (token.value) {
							case 'true':case 'false':
							return 'BooleanValue';
							case 'null':
								return 'NullValue';
						}
						return null;
				}
			},
			
			NumberValue: [(0, Reader.t)('Number', 'number')],
			StringValue: [(0, Reader.t)('String', 'string')],
			BooleanValue: [(0, Reader.t)('Keyword', 'builtin')],
			NullValue: [(0, Reader.t)('Keyword', 'keyword')],
			ListValue: [(0, Reader.p)('['), (0, Reader.list)('Value', (0, Reader.opt)((0, Reader.p)(','))), (0, Reader.p)(']')],
			ObjectValue: [(0, Reader.p)('{'), (0, Reader.list)('ObjectField', (0, Reader.opt)((0, Reader.p)(','))), (0, Reader.p)('}')],
			ObjectField: [namedKey('attribute'), (0, Reader.p)(':'), 'Value']
		};
		
		// A namedKey Token which will decorate the state with a `name`
		function namedKey(style) {
			return {
				style: style,
				match: function match(token) {
					return token.kind === 'String';
				},
				update: function update(state, token) {
					state.name = token.value.slice(1, -1); // Remove quotes.
				}
			};
		}
	}
})