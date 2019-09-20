class Button extends UI {
	constructor(params, debug) {
		super(params, debug);
		this.selected = params.selected || false;
	}

	toggle(selected) {
		this.selected = selected;
		this.animation.state = selected ? 'selected' : 'idle';
	}

	over(x, y) {
		if (!this.selected) {
			if (this.tap(x,y)) {
				this.animation.state = 'over';
				return true;
			} else {
				this.animation.state = 'idle';
				this.clickStart = false;
				return false;
			}
		}
	}

	down(x, y) {
		if (!this.selected) {
			if (this.tap(x,y)) {
				this.animation.state = 'active';
				document.body.style.cursor = 'pointer'; /* weird - leave for now */
				this.clickStart = true;
			}
		}
	}

	up(x, y) {
		if (!this.selected) {
			if (this.tap(x,y) && this.clickStart) {
				this.animation.state = 'over';
				document.body.style.cursor = 'pointer';
				if (this.callback) this.callback();
				if (this.func) this.func();
				this.clickStart = false;
				return true;
			}
		}
		return false;
	}

	/* is this used ? */
	event(x, y) {
		if (this.tap(x, y)) {
			if (this.callback) this.callback();
		}
	}
}