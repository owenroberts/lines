class Layer {
	constructor(params) {
		for (const key in params) {
			this[key] = params[key];
		}
		this.toggled = false;
		this.prevColor = this.c;
		this.draw = params.draw || 'None';
		// this.display = true; // display everywhere
		// drop from frame
		// delete entirely ? 
	}

	clean() {
		delete this.toggled;
		delete this.prevColor;
	}

	toggle() {
		this.c = this.toggled ? this.prevColor : "#00CC96";
		this.toggled = !this.toggled;
	}

	remove() {
		lns.layers.splice(lns.layers.indexOf(this), 1);
	}

	addIndex(index) {
		if (!this.isInFrame(index)) {
			if (this.f.s - 1 == index) this.f.s -= 1;
			else if (this.f.e + 1 == index) this.f.e += 1;
			else lns.layers.push(new Layer({
				...this,
				f: { s: index, e: index }
			}));
		}
	}

	removeIndex(index) {
		if (this.f.s == index && this.f.e == index) lns.layers.splice(this, 1);
		else if (this.f.s == index) this.f.s += 1;
		else if (this.f.e == index) this.f.e -= 1;
		else if (index > this.f.s && index < this.f.e) {
			this.f.e = index - 1;
			lns.layers.push(new Layer({ ...this, f: { s: index + 1, e: this.f.e } }));
		}
	}

	/* what is n? */
	shiftIndex(index, n) {
		if (!n) n = -1;
		if (this.f.s >= index) this.f.s += n;
		if (this.f.e >= index) this.f.e += n;
	}

	isInFrame(index) {
		if (index >= this.f.s && index <= this.f.e) return true;
		else return false;
	}

	getFrames(index) {
		let start, end;
		if (this.draw == 'Explode') end = this.getEx(index);
		if (this.draw == 'Reverse') start = this.getRev(index);
		if (this.draw == 'ExRev') [start, end] = this.getExRev(index);
		return [start, end];
	}

	getEx(index) {
		const segments = lns.drawings[this.d].length / (this.f.e - this.f.s + 1);
		return Math.round(segments * (index - this.f.s + 1));
	}

	getRev(index) {
		const segments = lns.drawings[this.d].length / (this.f.e - this.f.s + 1);
		return Math.round(segments * (index - this.f.s));
	}

	getExRev(index) {
		const mid = this.f.s + ((this.f.e - this.f.s + 1) / 2); // halfway
		if (index < mid) {
			const segments = lns.drawings[this.d].length / (mid - this.f.s + 1);
			return [undefined, Math.round(segments * (index - this.f.s))];
		} else {
			const segments = lns.drawings[this.d].length / (this.f.e - mid + 1);
			return [Math.round(segments * (index - mid)), undefined];
		}
	}
}