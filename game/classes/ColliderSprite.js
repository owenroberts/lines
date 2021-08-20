/*
	base class for a sprite with a collider
	for AABB, mouse
	could have mouse sprite, or ui sprite ...
*/

class ColliderSprite extends Sprite {
	constructor(x, y, animation, callback) {
		super(x, y);
		
		this.collider = {
			position: [0, 0],
			size: [0, 0],
		};

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick

		if (animation) this.addAnimation(animation, callback);
	}

	addAnimation(animation, callback) {
		super.addAnimation(animation, callback);
		this.collider.size[0] = this.animation.width;
		this.collider.size[1] = this.animation.height;
	}

	setCollider(x, y, w, h) {
		this.collider.position[0] = x;
		this.collider.position[1] = y;
		this.collider.size[0] = w;
		this.collider.size[1] = h;
	}

	drawDebug() {
		GAME.ctx.lineWidth = 1;
		GAME.ctx.beginPath();
		GAME.ctx.rect(
			this.x + this.collider.position[0],
			this.y + this.collider.position[1],
			this.collider.size[0], 
			this.collider.size[1]
		);
		const temp = GAME.ctx.strokeStyle;
		GAME.ctx.strokeStyle = this.debugColor;
		GAME.ctx.stroke();
		GAME.ctx.strokeStyle = temp;
		if (GAME.lineWidth != 1) GAME.ctx.lineWidth = GAME.lineWidth;
	}

	get pos() {
		return [
			this.x + this.collider.position[0],
			this.y + this.collider.position[1],
		];
	}

	get siz() { // wtf
		return [this.collider.size[0], this.collider.size[1]];
	}

	collide(other, callback) {
		if (this.isActive && other.isActive) {
			if (this.pos[0] < other.pos[0] + other.siz[0] &&
				this.pos[0] + this.siz[0] > other.pos[0] &&
				this.pos[1] < other.pos[0] + other.siz[1] &&
				this.pos[1] + this.siz[1] > other.pos[1]) {
				if (callback) callback(this);
				return true;
			} 
		}
		return false;
	}

	tap(x, y) {
		return (x > this.pos[0] * GAME.zoom &&
				x < (this.pos[0] + this.siz[0]) * GAME.zoom &&
				y > this.pos[1] * GAME.zoom &&
				y < (this.pos[1] + this.siz[1]) * GAME.zoom
		);
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
		if (this.debug) console.log(this.tap(x,y))
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
			if (this.onClick) this.onClick();
			if (this.func) this.func();
			return true;
		} else {
			return false;
		}
		this.clickStarted = false;
	}
}