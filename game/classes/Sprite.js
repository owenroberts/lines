/*
	base class for all game objects
	usually has an animation
	physics and scaling removed in recent version
*/

class Sprite {
	constructor(x, y, w, h, animation, callback) {
		this.position = new Cool.Vector(x, y);
		this.size = new Cool.Vector(w, h); // remove w,h ? i dont really resize sprites
		this.debug = false;
		this.debugColor = "#00ffbb";
		this.collider = {
			position: new Cool.Vector(0, 0),
			size: new Cool.Vector(w, h)
		};
		this.isActive = true;  // need a better name for this - disabled or something ... 
		this.center = false;

		if (animation) this.addAnimation(animation, callback);

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
		return this.center ? this.position.copy().subtract(this.size.copy().divide(2)) : this.position;
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

	display(editorOnScreen) {
		let isDraw = false;
		if (editorOnScreen !== undefined) isDraw = editorOnScreen
		else isDraw = this.isActive && this.isOnScreen();
	
		if (isDraw) {
			if (this.debug) this.drawDebug();
			if (this.animation) {
				this.animation.update();
				this.animation.draw(this.x, this.y, GAME.suspend);
			}
		}
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen() {
		if (this.x + this.width > 0 && 
			this.y + this.height > 0 &&
			this.x < GAME.width &&
			this.y < GAME.height)
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
