/*
	used for scenes: gme.scenes, gme.scenes.current etc
	could also be implemented for animation states, other things with states
	basically allows you to set with a string and get an object
*/

class Manager {
	constructor(list, _class) {
		for (let i = 0; i < list.length; i++) {
			this[list[i]] = new _class();
		}
		this._current = list[0];
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

}