/*
	empty collider, no animation
*/


class ColliderEmpty {
	constructor(x, y, w, h) {
		this.collider = [x, y, w, h];
		this.position = [x, y];
		this.colliderPosition = [x, y];
		this.isActive = true;
		this.debugColor = "#00ffbb";
	}

	drawDebug() {
		GAME.renderer.ctx.lineWidth = 1;
		GAME.renderer.ctx.beginPath();
		GAME.renderer.ctx.rect(this.collider[0], this.collider[1], this.collider[2], this.collider[3]);
		const temp = GAME.renderer.ctx.strokeStyle;
		GAME.renderer.ctx.strokeStyle = this.debugColor;
		GAME.renderer.ctx.stroke();
		GAME.renderer.ctx.strokeStyle = temp;
		if (this.label) GAME.renderer.ctx.fillText(this.label, this.collider[0], this.collider[1]);
		if (GAME.renderer.lineWidth !== 1) GAME.renderer.ctx.lineWidth = GAME.lineWidth;
	}


}

LinesEngine.ColliderEmpty = ColliderEmpty;