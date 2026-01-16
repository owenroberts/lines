import { assert } from '../../cool/cool.js';

/**
 * manage a series of objs by name
 * basically a {} with current key pointing to one of its values
 */
export class Manager {

	constructor() {
		this.names = [];
		this.current = {};
		this.currentName = '';

		// maybe try Object.define(this, "current") ?
	}

	/**
	 * add something to the manager
	 * @param {string} name
	 * @param {object} obj
	 */
	add(name, obj) {
		assert(!this.hasOwnProperty(name), `${name} already exists in manager, cannot be added`);
		assert(!obj.hasOwnProperty(name), `name is reserved, cant use name as obj key`);
		this[name] = obj; // this is prob weird, idk
		this[name].name = name; // lol
		this.names.push(name);
	}

	/**
	 * set the current obj by name
	 * @param {string} name
	 */
	set(name) {
		assert(this.hasOwnProperty(name), `${name} does not exists in manager`);
		this.current = this[name];
		this.currentName = name;
	}

	/**
	 * remove by name
	 * @param {string} name
	 */
	remove(name) {
		assert(this.hasOwnProperty(name), `${name} does not exists in manager`);
		this.names.splice(this.names.indexOf(name), 1);
		delete this[name];
		if (this.currentName === name) {
			this.currentName = this.names[0] ?? "";
		}

		this.current = this[this.currentName] ?? {};
	}
}