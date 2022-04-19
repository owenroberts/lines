/*
	base class for a sprite with a collider
	for AABB, mouse
	could have mouse sprite, or ui sprite ...
*/

class ColliderSprite extends Sprite {
	constructor(x, y, animation, callback) {
		super(x, y);

		this.collider = [0, 0, 0, 0];

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick

		if (animation) this.addAnimation(animation, callback);
		// console.log(this);
	}

	addAnimation(animation, callback) {
		super.addAnimation(animation, callback);
		this.collider[2] = this.animation.width;
		this.collider[3] = this.animation.height;
	}

	setCollider(x, y, w, h) {
		this.collider = [x, y, w, h];
	}

	drawDebug() {
		GAME.ctx.lineWidth = 1;
		GAME.ctx.beginPath();
		GAME.ctx.rect(
			this.colliderPosition[0],
			this.colliderPosition[1],
			this.collider[2], 
			this.collider[3]
		);

		const temp = GAME.ctx.strokeStyle;
		GAME.ctx.strokeStyle = this.debugColor;
		GAME.ctx.stroke();
		GAME.ctx.strokeStyle = temp;
		if (GAME.lineWidth !== 1) GAME.ctx.lineWidth = GAME.lineWidth;
	}

	get colliderPosition() {
		return [
			this.x + this.collider[0],
			this.y + this.collider[1],
		];
	}

	collide(other, callback) {
		if (this.isActive && other.isActive) {
			if (this.colliderPosition[0] < other.colliderPosition[0] + other.collider[2] &&
				this.colliderPosition[0] + this.collider[2] > other.colliderPosition[0] &&
				this.colliderPosition[1] < other.colliderPosition[1] + other.collider[3] &&
				this.colliderPosition[1] + this.collider[3] > other.colliderPosition[1]) {
				if (callback) callback(this);
				return true;
			} 
		}
		return false;
	}

	tap(x, y) {
		return (
			x > this.colliderPosition[0] &&
			x < (this.colliderPosition[0] + this.collider[2]) &&
			y > this.colliderPosition[1] &&
			y < (this.colliderPosition[1] + this.collider[3])
		);
	}

	outside(other) {
		// rewrite this shit
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
		// console.log('over', this);
		// if (this.debug) console.log(this.tap(x,y))
			// console.log(x,y, this.x * GAME.zoom, this.y * GAME.zoom);
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
			if (this.onClick) this.onClick(x, y);
			if (this.func) this.func();
			return true;
		} else {
			return false;
		}
		this.clickStarted = false;
	}
}