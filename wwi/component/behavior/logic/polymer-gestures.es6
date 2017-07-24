//
//	@license
//  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
//	This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
//	The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
//	The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
//	Code distributed by Google as part of the polymer project is also
//  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
//
(function (get_polymer_gestures) { return get_polymer_gestures() })
(function () {
	//const userPolymer = window.Polymer;
	// detect native touch action support
	let AsyncModule;
	let HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
	let GESTURE_KEY = '__polymerGestures';
	let HANDLED_OBJ = '__polymerGesturesHandled';
	let TOUCH_ACTION = '__polymerGesturesTouchAction';
	// radius for tap and track
	let TAP_DISTANCE = 25;
	let TRACK_DISTANCE = 5;
	// number of last N track positions to keep
	let TRACK_LENGTH = 2;
	// Disabling "mouse" handlers for 2500ms is enough
	let MOUSE_TIMEOUT = 2500;
	let MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'click'];
	// an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
	let MOUSE_WHICH_TO_BUTTONS = [0, 1, 4, 2];
	let MOUSE_HAS_BUTTONS = (function () {
		try {
			return new MouseEvent('test', {buttons: 1}).buttons === 1;
		} catch (e) {
			return false;
		}
	})();
	/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
	// check for passive event listeners
	let SUPPORTS_PASSIVE = false;
	(function () {
		try {
			let opts = Object.defineProperty({}, 'passive', {get: function () {SUPPORTS_PASSIVE = true;}})
			window.addEventListener('test', null, opts);
			window.removeEventListener('test', null, opts);
		} catch (e) {}
	})();
	// Check for touch-only devices
	let IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);
	let POINTERSTATE = {
		mouse: {
			target: null,
			mouseIgnoreJob: null
		},
		touch: {
			x: 0,
			y: 0,
			id: -1,
			scrollDecided: false
		}
	};
	let AsyncInterface;
	let microtaskCurrHandle = 0;
	let microtaskLastHandle = 0;
	let microtaskCallbacks = [];
	let microtaskNodeContent = 0;
	let microtaskNode = document.createTextNode('');
	let dedupeId = 0;
	
	/**
	 * @namespace Polymer
	 * @summary Polymer is a lightweight library built on top of the web
	 * standards-based Web Components API's, and makes it easy to build your
	 * own custom HTML elements.
	 * @param {Object} info Prototype for the custom element. It must contain
	 * an `is` property to specify the element name. Other properties populate
	 * the element prototype. The `properties`, `observers`, `hostAttributes`,
	 * and `listeners` properties are processed to create element features.
	 * @return {Object} Returns a custom element class for the given provided
	 * prototype `info` object. The name of the element if given by `info.is`.
	 */
	//window.Polymer = function (info) {
	//	return window.Polymer._polymerFn(info);
	//}
	// support user settings on the Polymer object
	//if (userPolymer) {
	//	Object.assign(Polymer, userPolymer);
	//}
	// To be plugged by legacy implementation if loaded
	/**
	 * @param {Object} info Prototype for the custom element. It must contain
	 * an `is` property to specify the element name. Other properties populate
	 * the element prototype. The `properties`, `observers`, `hostAttributes`,
	 * and `listeners` properties are processed to create element features.
	 */
	//window.Polymer._polymerFn = function (info) {
	//	throw new Error('Load polymer.html to use the Polymer() function.');
	//}
	//window.Polymer.version = '2.0.0';
	window.JSCompiler_renameProperty = function (prop, obj) {
		return prop;
	}
	
	
	
	
	function cachingMixin(mixin) {
		return function(base) {
			if (!mixin.__mixinApplications) {
				mixin.__mixinApplications = new WeakMap();
			}
			let map = mixin.__mixinApplications;
			let application = map.get(base);
			if (!application) {
				application = mixin(base);
				map.set(base, application);
			}
			return application;
		};
	}
	
	
	function dedupingMixin(mixin) {
		mixin = cachingMixin(mixin);
		// maintain a unique id for each mixin
		mixin.__dedupeId = ++dedupeId;
		return function(base) {
			let baseSet = base.__mixinSet;
			if (baseSet && baseSet[mixin.__dedupeId]) {
				return base;
			}
			let extended = mixin(base);
			// copy inherited mixin set from the extended class, or the base class
			// NOTE: we avoid use of Set here because some browser (IE11)
			// cannot extend a base Set via the constructor.
			extended.__mixinSet =
				Object.create(extended.__mixinSet || baseSet || null);
			extended.__mixinSet[mixin.__dedupeId] = true;
			return extended;
		}
	};


	new window.MutationObserver(microtaskFlush).observe(microtaskNode, {characterData: true});
	function microtaskFlush() {
		const len = microtaskCallbacks.length;
		for (let i = 0; i < len; i++) {
			let cb = microtaskCallbacks[i];
			if (cb) {
				try {
					cb();
				} catch (e) {
					setTimeout(() => { throw e });
				}
			}
		}
		microtaskCallbacks.splice(0, len);
		microtaskLastHandle += len;
	}

	const Async = {
		/**
		 * Async interface wrapper around `setTimeout`.
		 *
		 * @namespace
		 * @memberof Polymer.Async
		 * @summary Async interface wrapper around `setTimeout`.
		 */
		timeOut: {
			/**
			 * Returns a sub-module with the async interface providing the provided
			 * delay.
			 *
			 * @memberof Polymer.Async.timeOut
			 * @param {number} delay Time to wait before calling callbacks in ms
			 * @return {AsyncInterface} An async timeout interface
			 */
			after(delay) {
				return {
					run(fn) { return setTimeout(fn, delay) },
					cancel: window.clearTimeout.bind(window)
				}
			},
			/**
			 * Enqueues a function called in the next task.
			 *
			 * @memberof Polymer.Async.timeOut
			 * @param {Function} fn Callback to run
			 * @return {number} Handle used for canceling task
			 */
			run: window.setTimeout.bind(window),
			/**
			 * Cancels a previously enqueued `timeOut` callback.
			 *
			 * @memberof Polymer.Async.timeOut
			 * @param {number} handle Handle returned from `run` of callback to cancel
			 */
			cancel: window.clearTimeout.bind(window)
		},
		/**
		 * Async interface wrapper around `requestAnimationFrame`.
		 *
		 * @namespace
		 * @memberof Polymer.Async
		 * @summary Async interface wrapper around `requestAnimationFrame`.
		 */
		animationFrame: {
			/**
			 * Enqueues a function called at `requestAnimationFrame` timing.
			 *
			 * @memberof Polymer.Async.animationFrame
			 * @param {Function} fn Callback to run
			 * @return {number} Handle used for canceling task
			 */
			run: window.requestAnimationFrame.bind(window),
			/**
			 * Cancels a previously enqueued `animationFrame` callback.
			 *
			 * @memberof Polymer.Async.timeOut
			 * @param {number} handle Handle returned from `run` of callback to cancel
			 */
			cancel: window.cancelAnimationFrame.bind(window)
		},
		/**
		 * Async interface wrapper around `requestIdleCallback`.  Falls back to
		 * `setTimeout` on browsers that do not support `requestIdleCallback`.
		 *
		 * @namespace
		 * @memberof Polymer.Async
		 * @summary Async interface wrapper around `requestIdleCallback`.
		 */
		idlePeriod: {
			/**
			 * Enqueues a function called at `requestIdleCallback` timing.
			 *
			 * @memberof Polymer.Async.idlePeriod
			 * @param {function(IdleDeadline)} fn Callback to run
			 * @return {number} Handle used for canceling task
			 */
			run(fn) {
				return window.requestIdleCallback ?
					window.requestIdleCallback(fn) :
					window.setTimeout(fn, 16);
			},
			/**
			 * Cancels a previously enqueued `idlePeriod` callback.
			 *
			 * @memberof Polymer.Async.idlePeriod
			 * @param {number} handle Handle returned from `run` of callback to cancel
			 */
			cancel(handle) {
				window.cancelIdleCallback ?
					window.cancelIdleCallback(handle) :
					window.clearTimeout(handle);
			}
		},
		/**
		 * Async interface for enqueueing callbacks that run at microtask timing.
		 *
		 * Note that microtask timing is achieved via a single `MutationObserver`,
		 * and thus callbacks enqueued with this API will all run in a single
		 * batch, and not interleaved with other microtasks such as promises.
		 * Promises are avoided as an implementation choice for the time being
		 * due to Safari bugs that cause Promises to lack microtask guarantees.
		 *
		 * @namespace
		 * @memberof Polymer.Async
		 * @summary Async interface for enqueueing callbacks that run at microtask
		 *   timing.
		 */
		microTask: {
			/**
			 * Enqueues a function called at microtask timing.
			 *
			 * @memberof Polymer.Async.microTask
			 * @param {Function} callback Callback to run
			 * @return {*} Handle used for canceling task
			 */
			run(callback) {
				microtaskNode.textContent = microtaskNodeContent++;
				microtaskCallbacks.push(callback);
				return microtaskCurrHandle++;
			},
			/**
			 * Cancels a previously enqueued `microTask` callback.
			 *
			 * @memberof Polymer.Async.microTask
			 * @param {number} handle Handle returned from `run` of callback to cancel
			 */
			cancel(handle) {
				const idx = handle - microtaskLastHandle;
				if (idx >= 0) {
					if (!microtaskCallbacks[idx]) {
						throw new Error('invalid async handle: ' + handle);
					}
					microtaskCallbacks[idx] = null;
				}
			}
		}
	};
	
	class Debouncer {
		constructor() {
			this._asyncModule = null;
			this._callback = null;
			this._timer = null;
		}
		
		/**
		 * Sets the scheduler; that is, a module with the Async interface,
		 * a callback and optional arguments to be passed to the run function
		 * from the async module.
		 *
		 * @param {!AsyncModule} asyncModule Object with Async interface.
		 * @param {function()} callback Callback to run.
		 */
		setConfig(asyncModule, callback) {
			this._asyncModule = asyncModule;
			this._callback = callback;
			this._timer = this._asyncModule.run(() => {
				this._timer = null;
				this._callback()
			});
		}
		
		/**
		 * Cancels an active debouncer and returns a reference to itself.
		 */
		cancel() {
			if (this.isActive()) {
				this._asyncModule.cancel(this._timer);
				this._timer = null;
			}
		}
		
		/**
		 * Flushes an active debouncer and returns a reference to itself.
		 */
		flush() {
			if (this.isActive()) {
				this.cancel();
				this._callback();
			}
		}
		
		/**
		 * Returns true if the debouncer is active.
		 *
		 * @return {boolean} True if active.
		 */
		isActive() {
			return this._timer != null;
		}
		
		/**
		 * Creates a debouncer if no debouncer is passed as a parameter
		 * or it cancels an active debouncer otherwise. The following
		 * example shows how a debouncer can be called multiple times within a
		 * microtask and "debounced" such that the provided callback function is
		 * called once. Add this method to a custom element:
		 *
		 * _debounceWork() {
	   *   this._debounceJob = Polymer.Debouncer.debounce(this._debounceJob,
	   *       Polymer.Async.microTask, () => {
	   *     this._doWork();
	   *   });
	   * }
		 *
		 * If the `_debounceWork` method is called multiple times within the same
		 * microtask, the `_doWork` function will be called only once at the next
		 * microtask checkpoint.
		 *
		 * Note: In testing it is often convenient to avoid asynchrony. To accomplish
		 * this with a debouncer, you can use `Polymer.enqueueDebouncer` and
		 * `Polymer.flush`. For example, extend the above example by adding
		 * `Polymer.enqueueDebouncer(this._debounceJob)` at the end of the
		 * `_debounceWork` method. Then in a test, call `Polymer.flush` to ensure
		 * the debouncer has completed.
		 *
		 * @param {Polymer.Debouncer?} debouncer Debouncer object.
		 * @param {!AsyncModule} asyncModule Object with Async interface
		 * @param {function()} callback Callback to run.
		 * @return {!Debouncer} Returns a debouncer object.
		 */
		static debounce(debouncer, asyncModule, callback) {
			if (debouncer instanceof Debouncer) {
				debouncer.cancel();
			} else {
				debouncer = new Debouncer();
			}
			debouncer.setConfig(asyncModule, callback);
			return debouncer;
		}
	}


	let mouseCanceller = function (mouseEvent) {
		// Check for sourceCapabilities, used to distinguish synthetic events
		// if mouseEvent did not come from a device that fires touch events,
		// it was made by a real mouse and should be counted
		// http://wicg.github.io/InputDeviceCapabilities/#dom-inputdevicecapabilities-firestouchevents
		let sc = mouseEvent.sourceCapabilities;
		if (sc && !sc.firesTouchEvents) {
			return;
		}
		// skip synthetic mouse events
		mouseEvent[HANDLED_OBJ] = {skip: true};
		// disable "ghost clicks"
		if (mouseEvent.type === 'click') {
			let path = mouseEvent.composedPath && mouseEvent.composedPath();
			if (path) {
				for (let i = 0; i < path.length; i++) {
					if (path[i] === POINTERSTATE.mouse.target) {
						return;
					}
				}
			}
			mouseEvent.preventDefault();
			mouseEvent.stopPropagation();
		}
	};
	
	
	function setupTeardownMouseCanceller(setup) {
		let events = IS_TOUCH_ONLY ? ['click'] : MOUSE_EVENTS;
		for (let i = 0, en; i < events.length; i++) {
			en = events[i];
			if (setup) {
				document.addEventListener(en, mouseCanceller, true);
			} else {
				document.removeEventListener(en, mouseCanceller, true);
			}
		}
	}
	
	function ignoreMouse(e) {
		if (!POINTERSTATE.mouse.mouseIgnoreJob) {
			setupTeardownMouseCanceller(true);
		}
		let unset = function () {
			setupTeardownMouseCanceller();
			POINTERSTATE.mouse.target = null;
			POINTERSTATE.mouse.mouseIgnoreJob = null;
		};
		POINTERSTATE.mouse.target = e.composedPath()[0];
		POINTERSTATE.mouse.mouseIgnoreJob = Debouncer.debounce(
			POINTERSTATE.mouse.mouseIgnoreJob
			, Async.timeOut.after(MOUSE_TIMEOUT)
			, unset);
	}
	
	function hasLeftMouseButton(ev) {
		let type = ev.type;
		// exit early if the event is not a mouse event
		if (MOUSE_EVENTS.indexOf(type) === -1) {
			return false;
		}
		// ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
		// instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
		if (type === 'mousemove') {
			// allow undefined for testing events
			let buttons = ev.buttons === undefined ? 1 : ev.buttons;
			if ((ev instanceof window.MouseEvent) && !MOUSE_HAS_BUTTONS) {
				buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
			}
			// buttons is a bitmask, check that the left button bit is set (1)
			return Boolean(buttons & 1);
		} else {
			// allow undefined for testing events
			let button = ev.button === undefined ? 0 : ev.button;
			// ev.button is 0 in mousedown/mouseup/click for left button activation
			return button === 0;
		}
	}
	
	function isSyntheticClick(ev) {
		if (ev.type === 'click') {
			// ev.detail is 0 for HTMLElement.click in most browsers
			if (ev.detail === 0) {
				return true;
			}
			// in the worst case, check that the x/y position of the click is within
			// the bounding box of the target of the event
			// Thanks IE 10 >:(
			let t = Gestures._findOriginalTarget(ev);
			// make sure the target of the event is an element so we can use getBoundingClientRect,
			// if not, just assume it is a synthetic click
			if (t.nodeType !== Node.ELEMENT_NODE) {
				return true;
			}
			let bcr = t.getBoundingClientRect();
			// use page x/y to account for scrolling
			let x = ev.pageX, y = ev.pageY;
			// ev is a synthetic click if the position is outside the bounding box of the target
			return !((x >= bcr.left && x <= bcr.right) && (y >= bcr.top && y <= bcr.bottom));
		}
		return false;
	}
	
	
	
	function firstTouchAction(ev) {
		let ta = 'auto';
		let path = ev.composedPath && ev.composedPath();
		if (path) {
			for (let i = 0, n; i < path.length; i++) {
				n = path[i];
				if (n[TOUCH_ACTION]) {
					ta = n[TOUCH_ACTION];
					break;
				}
			}
		}
		return ta;
	}
	
	function trackDocument(stateObj, movefn, upfn) {
		stateObj.movefn = movefn;
		stateObj.upfn = upfn;
		document.addEventListener('mousemove', movefn);
		document.addEventListener('mouseup', upfn);
	}
	
	function untrackDocument(stateObj) {
		document.removeEventListener('mousemove', stateObj.movefn);
		document.removeEventListener('mouseup', stateObj.upfn);
		stateObj.movefn = null;
		stateObj.upfn = null;
	}
	
	// use a document-wide touchend listener to start the ghost-click prevention mechanism
	// Use passive event listeners, if supported, to not affect scrolling performance
	document.addEventListener('touchend', ignoreMouse, SUPPORTS_PASSIVE ? {passive: true} : false);
	/**
	 * Module for adding listeners to a node for the following normalized
	 * cross-platform "gesture" events:
	 * - `down` - mouse or touch went down
	 * - `up` - mouse or touch went up
	 * - `tap` - mouse click or finger tap
	 * - `track` - mouse drag or touch move
	 *
	 * @namespace
	 * @memberof Polymer
	 * @summary Module for adding cross-platform gesture event listeners.
	 */
	const Gestures = {
		gestures: {},
		recognizers: [],
		/**
		 * Finds the element rendered on the screen at the provided coordinates.
		 *
		 * Similar to `document.elementFromPoint`, but pierces through
		 * shadow roots.
		 *
		 * @memberof Polymer.Gestures
		 * @param {number} x Horizontal pixel coordinate
		 * @param {number} y Vertical pixel coordinate
		 * @return {HTMLElement} Returns the deepest shadowRoot inclusive element
		 * found at the screen position given.
		 */
		deepTargetFind: function (x, y) {
			let node = document.elementFromPoint(x, y);
			let next = node;
			// this code path is only taken when native ShadowDOM is used
			// if there is a shadowroot, it may have a node at x/y
			// if there is not a shadowroot, exit the loop
			while (next && next.shadowRoot && !window.ShadyDOM) {
				// if there is a node at x/y in the shadowroot, look deeper
				let oldNext = next;
				next = next.shadowRoot.elementFromPoint(x, y);
				// on Safari, elementFromPoint may return the shadowRoot host
				if (oldNext === next) {
					break;
				}
				if (next) {
					node = next;
				}
			}
			return node;
		},
		/**
		 * a cheaper check than ev.composedPath()[0];
		 *
		 * @private
		 * @param {Event} ev Event.
		 * @return {HTMLElement} Returns the event target.
		 */
		_findOriginalTarget: function (ev) {
			// shadowdom
			if (ev.composedPath) {
				return ev.composedPath()[0];
			}
			// shadydom
			return ev.target;
		},
		/**
		 * @private
		 * @param {Event} ev Event.
		 */
		_handleNative: function (ev) {
			let handled;
			let type = ev.type;
			let node = ev.currentTarget;
			let gobj = node[GESTURE_KEY];
			if (!gobj) {
				return;
			}
			let gs = gobj[type];
			if (!gs) {
				return;
			}
			if (!ev[HANDLED_OBJ]) {
				ev[HANDLED_OBJ] = {};
				if (type.slice(0, 5) === 'touch') {
					let t = ev.changedTouches[0];
					if (type === 'touchstart') {
						// only handle the first finger
						if (ev.touches.length === 1) {
							POINTERSTATE.touch.id = t.identifier;
						}
					}
					if (POINTERSTATE.touch.id !== t.identifier) {
						return;
					}
					if (!HAS_NATIVE_TA) {
						if (type === 'touchstart' || type === 'touchmove') {
							Gestures._handleTouchAction(ev);
						}
					}
				}
			}
			handled = ev[HANDLED_OBJ];
			// used to ignore synthetic mouse events
			if (handled.skip) {
				return;
			}
			let recognizers = Gestures.recognizers;
			// reset recognizer state
			for (let i = 0, r; i < recognizers.length; i++) {
				r = recognizers[i];
				if (gs[r.name] && !handled[r.name]) {
					if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
						r.reset();
					}
				}
			}
			// enforce gesture recognizer order
			for (let i = 0, r; i < recognizers.length; i++) {
				r = recognizers[i];
				if (gs[r.name] && !handled[r.name]) {
					handled[r.name] = true;
					r[type](ev);
				}
			}
		},
		/**
		 * @private
		 * @param {Event} ev Event.
		 */
		_handleTouchAction: function (ev) {
			let t = ev.changedTouches[0];
			let type = ev.type;
			if (type === 'touchstart') {
				POINTERSTATE.touch.x = t.clientX;
				POINTERSTATE.touch.y = t.clientY;
				POINTERSTATE.touch.scrollDecided = false;
			} else if (type === 'touchmove') {
				if (POINTERSTATE.touch.scrollDecided) {
					return;
				}
				POINTERSTATE.touch.scrollDecided = true;
				let ta = firstTouchAction(ev);
				let prevent = false;
				let dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
				let dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
				if (!ev.cancelable) {
					// scrolling is happening
				} else if (ta === 'none') {
					prevent = true;
				} else if (ta === 'pan-x') {
					prevent = dy > dx;
				} else if (ta === 'pan-y') {
					prevent = dx > dy;
				}
				if (prevent) {
					ev.preventDefault();
				} else {
					Gestures.prevent('track');
				}
			}
		},
		/**
		 * Adds an event listener to a node for the given gesture type.
		 *
		 * @memberof Polymer.Gestures
		 * @param {Node} node Node to add listener on
		 * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
		 * @param {Function} handler Event listener function to call
		 * @return {boolean} Returns true if a gesture event listener was added.
		 */
		addListener: function (node, evType, handler) {
			if (this.gestures[evType]) {
				this._add(node, evType, handler);
				return true;
			}
		},
		/**
		 * Removes an event listener from a node for the given gesture type.
		 *
		 * @memberof Polymer.Gestures
		 * @param {Node} node Node to remove listener from
		 * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
		 * @param {Function} handler Event listener function previously passed to
		 *  `addListener`.
		 * @return {boolean} Returns true if a gesture event listener was removed.
		 */
		removeListener: function (node, evType, handler) {
			if (this.gestures[evType]) {
				this._remove(node, evType, handler);
				return true;
			}
		},
		/**
		 * automate the event listeners for the native events
		 *
		 * @private
		 * @param {HTMLElement} node Node on which to add the event.
		 * @param {string} evType Event type to add.
		 * @param {function} handler Event handler function.
		 */
		_add: function (node, evType, handler) {
			let recognizer = this.gestures[evType];
			let deps = recognizer.deps;
			let name = recognizer.name;
			let gobj = node[GESTURE_KEY];
			if (!gobj) {
				node[GESTURE_KEY] = gobj = {};
			}
			for (let i = 0, dep, gd; i < deps.length; i++) {
				dep = deps[i];
				// don't add mouse handlers on iOS because they cause gray selection overlays
				if (IS_TOUCH_ONLY && MOUSE_EVENTS.indexOf(dep) > -1 && dep !== 'click') {
					continue;
				}
				gd = gobj[dep];
				if (!gd) {
					gobj[dep] = gd = {_count: 0};
				}
				if (gd._count === 0) {
					node.addEventListener(dep, this._handleNative);
				}
				gd[name] = (gd[name] || 0) + 1;
				gd._count = (gd._count || 0) + 1;
			}
			node.addEventListener(evType, handler);
			if (recognizer.touchAction) {
				this.setTouchAction(node, recognizer.touchAction);
			}
		},
		/**
		 * automate event listener removal for native events
		 *
		 * @private
		 * @param {HTMLElement} node Node on which to remove the event.
		 * @param {string} evType Event type to remove.
		 * @param {function} handler Event handler function.
		 */
		_remove: function (node, evType, handler) {
			let recognizer = this.gestures[evType];
			let deps = recognizer.deps;
			let name = recognizer.name;
			let gobj = node[GESTURE_KEY];
			if (gobj) {
				for (let i = 0, dep, gd; i < deps.length; i++) {
					dep = deps[i];
					gd = gobj[dep];
					if (gd && gd[name]) {
						gd[name] = (gd[name] || 1) - 1;
						gd._count = (gd._count || 1) - 1;
						if (gd._count === 0) {
							node.removeEventListener(dep, this._handleNative);
						}
					}
				}
			}
			node.removeEventListener(evType, handler);
		},
		/**
		 * Registers a new gesture event recognizer for adding new custom
		 * gesture event types.
		 *
		 * @memberof Polymer.Gestures
		 * @param {Object} recog Gesture recognizer descriptor
		 */
		register: function (recog) {
			this.recognizers.push(recog);
			for (let i = 0; i < recog.emits.length; i++) {
				this.gestures[recog.emits[i]] = recog;
			}
		},
		/**
		 * @private
		 * @param {string} evName Event name.
		 * @return {Object} Returns the gesture for the given event name.
		 */
		_findRecognizerByEvent: function (evName) {
			for (let i = 0, r; i < this.recognizers.length; i++) {
				r = this.recognizers[i];
				for (let j = 0, n; j < r.emits.length; j++) {
					n = r.emits[j];
					if (n === evName) {
						return r;
					}
				}
			}
			return null;
		},
		/**
		 * Sets scrolling direction on node.
		 *
		 * This value is checked on first move, thus it should be called prior to
		 * adding event listeners.
		 *
		 * @memberof Polymer.Gestures
		 * @param {Node} node Node to set touch action setting on
		 * @param {string} value Touch action value
		 */
		setTouchAction: function (node, value) {
			if (HAS_NATIVE_TA) {
				node.style.touchAction = value;
			}
			node[TOUCH_ACTION] = value;
		},
		/**
		 * Dispatches an event on the `target` element of `type` with the given
		 * `detail`.
		 * @private
		 * @param {HTMLElement} target The element on which to fire an event.
		 * @param {string} type The type of event to fire.
		 * @param {Object=} detail The detail object to populate on the event.
		 */
		_fire: function (target, type, detail) {
			let ev = new Event(type, {bubbles: true, cancelable: true, composed: true});
			ev.detail = detail;
			target.dispatchEvent(ev);
			// forward `preventDefault` in a clean way
			if (ev.defaultPrevented) {
				let preventer = detail.preventer || detail.sourceEvent;
				if (preventer && preventer.preventDefault) {
					preventer.preventDefault();
				}
			}
		},
		/**
		 * Prevents the dispatch and default action of the given event name.
		 *
		 * @memberof Polymer.Gestures
		 * @param {string} evName Event name.
		 */
		prevent: function (evName) {
			let recognizer = this._findRecognizerByEvent(evName);
			if (recognizer.info) {
				recognizer.info.prevent = true;
			}
		},
		/**
		 * Reset the 2500ms timeout on processing mouse input after detecting touch input.
		 *
		 * Touch inputs create synthesized mouse inputs anywhere from 0 to 2000ms after the touch.
		 * This method should only be called during testing with simulated touch inputs.
		 * Calling this method in production may cause duplicate taps or other Gestures.
		 *
		 * @memberof Polymer.Gestures
		 */
		resetMouseCanceller: function () {
			if (POINTERSTATE.mouse.mouseIgnoreJob) {
				POINTERSTATE.mouse.mouseIgnoreJob.flush();
			}
		}
	};
	Gestures.register({
		name: 'downup',
		deps: ['mousedown', 'touchstart', 'touchend'],
		flow: {
			start: ['mousedown', 'touchstart'],
			end: ['mouseup', 'touchend']
		},
		emits: ['down', 'up'],
		info: {
			movefn: null,
			upfn: null
		},
		reset: function () {
			untrackDocument(this.info);
		},
		mousedown: function (e) {
			if (!hasLeftMouseButton(e)) {
				return;
			}
			let t = Gestures._findOriginalTarget(e);
			let self = this;
			let movefn = function movefn(e) {
				if (!hasLeftMouseButton(e)) {
					self._fire('up', t, e);
					untrackDocument(self.info);
				}
			};
			let upfn = function upfn(e) {
				if (hasLeftMouseButton(e)) {
					self._fire('up', t, e);
				}
				untrackDocument(self.info);
			};
			trackDocument(this.info, movefn, upfn);
			this._fire('down', t, e);
		},
		touchstart: function (e) {
			this._fire('down', Gestures._findOriginalTarget(e), e.changedTouches[0], e);
		},
		touchend: function (e) {
			this._fire('up', Gestures._findOriginalTarget(e), e.changedTouches[0], e);
		},
		_fire: function (type, target, event, preventer) {
			Gestures._fire(target, type, {
				x: event.clientX,
				y: event.clientY,
				sourceEvent: event,
				preventer: preventer,
				prevent: function (e) {
					return Gestures.prevent(e);
				}
			});
		}
	});
	Gestures.register({
		name: 'track',
		touchAction: 'none',
		deps: ['mousedown', 'touchstart', 'touchmove', 'touchend'],
		flow: {
			start: ['mousedown', 'touchstart'],
			end: ['mouseup', 'touchend']
		},
		emits: ['track'],
		info: {
			x: 0,
			y: 0,
			state: 'start',
			started: false,
			moves: [],
			addMove: function (move) {
				if (this.moves.length > TRACK_LENGTH) {
					this.moves.shift();
				}
				this.moves.push(move);
			},
			movefn: null,
			upfn: null,
			prevent: false
		},
		reset: function () {
			this.info.state = 'start';
			this.info.started = false;
			this.info.moves = [];
			this.info.x = 0;
			this.info.y = 0;
			this.info.prevent = false;
			untrackDocument(this.info);
		},
		hasMovedEnough: function (x, y) {
			if (this.info.prevent) {
				return false;
			}
			if (this.info.started) {
				return true;
			}
			let dx = Math.abs(this.info.x - x);
			let dy = Math.abs(this.info.y - y);
			return (dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE);
		},
		mousedown: function (e) {
			if (!hasLeftMouseButton(e)) {
				return;
			}
			let t = Gestures._findOriginalTarget(e);
			let self = this;
			let movefn = function movefn(e) {
				let x = e.clientX, y = e.clientY;
				if (self.hasMovedEnough(x, y)) {
					// first move is 'start', subsequent moves are 'move', mouseup is 'end'
					self.info.state = self.info.started ? (e.type === 'mouseup' ? 'end' : 'track') : 'start';
					if (self.info.state === 'start') {
						// if and only if tracking, always prevent tap
						Gestures.prevent('tap');
					}
					self.info.addMove({x: x, y: y});
					if (!hasLeftMouseButton(e)) {
						// always _fire "end"
						self.info.state = 'end';
						untrackDocument(self.info);
					}
					self._fire(t, e);
					self.info.started = true;
				}
			};
			let upfn = function upfn(e) {
				if (self.info.started) {
					movefn(e);
				}
				// remove the temporary listeners
				untrackDocument(self.info);
			};
			// add temporary document listeners as mouse retargets
			trackDocument(this.info, movefn, upfn);
			this.info.x = e.clientX;
			this.info.y = e.clientY;
		},
		touchstart: function (e) {
			let ct = e.changedTouches[0];
			this.info.x = ct.clientX;
			this.info.y = ct.clientY;
		},
		touchmove: function (e) {
			let t = Gestures._findOriginalTarget(e);
			let ct = e.changedTouches[0];
			let x = ct.clientX, y = ct.clientY;
			if (this.hasMovedEnough(x, y)) {
				if (this.info.state === 'start') {
					// if and only if tracking, always prevent tap
					Gestures.prevent('tap');
				}
				this.info.addMove({x: x, y: y});
				this._fire(t, ct);
				this.info.state = 'track';
				this.info.started = true;
			}
		},
		touchend: function (e) {
			let t = Gestures._findOriginalTarget(e);
			let ct = e.changedTouches[0];
			// only trackend if track was started and not aborted
			if (this.info.started) {
				// reset started state on up
				this.info.state = 'end';
				this.info.addMove({x: ct.clientX, y: ct.clientY});
				this._fire(t, ct, e);
			}
		},
		_fire: function (target, touch) {
			let secondlast = this.info.moves[this.info.moves.length - 2];
			let lastmove = this.info.moves[this.info.moves.length - 1];
			let dx = lastmove.x - this.info.x;
			let dy = lastmove.y - this.info.y;
			let ddx, ddy = 0;
			if (secondlast) {
				ddx = lastmove.x - secondlast.x;
				ddy = lastmove.y - secondlast.y;
			}
			return Gestures._fire(target, 'track', {
				state: this.info.state,
				x: touch.clientX,
				y: touch.clientY,
				dx: dx,
				dy: dy,
				ddx: ddx,
				ddy: ddy,
				sourceEvent: touch,
				hover: function () {
					return Gestures.deepTargetFind(touch.clientX, touch.clientY);
				}
			});
		}
	});
	Gestures.register({
		name: 'tap',
		deps: ['mousedown', 'click', 'touchstart', 'touchend'],
		flow: {
			start: ['mousedown', 'touchstart'],
			end: ['click', 'touchend']
		},
		emits: ['tap'],
		info: {
			x: NaN,
			y: NaN,
			prevent: false
		},
		reset: function () {
			this.info.x = NaN;
			this.info.y = NaN;
			this.info.prevent = false;
		},
		save: function (e) {
			this.info.x = e.clientX;
			this.info.y = e.clientY;
		},
		mousedown: function (e) {
			if (hasLeftMouseButton(e)) {
				this.save(e);
			}
		},
		click: function (e) {
			if (hasLeftMouseButton(e)) {
				this.forward(e);
			}
		},
		touchstart: function (e) {
			this.save(e.changedTouches[0], e);
		},
		touchend: function (e) {
			this.forward(e.changedTouches[0], e);
		},
		forward: function (e, preventer) {
			let dx = Math.abs(e.clientX - this.info.x);
			let dy = Math.abs(e.clientY - this.info.y);
			let t = Gestures._findOriginalTarget(e);
			// dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
			if (isNaN(dx) || isNaN(dy) || (dx <= TAP_DISTANCE && dy <= TAP_DISTANCE) || isSyntheticClick(e)) {
				// prevent taps from being generated if an event has canceled them
				if (!this.info.prevent) {
					Gestures._fire(t, 'tap', {
						x: e.clientX,
						y: e.clientY,
						sourceEvent: e,
						preventer: preventer
					});
				}
			}
		}
	});
	/** @deprecated */
	Gestures.findOriginalTarget = Gestures._findOriginalTarget;
	/** @deprecated */
	Gestures.add = Gestures.addListener;
	/** @deprecated */
	Gestures.remove = Gestures.removeListener;
	//Polymer.Gestures = Gestures;
	const gestures = Gestures;
	
	return {
		Gestures,
		GestureListeners: dedupingMixin(superClass => {
			class GestureEventListeners extends superClass {
				_addEventListenerToNode(node, eventName, handler) {
					if (!gestures.addListener(node, eventName, handler)) {
						node.addEventListener(eventName,handler)
						//super._addEventListenerToNode(node, eventName, handler);
					}
				}
				
				_removeEventListenerFromNode(node, eventName, handler) {
					if (!gestures.removeListener(node, eventName, handler)) {
						node.removeEventListener(eventName,handler)
						//super._removeEventListenerFromNode(node, eventName, handler);
					}
				}
			}
			return GestureEventListeners;
		})
	}
})