import { assert } from '../../../cool/cool.js';

/**
 * manage a series of objs by name
 * basically a {} with current key pointing to one of its values
 * maybe also implement for anim states
 */
export class Manager {

	constructor() {
		this.names = [];
		this.current = {};
		this.currentName = '';
	}

	/**
	 * add something to the manager
	 * @param {string} name
	 * @param {object} obj
	 */
	add(name, obj) {
		assert(!this.hasOwnProperty(name), `${name} already exists in manager, cannot be added`);
		this[name] = obj; // this is prob weird, idk
		this.names.push(name);
	}

	/**
	 * set the current obj by name
	 * @param {string} name
	 */
	setCurrent(name) {
		assert(this.hasOwnProperty(name), `${name} does not exists in manager`);
		this.current = this[name];
		this.currentName = name;
	}
}