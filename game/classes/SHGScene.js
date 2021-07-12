/*
	scene with a grid
*/

class SHGScene extends Scene {
	constructor(bounds, view) {
		super();
		const width = gme.bounds.right - gme.bounds.left;
		const height = gme.bounds.bottom - gme.bounds.top;
		this.grid = new SpatialHashGrid(bounds, width / gme.view.width, height / gme.view.height);
		this.view = [view.width, view.height];
	}

	addSprite(sprite) {
		this.grid.addSprite(sprite);
	}

	display(position) {
		const clients = this.grid.findNear(position.x, position.y, this.view[0], this.view[1]);
		for (let i = 0; i < clients.length; i++) {
			clients[i].sprite.display();
		}
	}

	update(offset, position) {
		const clients = this.grid.findNear(position.x, position.y, this.view[0], this.view[1]);
		for (let i = 0; i < clients.length; i++) {
			clients[i].sprite.update(offset);
		}
	}
}