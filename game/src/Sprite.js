/*
	base class for all game objects
	usually has an animation
	physics and scaling removed in recent version
*/

class Sprite {
	constructor(x, y, animation, callback) {
		this.position = [Math.round(x) || 0, Math.round(y) || 0];
		this.size = [0, 0]; // set by animation
		this.halfWidth = 0;
		this.halfHeight = 0;

		this.debug = false;
		this.debugColor = "#00ffbb";
		this.isActive = true;  // need a better name for this - disabled or something ... 
		this.center = false;
		
		if (animation) this.addAnimation(animation, callback);
	}

	get x() {
		return this.xy[0];
	}

	get y() {
		return this.xy[1];
	}

	get width() {
		return this.size[0];
	}

	get height() {
		return this.size[1];
	}

	get xy() {
		if (!this.center) return this.position;
		return [
			this.position[0] - this.halfWidth,
			this.position[1] - this.halfHeight,
		];
	}

	addAnimation(animation, callback) {
		this.animation = animation;
		this.size = [this.animation.width, this.animation.height];
		this.halfWidth = Math.round(this.animation.width / 2);
		this.halfHeight = Math.round(this.animation.height / 2);

		if (callback) callback(animation);
	}

	drawDebug() {
		GAME.ctx.lineWidth = 1;
		GAME.ctx.beginPath();
		GAME.ctx.rect(this.x, this.y, this.width, this.height);
		const temp = GAME.ctx.strokeStyle;
		GAME.ctx.strokeStyle = this.debugColor;
		GAME.ctx.stroke();
		GAME.ctx.strokeStyle = temp;
		if (this.label) GAME.ctx.fillText(this.label, this.position.x, this.position.y);
		if (GAME.lineWidth !== 1) GAME.ctx.lineWidth = GAME.lineWidth;
	}

	display(editorOnScreen) {
		// better way to do this ... 
		let isDraw = false;
		if (editorOnScreen !== undefined) isDraw = editorOnScreen;
		else isDraw = this.isActive && this.isOnScreen();
	
		if (isDraw) {
			// console.log(this.constructor.name, this.debug);
			if (this.debug) this.drawDebug();
			if (this.animation) {
				this.animation.update();
				if (this.isActive) this.animation.draw(this.x, this.y, GAME.suspend);
			}
		}
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen() {
		return (
			this.x + this.width > 0 &&
			this.y + this.height > 0 &&
			this.x < GAME.view.width &&
			this.y < GAME.view.height
		);
	} 
}

window.LinesEngine.Sprite = Sprite;