class Layer {
	constructor(params) {
		for (const key in params) {
			this[key] = params[key];
		}
		this.toggled = false;
		this.prevColor = this.c;
		this.draw = 'None';
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
			let adjacent = false;
			for (let i = 0; i < this.f.length; i++) {
				const f = this.f[i]; // frame sequence
				if (f.s - 1 == index) {
					f.s -= 1;
					adjacent = true;
				} else if (f.e + 1 == index) {
					f.e += 1;
					adjacent = true;
				}
			}
			if (!adjacent) this.f.push({s: index, e: index});
		}
	}

	removeIndex(index) {
		for (let i = this.f.length - 1; i >= 0; i--) {
			const f = this.f[i];
			if (f.s == index && f.e == index) {
				this.f.splice(i, 1);
			} else if (f.s == index) {
				f.s++;
			} else if (f.e == index) {
				f.e--;
			} else {
				this.f.push({s: index + 1, e: f.e });
				f.e = index - 1;
			}
		}
	}

	shiftIndex(index, n) {
		if (!n) n = -1;
		for (let i = this.f.length - 1; i >= 0; i--) {
			const f = this.f[i];
			if (f.s >= index) f.s += n;
			if (f.e >= index) f.e += n;
		}
	}

	isInFrame(index) {
		let isInFrame = false;
		for (let i = 0; i < this.f.length; i++) {
			const f = this.f[i]; // frame sequence
			if (index >= f.s && index <= f.e) {
				return true;
				break;
			}
		}
		return false;
	}

	getFrames(index, explode) {
		for (let i = 0; i < this.f.length; i++) {
			const f = this.f[i]; // frame sequence
			if (index >= f.s && index <= f.e) {
				const segments = lns.drawings[this.d].length / (f.e - f.s + 1);
				return Math.round(segments * (explode ? (index - f.s + 1) : (index - f.s)));
			}
		}
	}

	getEx(index) {
		for (let i = 0; i < this.f.length; i++) {
			const f = this.f[i]; // frame sequence
			if (index >= f.s && index <= f.e) {
				const segments = lns.drawings[this.d].length / (f.e - f.s + 1);
				return Math.round(segments * (index - f.s + 1));
			}
		}
	}

	getRev(index) {
		for (let i = 0; i < this.f.length; i++) {
			const f = this.f[i]; // frame sequence
			if (index >= f.s && index <= f.e) {
				const segments = lns.drawings[this.d].length / (f.e - f.s + 1);
				return Math.round(segments * (index - f.s));
			}
		}
	}

	getExRev(index) {
		for (let i = 0; i < this.f.length; i++) {
			const f = this.f[i]; // frame sequence
			if (index >= f.s && index <= f.e) {
				const mid = f.s + ((f.e - f.s + 1) / 2); 	// halfway
				if (index < mid) {
					const segments = lns.drawings[this.d].length / (mid - f.s + 1);
					return [undefined, Math.round(segments * (index - f.s))];
				} else {
					const segments = lns.drawings[this.d].length / (f.e - mid + 1);
					return [Math.round(segments * (index - mid)), undefined];
				}
				
			}
		}
	}
}