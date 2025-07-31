import { whichKeyMap } from '../../../cool/cool.js';

/**
 * set up input to access from gm in scenes and components
 */
export class Input {
	
	/**
	 * creates input
	 * @param  {array}  keys - list of keys to use in 
	 */
	constructor(keys=[]) {
		this.keys = {}; // use map?
		keys.forEach(k => { this.keys[k] = false; });
	}

	/**
	 * add a key to list of keys tracked
	 * @param {string} key - key from whichKeyMap in cool.js
	 */
	addKey(key) {
		this.keys[key] = false;
	}

	/**
	 * set key state
	 * @param {string} key   - key from whichKeyMap cooljs
	 * @param {boolean} state - true or false
	 */
	setKey(key, state) {
		this.keys[key] = state;
	}

	/**
	 * get key state
	 * @param {string} key   - key from whichKeyMap cooljs
	 * @return {boolean}
	 */
	getKey(key) {
		return this.keys[key];
	}

	/**
	 * get key state and then turn key off/false
	 * @param  {string} key - key from whichKeyMap cool.js
	 * @return {boolean}
	 */
	triggerKey(key) {
		const s = this.keys[key];
		this.keys[key] = false;
		return s;
	}

	/**
	 * set all keys to false/off
	 */
	reset() {
		for (const k in this.keys) {
			this.keys[k] = false;
		}
	}

	/**
	 * setup keyboard events to listen for keyDown and keyUp
	 * @param  {function} [options.onKeyDown] - gm onKeyDown callback
	 * @param  {function} [options.onKeyUp]   - gm onKeyUp callback
	 */
	setupKeyboardEvents({ onKeyDown, onKeyUp }) {
		document.addEventListener('keydown', ev => {
			// input thing is for inputs? when was that necessary?
			// if (ev.target.tagName === "INPUT") return;
			const key = whichKeyMap[ev.which];
			if (this.keys.hasOwnProperty(key)) {
				this.setKey(key, true);
				if (onKeyDown) onKeyDown(key); 
			}
		});

		document.addEventListener('keyup', ev => {
			// if (ev.target.tagName === "INPUT") return;
			const key = whichKeyMap[ev.which];
			if (this.keys.hasOwnProperty(key)) {
				this.setKey(key, false);
				if (onKeyUp) onKeyUp(key);
			}
		});
	}
}