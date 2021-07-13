/*
	base class for a sprite with a collider
	for AABB, mouse
	could have mouse sprite, or ui sprite ...
*/

class ColliderSprite extends Sprite {
	constructor(x, y, animation, callback) {
		super(x, y, animation, callback);
		
		this.collider = {
			position: new Cool.Vector(),
			size: new Cool.Vector()
		};

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick
	}

	addAnimation(animation, callback) {
		super.addAnimation(animation, callback);
		this.collider.size.x = this.animation.width;
		this.collider.size.y = this.animation.height;
	}

	setCollider(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.size.x = w;
		this.collider.size.y = h;
	}

	drawDebug() {
		GAME.ctx.lineWidth = 1;
		GAME.ctx.beginPath();
		GAME.ctx.rect(
			this.x + this.collider.position.x,
			this.y + this.collider.position.y,
			this.collider.size.x, 
			this.collider.size.y
		);
		const temp = GAME.ctx.strokeStyle;
		GAME.ctx.strokeStyle = this.debugColor;
		GAME.ctx.stroke();
		GAME.ctx.strokeStyle = temp;
		if (GAME.lineWidth != 1) GAME.ctx.lineWidth = GAME.lineWidth;
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
		}
		return false;
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
		// console.log(x, y);
		// console.log(this.tap(x, y));
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