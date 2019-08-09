class UI extends Sprite {
	constructor(params, debug) {
		
		/* xy orientation to game window */
		let x = params.x;
		let y = params.y;
		if (x % 1 != 0) x = Game.width * x; /* decimal / percentage of window */
		if (x < 0) x = Game.width + x; /* negative x offset from right side */
		if (y % 1 != 0) y = Game.height * y; /* decimal / percentage of window */
		if (y < 0) y = Game.height + y; /* negative y offset from bottom */
		
		super(x, y);
		this.debug = debug;

		if (params.hidden) this.alive = false; /* alive is more like isVisible */
		this.addAnimation(params.src, () => {
			if (params.state) this.animation.setState(params.state);
		});
		this.selected = params.selected || false;
		if (params.states) {
			this.animation.states = params.states;
			this.animation.state = 'idle';
		}
		this.clickStart = false;
		if (params.func) this.func = window[params.func]; 
		/* shouldnt be attached to window - fine for now */
	}

	toggle(selected) {
		this.selected = selected;
		this.animation.setState(selected ? 'selected' : 'idle')
	}

	over(x, y) {
		if (!this.selected) {
			if (this.tap(x,y)) {
				this.animation.setState('over');
				return true;
			} else {
				this.animation.setState('idle');
				this.clickStart = false;
				return false;
			}
		}
	}

	down(x, y) {
		if (!this.selected) {
			if (this.tap(x,y)) {
				this.animation.setState('active');
				document.body.style.cursor = 'pointer'; /* weird - leave for now */
				this.clickStart = true;
			}
		}
	}

	up(x, y) {
		if (!this.selected) {
			if (this.tap(x,y) && this.clickStart) {
				this.animation.setState('over');
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
