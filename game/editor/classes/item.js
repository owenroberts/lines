class Item extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.debug = debug;
		this.displayLabel = false;
		this.outline = false;
		this.label = params.label;
		this.src = src || params.src;
		if (this.src) {
			const self = this;
			self.addAnimation(self.src, function() {
				self.center();
				/* animation states ? */
			});
			self.animation.states = params.states || { idle: { start: 0, end: 0 } };
			self.animation.state = params.state || 'idle';
			self.animation.randomFrames = params.r || false;
		}
	}

	display(view) {
		Game.ctx.strokeStyle = '#000000'; // game colors ???
		super.display(this.isInMapBounds(view));
		if (this.displayLabel) this.drawLabel();
		if (this.outline) this.drawOutline();
	}

	isInMapBounds(view) {
		if (this.position.x + this.width > view.x - view.width/2 - Game.width/2 &&
			this.position.x < view.x + view.width/2 + Game.width/2 &&
			this.position.y + this.height > view.y - view.height/2 - Game.height/2 &&
			this.position.y < view.y + view.height/2 + Game.height/2 ) {
			return true;
		} else {
			return false;
		}
	}

	drawLabel() {
		Game.ctx.fillText(this.label, this.position.x, this.position.y);
	}

	drawOutline() {
		Game.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
	}

	mouseOver(x, y, move) {
		if (this.isInMapBounds(zoom.view)) {
			const scale = zoom.canvas.width / zoom.view.width;
			x = x / scale + zoom.view.x - Game.width/2;
			y = y / scale + zoom.view.y - Game.height/2;

			if (x > this.position.x &&
				x < this.position.x + this.width &&
				y > this.position.y &&
				y < this.position.y + this.height) {
				this.displayLabel = true;
				this.outline = true;
				if (move) this.move = true;
				return this;
			} else {
				if (!this.move) {
					this.displayLabel = false;
					this.outline = false;
					return false;
				}
			}
		}
	}

	updatePosition(x, y) {
		this.position.x += Math.round(x);
		this.position.y += Math.round(y);
		this.path.x = this.position.x;
		this.path.y = this.position.y;
	}
}