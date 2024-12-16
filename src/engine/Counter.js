/*
	counter or timer for scheduling events
	returns count
	include delay, or use another counter?
	make it a closure?
*/


export class Counter {
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

	getRatio() {
		return this.count / this.duration;
	}

	end() {
		this.count = this.duration;
	}

	set(count) {
		if (count < 0) {
			this.count = Math.min(this.duration + count, this.duration - 1);
		} else {
			this.count = Math.min(count, this.duration);
		}
	}

	setCount(value) {
		set(value);
	}

	setDuration(value) {
		this.duration = value;
	}
}