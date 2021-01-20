class Marker {
	constructor(x, y) {
		this.position = new Cool.Vector(x, y);
	}

	display() {
		GAME.ctx.strokeStyle = '#ff00ff';
		GAME.ctx.beginPath();
		GAME.ctx.moveTo(-50, 0);
		GAME.ctx.lineTo(50, 0);
		GAME.ctx.stroke();
	
		GAME.ctx.strokeStyle = '#ffff00';
		GAME.ctx.beginPath();
		GAME.ctx.moveTo(0, -50);
		GAME.ctx.lineTo(0, 50);
		GAME.ctx.stroke();
	}
}