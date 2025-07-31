
export class Input {
	
	constructor(keys=[]) {
		this.keys = {};
		keys.forEach(k => { this.keys[k] = false; });
	}

	setKey(key, state) {
		this.keys[key] = state;
	}

	getKey(key) {
		return this.keys[key];
	}

	triggerKey(key) {
		const s = this.keys[key];
		this.keys[key] = false;
		return s;
	}

	reset() {
		for (const k in this.keys) {
			this.keys[k] = false;
		}
	}
}