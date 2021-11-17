class SpatialHashGrid {
	constructor(bounds, columns, rows) {
		this.bounds = [[bounds.left, bounds.top], [bounds.right, bounds.bottom]];
		this.columns = Math.floor(columns);
		this.rows = Math.floor(rows);
		this.mapSize = [bounds.right - bounds.left, bounds.bottom - bounds.top];
		this.cellSize = [
			Math.round(this.mapSize[0] / this.columns),
			Math.round(this.mapSize[1] / this.rows)
		];

		this.cells = new Array(this.columns * this.rows);
		for (let x = 0; x < this.columns; x++) {
			for (let y = 0; y < this.rows; y++) {
				this.cells[this.columns * y + x] = [];
			}
		}

		this.ids = -1;
	}

	findNear(_x, _y, w, h) {
		const i = this.getCellIndex([_x - w/2, _y - h/2]);
		const j = this.getCellIndex([_x + w/2, _y + h/2]);

		// console.log(_x, _y, i, j);
		const clients = [];
		const id = this.ids++;


		for (let x = Math.max(i[0] - 1, 0); x <= j[0]; x++) {
			for (let y = i[1]; y <= j[1]; y++) {
				const cell = this.cells[this.columns * y + x];
				for (let i = 0; i < cell.length; i++) {
					if (cell[i].id !== id) {
						cell[i].id = id;
						clients.push(cell[i]);
					}
				}
			}
		}

		return clients;
	}

	addSprite(sprite) {
		this.addClient(sprite.x, sprite.y, sprite.width, sprite.height, sprite);
	}

	addClient(_x, _y, w, h, sprite) {

		const i = this.getCellIndex([_x - w/2, _y - h/2]);
		const j = this.getCellIndex([_x + w/2, _y + h/2]);
		
		const client = {
			position: [_x, _y],
			dimensions: [w, h],
			indexes: [i, j],
			sprite: sprite,
			id: -1,
		};
		// sprite.indexes = [i, j];

		for (let x = i[0]; x <= j[0]; x++) {
			for (let y = i[1]; y <= j[1]; y++) {
				this.cells[this.columns * y + x].push(client);
			}
		}
	}

	getCellIndex(position) {
		const x = Math.floor((position[0] - this.bounds[0][0]) / this.cellSize[0]);
		const y = Math.floor((position[1] - this.bounds[0][1]) / this.cellSize[1]);
		const mx = Math.max(0, Math.min(x, this.columns - 1));
		const my = Math.max(0, Math.min(y, this.rows - 1))
		return [mx, my];
	}
}