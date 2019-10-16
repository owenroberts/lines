class Layer {
	constructor(params, index) {
		for (const key in params) {
			this[key] = params[key];
		}
		this.toggled = false;

		this.resetAnims();

		this.ui = new UILayer({
			type: 'layer',
			text: ''+index,
			index: index,
			callback: this.toggle.bind(this),
			ondrag: function() {
				console.log(fart)
			}
		}, this);
	}

	clean() {
		delete this.toggled;
		delete this.prevColor;
	}

	toggle() {
		if (!this.prevColor) this.prevColor = this.c;
		this.c = this.toggled ? this.prevColor : "#00CC96";
		this.toggled = !this.toggled;
	}

	remove() {
		lns.anim.layers.splice(lns.anim.layers.indexOf(this), 1);
	}

	addIndex(index) {
		if (!this.isInFrame(index)) {
			if (this.f.s - 1 == index) this.f.s -= 1;
			else if (this.f.e + 1 == index) this.f.e += 1;
			else {
				lns.anim.layers.push(new Layer({
					...this,
					f: { s: index, e: index }
				}));
			}
		}

		/* lns.layers not modular ? */
		if (lns.anim.layers.indexOf(this) == -1) {
			lns.anim.layers.push(this);
		}
	}

	get startFrame() {
		return this.f.s;
	}

	set startFrame(f) {
		this.f.s = f;
		this.resetAnims();
	}

	get endFrame() {
		return this.f.e;
	}

	set endFrame(f) {
		this.f.e = f;
		this.resetAnims();
	}

	removeIndex(index) {
		/* removing layer if not in any frame ... maybe just leave it ? f: -1, -1 or something */
		if (this.f.s == index && this.f.e == index) 
			lns.anim.layers.splice(lns.anim.layers.indexOf(this), 1);
		else if (this.f.s == index) this.f.s += 1;
		else if (this.f.e == index) this.f.e -= 1;
		else if (index > this.f.s && index < this.f.e) {
			const newLayer = _.cloneDeep(this);
			newLayer.f = { s: index + 1, e: this.f.e };
			lns.anim.layers.push(newLayer);
			this.f.e = index - 1;
		}
		this.resetAnims();
	}

	shiftIndex(index, n) {
		if (!n) n = -1;	/* what is n? */
		if (this.f.s >= index) this.f.s += n;
		if (this.f.e >= index) this.f.e += n;
		this.resetAnims();
	}

	isInFrame(index) {
		if (lns.anim.layers.indexOf(this) == -1) return false
		else if (index >= this.f.s && index <= this.f.e) return true;
		else return false;
	}

	getProps(f) {
		const props = {
			s: 0,
			e: lns.anim.drawings[this.d].length /* faster to save?? */
		};
		for (let i = 0; i < this.a.length; i++) {
			const a = this.a[i];
			if (a.sf <= lns.anim.currentFrame && a.ef >= lns.anim.currentFrame) {
				props[a.prop] = Cool.map(f, a.sf, a.ef, a.sv, a.ev);
				if (a.prop == 's' || a.prop == 'e')
					props[a.prop] = Math.round(props[a.prop]);
			}

		}
		return props;
	}

	resetAnims() {
		for (let i = 0; i < this.a.length; i++) {
			const a = this.a[i];
			if (a.sf < this.f.s) a.sf = this.f.s;
			if (a.ef > this.f.e) a.ef = this.f.e;
		}
	}
}