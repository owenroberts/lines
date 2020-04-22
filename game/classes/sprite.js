class Sprite {
	constructor(x, y, w, h) {
		this.position = new Cool.Vector(x, y);
		this.size = new Cool.Vector(w, h);
		this.debug = false;
		this.debugColor = "#00ffbb";
		this.collider = {
			position: new Cool.Vector(0, 0),
			size: new Cool.Vector(w, h)
		};
		this.isActive = true;  // need a better name for this - disabled or something ... 
		this.center = false;

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick
	}

	get width() {
		return this.size.x;
	}

	get height() {
		return this.size.y;
	}

	get xy() {
		return this.center ? this.position : this.position.subtract(this.size.divide(2));
	}

	get x() {
		return this.xy.x;
	}

	get y() {
		return this.xy.y;
	}

	addAnimation(animation, callback) {
		this.animation = animation;
		this.size.x = this.collider.size.x = this.animation.width;
		this.size.y = this.collider.size.y = this.animation.height;
	}

	setCollider(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.size.x = w;
		this.collider.size.y = h;
	}

	drawDebug() {
		gme.ctx.lineWidth = 1;
		gme.ctx.beginPath();
		gme.ctx.rect(
			this.x + this.collider.position.x,
			this.y + this.collider.position.y,
			this.collider.size.x, 
			this.collider.size.y
		);
		const temp = gme.ctx.strokeStyle;
		gme.ctx.strokeStyle = this.debugColor;
		gme.ctx.stroke();
		gme.ctx.strokeStyle = temp;
	}

	display() {
		if (this.isActive && this.isOnScreen()) {
			if (this.debug) this.drawDebug();
			if (this.animation) {
				this.animation.draw(this.x, this.y);
				this.animation.update();
			}
		}
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen() {
		if (this.x + this.width > 0 && 
			this.y + this.height > 0 &&
			this.x < gme.width &&
			this.y < gme.height)
			return true;
		else
			return false;
	} 

	tap(x, y) {
		if (x > this.x + this.collider.position.x &&
			x < this.x + this.collider.position.x + this.collider.size.x && 
			y > this.y + this.collider.position.y && 
			y < this.y + this.collider.position.y + this.collider.size.y) {
			return true;
		} else 
			return false;
	}

	collide(other, callback) {
		if (this.isActive && other.isActive) {
			if (this.x + this.collider.position.x < other.x + other.collider.position.x + other.collider.size.x &&
				this.x + this.collider.position.x + this.collider.size.x > other.x + other.collider.position.x &&
				this.y + this.collider.position.y < other.y + other.collider.position.y + other.collider.size.y &&
				this.y + this.collider.position.y + this.collider.size.y > other.y + other.collider.position.y) {
				if (callback) callback(this);
				return true;
			}
		} else {
			return false;
		}
	}

	outside(other) {
		var next = this.position.copy();
		var nextCollider = this.collider.position.copy();
		next.add(nextCollider);
		next.add(this.velocity);
		var nextSize = this.collider.size.copy();
		if (next.x < other.position.x + other.collider.position.x ||
			next.x + nextSize.x > other.position.x + other.collider.position.x + other.collider.size.x ||
			next.y < other.position.y + other.collider.position.y ||
			next.y + nextSize.y > other.position.y + other.collider.position.y + other.collider.size.y) {
			return true;
		} else {
			return false;
		}
	}

	over(x, y) {
		if (this.isActive && this.tap(x,y) && !this.mouseOver && !this.waitToGoOut) {
			this.mouseOver = true;
			if (this.onOver) this.onOver();
			return true;
		} else {
			return false;
		}
	}

	out(x, y) {
		if (this.isActive && !this.tap(x,y) && (this.mouseOver || this.waitToGoOut)) {
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
		if (this.isActive && this.tap(x,y)) {
			this.clickStarted = true;
			this.waitToGoOut = true;
			if (this.onDown) this.onDown();
			return true;
		} else {
			return false;
		}
	}

	up(x, y) {
		if (this.isActive && this.tap(x,y) && this.clickStarted) {
			this.mouseOver = false;
			if (this.onUp) this.onUp();
			if (this.onClick) this.onClick();
			if (this.func) func();
			return true;
		} else {
			return false;
		}
		this.clickStarted = false;
	}
}
