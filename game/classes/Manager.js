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

}