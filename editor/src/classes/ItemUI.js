class ItemUI extends Entity {
	constructor(params, src, debug) {
		super(params, src, debug);
		this.x = params.x;
		this.y = params.y;
	}

	set x(x) {
		this._x = x;
		if (x % 1 != 0) this.position.x = GAME.width * x; /* decimal / percentage of window */
		else if (x < 0) this.position.x = GAME.width + x; /* negative x offset from right side */
		else this.position.x = x;
	}

	get x() {
		return this._x;
	}

	set y(y) {
		this._y = y;
		if (y % 1 != 0) this.position.y = GAME.height * y; /* decimal / percentage of window */
		else if (y < 0) this.position.y = GAME.height + y; /* negative y offset from bottom */
		else this.position.y = y;
	}

	get y() {
		return this._y;
	}

	display() {
		GAME.ctx.strokeStyle = '#000000'; // game colors ???
		super.display(true);
		if (this.displayLabel) this.drawLabel();
		if (this.outline) this.drawOutline();
	}

	mouseOver(x, y, select) {
		if (x > this.position.x &&
			x < this.position.x + this.width &&
			y > this.position.y &&
			y < this.position.y + this.height) {
			this.displayLabel = true;
			this.outline = true;
			if (select) this.selected = true;
			return this;
		} else {
			if (!this.selected) {
				this.displayLabel = false;
				this.outline = false;
				return false;
			}
		}
	}

	createUI() {
		const self = this;
		super.createUI();

		this.ui.x.setValue(this.x);
		this.ui.x.callback = function(value) {
			self.x = +value;
		};

		this.ui.y.setValue(this.y);
		this.ui.y.callback = function(value) {
			self.y = +value;
		};
	}

	updatePosition(x, y) {
		this.position.x += Math.round(x);
		this.position.y += Math.round(y);
	}
}