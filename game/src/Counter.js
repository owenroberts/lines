/*
	counter or timer for scheduling events
	returns count
	include delay, or use another counter?
*/


class Counter {
	constructor(duration=24, callback) {
		this.count = 0;
		this.duration = duration;
		this.callback = callback;
	}

	update() {
		if (this.count >= this.duration) return this.count;
		this.count += 1;
		if (this.count >= this.duration) {
			if (this.callback) this.callback();
		}
		return this.count;
	}

	isDone() {
		return this.count >= this.duration;
	}

	reset() {
		this.count = 0;
	}

	ratio() {
		return this.count / this.duration;
	}
}

LinesEngine.Counter = Counter;