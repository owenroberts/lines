import { assert } from '../../../cool/cool.js';

/**
 * keys that should trigger ev.preventDefault to avoid default browser behaviors like scolling
 * @type {array}
 */
const PREVENT_KEYS = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * set up input to access from gm in scenes and components
 * needs keyMap that maps ev.code to key label, { "KeyX": "BTN_1" }
 */
export class Input {
	
	/**
	 * creates input
	 * @param  {object}  keyMap - map of key names to event.code 
	 */
	constructor({ keyMap={} }={}) {
		this.keyMap = keyMap;
		this.keys = new Map();
		Object.values(keyMap).forEach(k => { this.keys.set(k, false); });
	}

	/**
	 * add a key to list of keys tracked
	 * @param {string} key - key from whichKeyMap in cool.js
	 */
	addKey(key) {
		assert(!this.keys.has(key), `${key} already exists in input`);
		this.keys.set(key, false);
	}

	/**
	 * set key state
	 * @param {string} key   - key from whichKeyMap cooljs
	 * @param {boolean} state - true or false
	 */
	setKey(key, state) {
		this.keys.set(key, state);
	}

	/**
	 * get key state
	 * @param {string} key   - key from whichKeyMap cooljs
	 * @return {boolean}
	 */
	getKey(key) {
		return this.keys.get(key);
	}

	/**
	 * get key state and then turn key off/false
	 * @param  {string} key - key from whichKeyMap cool.js
	 * @return {boolean}
	 */
	triggerKey(key) {
		const isDown = this.keys.get(key);
		if (isDown) this.keys.set(key, false);
		return isDown;
	}

	/**
	 * set all keys to false/off
	 */
	reset() {
		for (const k in this.keys) {
			this.keys.set(key, false);
		}
	}

	/**
	 * setup keyboard events to listen for keyDown and keyUp
	 * @param  {function} [options.onKeyDown] - gm onKeyDown callback
	 * @param  {function} [options.onKeyUp]   - gm onKeyUp callback
	 */
	setupKeyboardEvents({ onKeyDown, onKeyUp }={}) {
		document.addEventListener('keydown', ev => {
			if (ev.target.tagName === "INPUT") return;
			if (PREVENT_KEYS.includes(ev.code)) ev.preventDefault();
			const key = this.keyMap[ev.code];
			if (this.keys.has(key)) {
				this.setKey(key, true);
				if (onKeyDown) onKeyDown(key); 
			}
		});

		document.addEventListener('keyup', ev => {
			if (ev.target.tagName === "INPUT") return;
			if (PREVENT_KEYS.includes(ev.code)) ev.preventDefault();
			const key = this.keyMap[ev.code];
			if (this.keys.has(key)) {
				this.setKey(key, false);
				if (onKeyUp) onKeyUp(key);
			}
		});
	}
}