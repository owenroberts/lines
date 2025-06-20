/*
	used for scenes: gme.scenes, gme.scenes.current etc
	could also be implemented for animation states, other things with states
	basically allows you to set with a string and get an object
	why tho ... wtf
*/

import { assert } from '../../../cool/cool.js';

export class Manager {
	constructor(list=[], classType) {
		// this.classType = className;
		for (let i = 0; i < list.length; i++) {
			this[list[i]] = new classType();
		}
		this._current = list[0];
		this.names = list;
	}

	setCurrent(sceneName) {
		assert(this[sceneName] !== undefined, `${sceneName} does not exist`);
		this._current = sceneName;
	}

	getCurrent() {
		return this[this._current];
	}

	set current(label) {
		this._current = label;
	}

	get current() {
		return this[this._current];
	}

	get currentName() {
		return this._current;
	}

	get list() {
		return this.names;
	}
}