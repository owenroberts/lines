class Layer {
	constructor(params) {
		for (const key in params) {
			this[key] = params[key];
		}
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
			} else if (frame.e == index) {
				f.e--;
			} else {
				this.f.push({s: index + 1, e: f.e });
				f.e = index - 1;
			}
		}
	}

	shiftIndex(index) {
		for (let i = this.f.length - 1; i >= 0; i--) {
			const f = this.f[i];
			if (index < f.s) {
				f.s--;
				f.e--;
			} else if (index == f.s && index == f.e) {
				this.f.splice(i, 1);
			} else if (index <= f.e) {
				f.e--;
			}
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
}