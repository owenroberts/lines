/*
	base class for all game objects
	usually has an animation
	physics and scaling removed in recent version
*/

class Sprite {
	constructor(x, y, animation, callback) {
		this.position = new Cool.Vector(Math.round(x), Math.round(y));
		this.size = new Cool.Vector(); // set by animation
		this.debug = false;
		this.debugColor = "#00ffbb";
		this.isActive = true;  // need a better name for this - disabled or something ... 
		this.center = false;
		if (animation) this.addAnimation(animation, callback);
	}

	get width() {
		return this.size.x;
	}

	get height() {
		return this.size.y;
	}

	get xy() {
		return this.center ? 
			this.position.copy().subtract(this.size.copy().divide(2)) : 
			this.position;
	}

	get x() {
		return this.xy.x;
	}

	get y() {
		return this.xy.y;
	}

	addAnimation(animation, callback) {
		this.animation = animation;
		this.size.x = this.animation.width;
		this.size.y = this.animation.height;
	}

	drawDebug() {
		GAME.ctx.lineWidth = 1;
		GAME.ctx.beginPath();
		GAME.ctx.rect(this.x, this.y, this.width, this.height);
		const temp = GAME.ctx.strokeStyle;
		GAME.ctx.strokeStyle = this.debugColor;
		GAME.ctx.stroke();
		GAME.ctx.strokeStyle = temp;
		if (GAME.lineWidth !== 1) GAME.ctx.lineWidth = GAME.lineWidth;
	}

	display(editorOnScreen) {
		// better way to do this ... 
		let isDraw = false;
		if (editorOnScreen !== undefined) isDraw = editorOnScreen;
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
		// simplify
		if (this.x + this.width > 0 && 
			this.y + this.height > 0 &&
			this.x < GAME.view.width &&
			this.y < GAME.view.height)
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

	
}
