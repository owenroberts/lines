class Marker {
	constructor(x, y) {
		this.position = Cool.Vector(x, y);
	}

	display() {
		Game.ctx.strokeStyle = '#ff00ff';
		Game.ctx.beginPath();
		Game.ctx.moveTo(-50, 0);
		Game.ctx.lineTo(50, 0);
		Game.ctx.stroke();
	
		Game.ctx.strokeStyle = '#ffff00';
		Game.ctx.beginPath();
		Game.ctx.moveTo(0, -50);
		Game.ctx.lineTo(0, 50);
		Game.ctx.stroke();
	}
}