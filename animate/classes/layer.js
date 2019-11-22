class Layer {
	constructor(params, index) {
		for (const key in params) {
			this[key] = params[key];
		}
		this.toggled = false;
		this.resetTweens();
		if (this.ui) delete this.ui; /* fix for adding layers in add index or remove index etc */
	}

	clean() {
		delete this.toggled;
		delete this.prevColor;
		delete this.ui;
	}

	toggle() {
		if (!this.prevColor) this.prevColor = this.c;
		this.c = this.toggled ? this.prevColor : "#00CC96";
		this.toggled = !this.toggled;
	}

	remove() {
		lns.anim.layers.splice(lns.anim.layers.indexOf(this), 1);
	}

	addTween(tween) {
		this.t.push(tween);
		if (tween.sf < this.startFrame) this.startFrame = tween.sf;
		if (tween.ef > this.endFrame) this.endFrame = tween.ef;
		this.ui.addTween(tween);
	}

	get startFrame() {
		return this.f.s;
	}

	set startFrame(f) {
		this.f.s = f;
		this.resetTweens();
	}

	get endFrame() {
		return this.f.e;
	}

	set endFrame(f) {
		this.f.e = f;
		this.resetTweens();

		if (lns.anim.state == 'default' && lns.anim.currentState.end != f) 
			lns.anim.currentState.end = f;
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

		this.ui.update();
	}

	removeIndex(index) {
		/* removing layer if not in any frame ... maybe just leave it ? f: -1, -1 or something */
		if (this.f.s == index && this.f.e == index) 
			lns.anim.layers.splice(lns.anim.layers.indexOf(this), 1);
		else if (this.f.s == index) this.f.s += 1;
		else if (this.f.e == index) this.f.e -= 1;
		else if (index > this.f.s && index < this.f.e) {
			const layer = _.cloneDeep(this);
			layer.f = { s: index + 1, e: this.f.e };
			delete layer.ui;
			layer.resetTweens();
			lns.anim.layers.push(layer);
			this.f.e = index;
		}

		this.resetTweens();
		this.ui.update();
	}

	shiftIndex(index, n) {
		if (!n) n = -1;	/* what is n? */
		if (this.f.s >= index) this.f.s += n;
		if (this.f.e >= index) this.f.e += n;
		this.resetTweens();
		this.ui.update();
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
		for (let i = 0; i < this.t.length; i++) {
			const tween = this.t[i];
			if (tween.sf <= lns.anim.currentFrame && tween.ef >= lns.anim.currentFrame) {
				props[tween.prop] = Cool.map(f, tween.sf, tween.ef, tween.sv, tween.ev);
				if (tween.prop == 's' || tween.prop == 'e')
					props[tween.prop] = Math.round(props[tween.prop]);
			}

		}
		return props;
	}

	resetTweens() {
		for (let i = 0; i < this.t.length; i++) {
			const tween = this.t[i];
			if (tween.sf < this.startFrame) tween.sf = this.startFrame;
			if (tween.ef > this.endFrame) tween.ef = this.endFrame;
		}
	}
}