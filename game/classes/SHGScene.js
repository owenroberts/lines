/*
	scene with a grid
*/

class SHGScene extends Scene {
	constructor(bounds, width, height) {
		super();
		const w = bounds.right - bounds.left;
		const h = bounds.bottom - bounds.top;
		this.grid = new SpatialHashGrid(bounds, w / width, h / height);
		this.view = [width, height]; // seems nuts but cant get offset right ... 
		this.clients = [];
	}

	addSprite(sprite) {
		this.grid.addSprite(sprite);
	}

	display() {
		// const clients = this.grid.findNear(position[0] - this.view[0] / 2, position[1] - this.view[1] / 2, this.view[0], this.view[1]);
		for (let i = 0; i < this.clients.length; i++) {
			this.clients[i].sprite.display();
		}
	}

	update(offset, position) {
		this.clients = this.grid.findNear(position[0] - this.view[0] / 2, position[1] - this.view[1] / 2, this.view[0], this.view[1]);
		for (let i = 0; i < this.clients.length; i++) {
			this.clients[i].sprite.update(offset);
		}
	}
}