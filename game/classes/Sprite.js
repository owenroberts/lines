/*
	base class for all game objects
	usually has an animation
	physics and scaling removed in recent version
*/

class Sprite {
	constructor(x, y, animation, callback) {
		// this.position = new Cool.Vector(Math.round(x), Math.round(y));
		this.position = [Math.round(x), Math.round(y)];
		// this.size = new Cool.Vector(); // set by animation
		this.size = [0, 0]; // set by animation

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
			this.position[0] - this.size[0] / 2,
			this.position[1] - this.size[1] / 2,
		];
	}

	addAnimation(animation, callback) {
		this.animation = animation;
		this.size = [this.animation.width, this.animation.height];
		// if (this.debug) {
		// 	const label = this.animation.src.split('/').pop();
		// 	this.label = label.replace('.json', '');
		// }
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
			if (this.debug) this.drawDebug();
			if (this.animation) {
				this.animation.update();
				this.animation.draw(this.x, this.y, GAME.suspend);
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
