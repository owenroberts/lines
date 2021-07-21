class Marker {
	constructor(x, y, width, height, lineWidth) {
		this.x = x;
		this.y = y;
		this.width = width || 50;
		this.height = height || 50;
		this.lineWidth = lineWidth || 2;
	}

	display(view) {
		if (!this.isInMapBounds(view)) return; 

		if (this.lineWidth !== 1) GAME.ctx.lineWidth = this.lineWidth;
		GAME.ctx.strokeStyle = '#ff00ff';
		GAME.ctx.beginPath();
		GAME.ctx.moveTo(this.x - this.width / 2, this.y);
		GAME.ctx.lineTo(this.x + this.width / 2, this.y);
		GAME.ctx.stroke();
	
		GAME.ctx.strokeStyle = '#ffff00';
		GAME.ctx.beginPath();
		GAME.ctx.moveTo(this.x, this.y - this.height / 2);
		GAME.ctx.lineTo(this.x, this.y + this.height / 2);
		GAME.ctx.stroke();
		if (this.lineWidth !== 1) GAME.ctx.lineWidth = 1;
	}

	isInMapBounds(view) {
		return (
			this.x + this.width > view.x - GAME.halfWidth &&
			this.x < view.x - GAME.halfWidth + view.width &&
			this.y + this.height > view.y - GAME.halfHeight &&
			this.y < view.y - GAME.halfHeight + view.height
		);
	}
}