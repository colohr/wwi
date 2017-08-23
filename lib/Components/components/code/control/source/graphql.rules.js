((factory)=>{ return factory() })(()=>{
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var RuleHelpers = {};
	
	
	
	
	
	
	Object.defineProperty(RuleHelpers, 'CharacterStream', {
		enumerable: true,
		get: function get() {
			return _interopRequireDefault(CharacterStream).default;
		}
	});
	
	Object.defineProperty(RuleHelpers, 'LexRules', {
		enumerable: true,
		get: function get() {
			return LexRules;
		}
	});
	Object.defineProperty(RuleHelpers, 'ParseRules', {
		enumerable: true,
		get: function get() {
			return ParseRules;
		}
	});
	Object.defineProperty(RuleHelpers, 'isIgnored', {
		enumerable: true,
		get: function get() {
			return isIgnored;
		}
	});
	
	Object.defineProperty(RuleHelpers, 'butNot', {
		enumerable: true,
		get: function get() {
			return butNot;
		}
	});
	
	Object.defineProperty(RuleHelpers, 'list', {
		enumerable: true,
		get: function get() {
			return list;
		}
	});
	Object.defineProperty(RuleHelpers, 'opt', {
		enumerable: true,
		get: function get() {
			return opt;
		}
	});
	Object.defineProperty(RuleHelpers, 'p', {
		enumerable: true,
		get: function get() {
			return p;
		}
	});
	Object.defineProperty(RuleHelpers, 't', {
		enumerable: true,
		get: function get() {
			return t;
		}
	});
	
	
	
	Object.defineProperty(RuleHelpers, 'onlineParser', {
		enumerable: true,
		get: function get() {
			return _interopRequireDefault(onlineParser).default;
		}
	});
	
	var SpecialParseRules = {
		Invalid: [],
		Comment: []
	};
	
	var CharacterStream = function () {
		function CharacterStream(sourceText) {
			var _this = this;
			
			_classCallCheck(this, CharacterStream);
			
			this.getStartOfToken = function () {
				return _this._start;
			};
			
			this.getCurrentPosition = function () {
				return _this._pos;
			};
			
			this.eol = function () {
				return _this._sourceText.length === _this._pos;
			};
			
			this.sol = function () {
				return _this._pos === 0;
			};
			
			this.peek = function () {
				return _this._sourceText.charAt(_this._pos) ? _this._sourceText.charAt(_this._pos) : null;
			};
			
			this.next = function () {
				var char = _this._sourceText.charAt(_this._pos);
				_this._pos++;
				return char;
			};
			
			this.eat = function (pattern) {
				var isMatched = _this._testNextCharacter(pattern);
				if (isMatched) {
					_this._start = _this._pos;
					_this._pos++;
					return _this._sourceText.charAt(_this._pos - 1);
				}
				return undefined;
			};
			
			this.eatWhile = function (match) {
				var isMatched = _this._testNextCharacter(match);
				var didEat = false;
				
				// If a match, treat the total upcoming matches as one token
				if (isMatched) {
					didEat = isMatched;
					_this._start = _this._pos;
				}
				
				while (isMatched) {
					_this._pos++;
					isMatched = _this._testNextCharacter(match);
					didEat = true;
				}
				
				return didEat;
			};
			
			this.eatSpace = function () {
				return _this.eatWhile(/[\s\u00a0]/);
			};
			
			this.skipToEnd = function () {
				_this._pos = _this._sourceText.length;
			};
			
			this.skipTo = function (position) {
				_this._pos = position;
			};
			
			this.match = function (pattern) {
				var consume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
				var caseFold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
				
				var token = null;
				var match = null;
				
				if (typeof pattern === 'string') {
					var regex = new RegExp(pattern, caseFold ? 'i' : 'g');
					match = regex.test(_this._sourceText.substr(_this._pos, pattern.length));
					token = pattern;
				} else if (pattern instanceof RegExp) {
					match = _this._sourceText.slice(_this._pos).match(pattern);
					token = match && match[0];
				}
				
				if (match != null) {
					if (typeof pattern === 'string' || match instanceof Array &&
						// String.match returns 'index' property, which flow fails to detect
						// for some reason. The below is a workaround, but an easier solution
						// is just checking if `match.index === 0`
						_this._sourceText.startsWith(match[0], _this._pos)) {
						if (consume) {
							_this._start = _this._pos;
							if (token && token.length) {
								_this._pos += token.length;
							}
						}
						return match;
					}
				}
				
				// No match available.
				return false;
			};
			
			this.backUp = function (num) {
				_this._pos -= num;
			};
			
			this.column = function () {
				return _this._pos;
			};
			
			this.indentation = function () {
				var match = _this._sourceText.match(/\s*/);
				var indent = 0;
				if (match && match.length === 0) {
					var whitespaces = match[0];
					var pos = 0;
					while (whitespaces.length > pos) {
						if (whitespaces.charCodeAt(pos) === 9) {
							indent += 2;
						} else {
							indent++;
						}
						pos++;
					}
				}
				
				return indent;
			};
			
			this.current = function () {
				return _this._sourceText.slice(_this._start, _this._pos);
			};
			
			this._start = 0;
			this._pos = 0;
			this._sourceText = sourceText;
		}
		
		CharacterStream.prototype._testNextCharacter = function _testNextCharacter(pattern) {
			var character = this._sourceText.charAt(this._pos);
			var isMatched = false;
			if (typeof pattern === 'string') {
				isMatched = character === pattern;
			} else {
				isMatched = pattern instanceof RegExp ? pattern.test(character) : pattern(character);
			}
			return isMatched;
		};
		
		return CharacterStream;
	}();
	
	var LexRules = {
		// The Name token.
		Name: /^[_A-Za-z][_0-9A-Za-z]*/,
		
		// All Punctuation used in GraphQL
		Punctuation: /^(?:!|\$|\(|\)|\.\.\.|:|=|@|\[|]|\{|\||\})/,
		
		// Combines the IntValue and FloatValue tokens.
		Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,
		
		// Note the closing quote is made optional as an IDE experience improvment.
		String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,
		
		// Comments consume entire lines.
		Comment: /^#.*/
	}
	
	
	var ParseRules =  {
		Document: [(0, list)('Definition')],
		Definition: function Definition(token) {
			switch (token.value) {
				case '{':
					return 'ShortQuery';
				case 'query':
					return 'Query';
				case 'mutation':
					return 'Mutation';
				case 'subscription':
					return 'Subscription';
				case 'fragment':
					return 'FragmentDefinition';
				case 'schema':
					return 'SchemaDef';
				case 'scalar':
					return 'ScalarDef';
				case 'type':
					return 'ObjectTypeDef';
				case 'interface':
					return 'InterfaceDef';
				case 'union':
					return 'UnionDef';
				case 'enum':
					return 'EnumDef';
				case 'input':
					return 'InputDef';
				case 'extend':
					return 'ExtendDef';
				case 'directive':
					return 'DirectiveDef';
			}
		},
		
		// Note: instead of "Operation", these rules have been separated out.
		ShortQuery: ['SelectionSet'],
		Query: [word('query'), (0, RuleHelpers.opt)(name('def')), (0, RuleHelpers.opt)('VariableDefinitions'), (0, RuleHelpers.list)('Directive'), 'SelectionSet'],
		Mutation: [word('mutation'), (0, RuleHelpers.opt)(name('def')), (0, RuleHelpers.opt)('VariableDefinitions'), (0, RuleHelpers.list)('Directive'), 'SelectionSet'],
		Subscription: [word('subscription'), (0, RuleHelpers.opt)(name('def')), (0, RuleHelpers.opt)('VariableDefinitions'), (0, RuleHelpers.list)('Directive'), 'SelectionSet'],
		VariableDefinitions: [(0, RuleHelpers.p)('('), (0, RuleHelpers.list)('VariableDefinition'), (0, RuleHelpers.p)(')')],
		VariableDefinition: ['Variable', (0, RuleHelpers.p)(':'), 'Type', (0, RuleHelpers.opt)('DefaultValue')],
		Variable: [(0, RuleHelpers.p)('$', 'variable'), name('variable')],
		DefaultValue: [(0, RuleHelpers.p)('='), 'Value'],
		SelectionSet: [(0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('Selection'), (0, RuleHelpers.p)('}')],
		Selection: function Selection(token, stream) {
			return token.value === '...' ? stream.match(/[\s\u00a0,]*(on\b|@|{)/, false) ? 'InlineFragment' : 'FragmentSpread' : stream.match(/[\s\u00a0,]*:/, false) ? 'AliasedField' : 'Field';
		},
		
		// Note: this minor deviation of "AliasedField" simplifies the lookahead.
		AliasedField: [name('property'), (0, RuleHelpers.p)(':'), name('qualifier'), (0, RuleHelpers.opt)('Arguments'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.opt)('SelectionSet')],
		Field: [name('property'), (0, RuleHelpers.opt)('Arguments'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.opt)('SelectionSet')],
		Arguments: [(0, RuleHelpers.p)('('), (0, RuleHelpers.list)('Argument'), (0, RuleHelpers.p)(')')],
		Argument: [name('attribute'), (0, RuleHelpers.p)(':'), 'Value'],
		FragmentSpread: [(0, RuleHelpers.p)('...'), name('def'), (0, RuleHelpers.list)('Directive')],
		InlineFragment: [(0, RuleHelpers.p)('...'), (0, RuleHelpers.opt)('TypeCondition'), (0, RuleHelpers.list)('Directive'), 'SelectionSet'],
		FragmentDefinition: [word('fragment'), (0, RuleHelpers.opt)((0, RuleHelpers.butNot)(name('def'), [word('on')])), 'TypeCondition', (0, RuleHelpers.list)('Directive'), 'SelectionSet'],
		TypeCondition: [word('on'), 'NamedType'],
		// Variables could be parsed in cases where only Const is expected by spec.
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
						case '$':
							return 'Variable';
					}
					return null;
				case 'Name':
					switch (token.value) {
						case 'true':case 'false':
						return 'BooleanValue';
					}
					if (token.value === 'null') {
						return 'NullValue';
					}
					return 'EnumValue';
			}
		},
		
		NumberValue: [(0, RuleHelpers.t)('Number', 'number')],
		StringValue: [(0, RuleHelpers.t)('String', 'string')],
		BooleanValue: [(0, RuleHelpers.t)('Name', 'builtin')],
		NullValue: [(0, RuleHelpers.t)('Name', 'keyword')],
		EnumValue: [name('string-2')],
		ListValue: [(0, RuleHelpers.p)('['), (0, RuleHelpers.list)('Value'), (0, RuleHelpers.p)(']')],
		ObjectValue: [(0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('ObjectField'), (0, RuleHelpers.p)('}')],
		ObjectField: [name('attribute'), (0, RuleHelpers.p)(':'), 'Value'],
		Type: function Type(token) {
			return token.value === '[' ? 'ListType' : 'NonNullType';
		},
		
		// NonNullType has been merged into ListType to simplify.
		ListType: [(0, RuleHelpers.p)('['), 'Type', (0, RuleHelpers.p)(']'), (0, RuleHelpers.opt)((0, RuleHelpers.p)('!'))],
		NonNullType: ['NamedType', (0, RuleHelpers.opt)((0, RuleHelpers.p)('!'))],
		NamedType: [type('atom')],
		Directive: [(0, RuleHelpers.p)('@', 'meta'), name('meta'), (0, RuleHelpers.opt)('Arguments')],
		// GraphQL schema language
		SchemaDef: [word('schema'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('OperationTypeDef'), (0, RuleHelpers.p)('}')],
		OperationTypeDef: [name('keyword'), (0, RuleHelpers.p)(':'), name('atom')],
		ScalarDef: [word('scalar'), name('atom'), (0, RuleHelpers.list)('Directive')],
		ObjectTypeDef: [word('type'), name('atom'), (0, RuleHelpers.opt)('Implements'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('FieldDef'), (0, RuleHelpers.p)('}')],
		Implements: [word('implements'), (0, RuleHelpers.list)('NamedType')],
		FieldDef: [name('property'), (0, RuleHelpers.opt)('ArgumentsDef'), (0, RuleHelpers.p)(':'), 'Type', (0, RuleHelpers.list)('Directive')],
		ArgumentsDef: [(0, RuleHelpers.p)('('), (0, RuleHelpers.list)('InputValueDef'), (0, RuleHelpers.p)(')')],
		InputValueDef: [name('attribute'), (0, RuleHelpers.p)(':'), 'Type', (0, RuleHelpers.opt)('DefaultValue'), (0, RuleHelpers.list)('Directive')],
		InterfaceDef: [word('interface'), name('atom'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('FieldDef'), (0, RuleHelpers.p)('}')],
		UnionDef: [word('union'), name('atom'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('='), (0, RuleHelpers.list)('UnionMember', (0, RuleHelpers.p)('|'))],
		UnionMember: ['NamedType'],
		EnumDef: [word('enum'), name('atom'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('EnumValueDef'), (0, RuleHelpers.p)('}')],
		EnumValueDef: [name('string-2'), (0, RuleHelpers.list)('Directive')],
		InputDef: [word('input'), name('atom'), (0, RuleHelpers.list)('Directive'), (0, RuleHelpers.p)('{'), (0, RuleHelpers.list)('InputValueDef'), (0, RuleHelpers.p)('}')],
		ExtendDef: [word('extend'), 'ObjectTypeDef'],
		DirectiveDef: [word('directive'), (0, RuleHelpers.p)('@', 'meta'), name('meta'), (0, RuleHelpers.opt)('ArgumentsDef'), word('on'), (0, RuleHelpers.list)('DirectiveLocation', (0, RuleHelpers.p)('|'))],
		DirectiveLocation: [name('string-2')]
	}
	
	
	function isIgnored(ch) {
		return ch === ' ' || ch === '\t' || ch === ',' || ch === '\n' || ch === '\r' || ch === '\uFEFF';
	}
	
	// A keyword Token.
	function word(value) {
		return {
			style: 'keyword',
			match: function match(token) {
				return token.kind === 'Name' && token.value === value;
			}
		};
	}
	
	// A Name Token which will decorate the state with a `name`.
	function name(style) {
		return {
			style: style,
			match: function match(token) {
				return token.kind === 'Name';
			},
			update: function update(state, token) {
				state.name = token.value;
			}
		};
	}
	
	// A Name Token which will decorate the previous state with a `type`.
	function type(style) {
		return {
			style: style,
			match: function match(token) {
				return token.kind === 'Name';
			},
			update: function update(state, token) {
				if (state.prevState && state.prevState.prevState) {
					state.name = token.value;
					state.prevState.prevState.type = token.value;
				}
			}
		};
	}
	
	function onlineParser() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
			eatWhitespace: function eatWhitespace(stream) {
				return stream.eatWhile(isIgnored);
			},
			lexRules: LexRules,
			parseRules: ParseRules,
			editorConfig: {}
		};
		
		return {
			startState: function startState() {
				var initialState = {
					level: 0,
					step: 0,
					name: null,
					kind: null,
					type: null,
					rule: null,
					needsSeperator: false,
					prevState: null
				};
				pushRule(options.parseRules, initialState, 'Document');
				return initialState;
			},
			token: function token(stream, state) {
				return getToken(stream, state, options);
			}
		};
	}
	
	function getToken(stream, state, options) {
		var lexRules = options.lexRules,
			parseRules = options.parseRules,
			eatWhitespace = options.eatWhitespace,
			editorConfig = options.editorConfig;
		// Restore state after an empty-rule.
		
		if (state.rule && state.rule.length === 0) {
			popRule(state);
		} else if (state.needsAdvance) {
			state.needsAdvance = false;
			advanceRule(state, true);
		}
		
		// Remember initial indentation
		if (stream.sol()) {
			var tabSize = editorConfig && editorConfig.tabSize || 2;
			state.indentLevel = Math.floor(stream.indentation() / tabSize);
		}
		
		// Consume spaces and ignored characters
		if (eatWhitespace(stream)) {
			return 'ws';
		}
		
		// Get a matched token from the stream, using lex
		var token = lex(lexRules, stream);
		
		// If there's no matching token, skip ahead.
		if (!token) {
			stream.match(/\S+/);
			pushRule(SpecialParseRules, state, 'Invalid');
			return 'invalidchar';
		}
		
		// If the next token is a Comment, insert a Comment parsing rule.
		if (token.kind === 'Comment') {
			pushRule(SpecialParseRules, state, 'Comment');
			return 'comment';
		}
		
		// Save state before continuing.
		var backupState = assign({}, state);
		
		// Handle changes in expected indentation level
		if (token.kind === 'Punctuation') {
			if (/^[{([]/.test(token.value)) {
				// Push on the stack of levels one level deeper than the current level.
				state.levels = (state.levels || []).concat(state.indentLevel + 1);
			} else if (/^[})\]]/.test(token.value)) {
				// Pop from the stack of levels.
				// If the top of the stack is lower than the current level, lower the
				// current level to match.
				var levels = state.levels = (state.levels || []).slice(0, -1);
				if (state.indentLevel) {
					if (levels.length > 0 && levels[levels.length - 1] < state.indentLevel) {
						state.indentLevel = levels[levels.length - 1];
					}
				}
			}
		}
		
		while (state.rule) {
			// If this is a forking rule, determine what rule to use based on
			var expected = typeof state.rule === 'function' ? state.step === 0 ? state.rule(token, stream) : null : state.rule[state.step];
			
			// Seperator between list elements if necessary.
			if (state.needsSeperator) {
				expected = expected && expected.separator;
			}
			
			if (expected) {
				// Un-wrap optional/list parseRules.
				if (expected.ofRule) {
					expected = expected.ofRule;
				}
				
				// A string represents a Rule
				if (typeof expected === 'string') {
					pushRule(parseRules, state, expected);
					continue;
				}
				
				// Otherwise, match a Terminal.
				if (expected.match && expected.match(token)) {
					if (expected.update) {
						expected.update(state, token);
					}
					
					// If this token was a punctuator, advance the parse rule, otherwise
					// mark the state to be advanced before the next token. This ensures
					// that tokens which can be appended to keep the appropriate state.
					if (token.kind === 'Punctuation') {
						advanceRule(state, true);
					} else {
						state.needsAdvance = true;
					}
					
					return expected.style;
				}
			}
			unsuccessful(state);
		}
		
		// The parser does not know how to interpret this token, do not affect state.
		assign(state, backupState);
		pushRule(SpecialParseRules, state, 'Invalid');
		return 'invalidchar';
	}
	
	// Utility function to assign from object to another object.
	function assign(to, from) {
		var keys = Object.keys(from);
		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
		return to;
	}
	
	// Push a new rule onto the state.
	function pushRule(rules, state, ruleKind) {
		if (!rules[ruleKind]) {
			throw new TypeError('Unknown rule: ' + ruleKind);
		}
		state.prevState = _extends({}, state);
		state.kind = ruleKind;
		state.name = null;
		state.type = null;
		state.rule = rules[ruleKind];
		state.step = 0;
		state.needsSeperator = false;
	}
	
	// Pop the current rule from the state.
	function popRule(state) {
		// Check if there's anything to pop
		if (!state.prevState) {
			return;
		}
		state.kind = state.prevState.kind;
		state.name = state.prevState.name;
		state.type = state.prevState.type;
		state.rule = state.prevState.rule;
		state.step = state.prevState.step;
		state.needsSeperator = state.prevState.needsSeperator;
		state.prevState = state.prevState.prevState;
	}
	
	// Advance the step of the current rule.
	function advanceRule(state, successful) {
		// If this is advancing successfully and the current state is a list, give
		// it an opportunity to repeat itself.
		if (isList(state)) {
			if (state.rule && state.rule[state.step].separator) {
				var separator = state.rule[state.step].separator;
				state.needsSeperator = !state.needsSeperator;
				// If the separator was optional, then give it an opportunity to repeat.
				if (!state.needsSeperator && separator.ofRule) {
					return;
				}
			}
			// If this was a successful list parse, then allow it to repeat itself.
			if (successful) {
				return;
			}
		}
		
		// Advance the step in the rule. If the rule is completed, pop
		// the rule and advance the parent rule as well (recursively).
		state.needsSeperator = false;
		state.step++;
		
		// While the current rule is completed.
		while (state.rule && !(Array.isArray(state.rule) && state.step < state.rule.length)) {
			popRule(state);
			
			if (state.rule) {
				// Do not advance a List step so it has the opportunity to repeat itself.
				if (isList(state)) {
					if (state.rule && state.rule[state.step].separator) {
						state.needsSeperator = !state.needsSeperator;
					}
				} else {
					state.needsSeperator = false;
					state.step++;
				}
			}
		}
	}
	
	function isList(state) {
		return Array.isArray(state.rule) && typeof state.rule[state.step] !== 'string' && state.rule[state.step].isList;
	}
	
	// Unwind the state after an unsuccessful match.
	function unsuccessful(state) {
		// Fall back to the parent rule until you get to an optional or list rule or
		// until the entire stack of rules is empty.
		while (state.rule && !(Array.isArray(state.rule) && state.rule[state.step].ofRule)) {
			popRule(state);
		}
		
		// If there is still a rule, it must be an optional or list rule.
		// Consider this rule a success so that we may move past it.
		if (state.rule) {
			advanceRule(state, false);
		}
	}
	
	// Given a stream, returns a { kind, value } pair, or null.
	function lex(lexRules, stream) {
		var kinds = Object.keys(lexRules);
		for (var i = 0; i < kinds.length; i++) {
			var match = stream.match(lexRules[kinds[i]]);
			if (match && match instanceof Array) {
				return { kind: kinds[i], value: match[0] };
			}
		}
	}
	
	// An optional rule.
	function opt(ofRule) {
		return { ofRule: ofRule };
	}
	
	function list(ofRule, separator) {
		return { ofRule: ofRule, isList: true, separator: separator };
	}
	
	// An constraint described as `but not` in the GraphQL spec.
	function butNot(rule, exclusions) {
		var ruleMatch = rule.match;
		rule.match = function (token) {
			var check = false;
			if (ruleMatch) {
				check = ruleMatch(token);
			}
			return check && exclusions.every(function (exclusion) {
					return exclusion.match && !exclusion.match(token);
				});
		};
		return rule;
	}
	
	// Token of a kind
	function t(kind, style) {
		return { style: style, match: function match(token) {
			return token.kind === kind;
		} };
	}
	
	// Punctuator
	function p(value, style) {
		return {
			style: style || 'punctuation',
			match: function match(token) {
				return token.kind === 'Punctuation' && token.value === value;
			}
		};
	}
	
	
	return RuleHelpers
	
})


