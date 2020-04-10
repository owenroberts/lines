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
		const over = super.over(x, y);
		if (over) this.animation.state = 'over';
		return over;
	}

	out(x, y) {
		const out = super.out(x, y);
		if (out) this.animation.state = 'idle';
		return out;
	}

	down(x, y) {
		const down = super.down(x, y);
		if (down)  this.animation.state = 'active';
		return down;
	}

	up(x, y) {
		const up = super.up(x, y);
		if (up) this.animation.state = 'idle';
		return up;
	}
}