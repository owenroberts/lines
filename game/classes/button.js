class Button extends UI {
	constructor(params, debug) {
		super(params, debug);

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;

		if (params.onOver) this.onOver = params.onOver;
		if (params.onOut) this.onOut = params.onOut;
		if (params.onDown) this.onDown = params.onDown;
		if (params.onClick) this.onClick = params.onClick;
	}

	over(x, y) {
		if (this.alive && this.tap(x,y) && !this.mouseOver && !this.waitToGoOut) {
			if (this.animation) this.animation.state = 'over';
			this.mouseOver = true;
			if (this.onOver) this.onOver();
			return true;
		} else {
			return false;
		}
	}

	out(x, y) {
		if (this.alive && !this.tap(x,y) && (this.mouseOver || this.waitToGoOut)) {
			if (this.animation) this.animation.state = 'idle';
			this.clickStarted = false;
			this.waitToGoOut = false;
			this.mouseOver = false;
			if (this.onOut) this.onOut();
			return true;
		} else {
			return false;
		}
	}

	down(x, y) {
		if (this.alive && this.tap(x,y)) {
			if (this.animation) this.animation.state = 'active';
			this.clickStarted = true;
			this.waitToGoOut = true;
			if (this.onDown) this.onDown();
			return true;
		} else {
			return false;
		}
	}

	up(x, y) {
		if (this.alive && this.tap(x,y) && this.clickStarted) {
			if (this.animation) this.animation.state = 'idle';
			this.mouseOver = false;
			if (this.onUp) this.onUp();
			if (this.onClick) this.onClick();
			if (this.func) func();
		}
		this.clickStarted = false;
	}
}