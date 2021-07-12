class SpatialHashGrid {
	constructor(bounds, columns, rows) {
		this.bounds = [
			[bounds.left, bounds.top],
			[bounds.right, bounds.bottom],
		];
		this.dimensions = [Math.round(columns), Math.round(rows)];
		this.cells = new Map();
		this.queryIds = 0;
	}
  
	getCellIndex(position) {
		let x = (position[0] - this.bounds[0][0]) / (
		  this.bounds[1][0] - this.bounds[0][0]);
		let y = (position[1] - this.bounds[0][1]) / (
		  this.bounds[1][1] - this.bounds[0][1]);
		x = x.clamp(0,1);
		y = y.clamp(0,1);
		const xIndex = Math.floor(x * (this.dimensions[0] - 1));
		const yIndex = Math.floor(y * (this.dimensions[1] - 1));

		return [xIndex, yIndex];
	}

	getKey(i, j) {
		return `${i}.${j}`;
	}
  
	addClient(x, y, w, h) {

		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);

		for (let xs = i[0], xn = j[0]; xs <= xn; ++xs) {
			for (let ys = i[1], yn = j[1]; ys <= yn; ++ys) {
				const k = this.getKey(xs, ys);
				if (!this.cells.has(k)) {
					this.cells.set(k, new Set());
				}

				this.cells.get(k).add({
					position: [x, y],
					dimensions: [w, h],
					// indices: [i, j],
					sprite: sprite,
	  			});
			}
		}
	}

	addSprite(sprite) {
		const { x, y } = sprite.position;
		const w = sprite.width;
		const h = sprite.height;

		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);

		for (let xs = i[0], xn = j[0]; xs <= xn; ++xs) {
			for (let ys = i[1], yn = j[1]; ys <= yn; ++ys) {
				const k = this.getKey(xs, ys);
				if (!this.cells.has(k)) {
					this.cells.set(k, []);
				}

				this.cells.get(k).add({
					position: [x, y],
					dimensions: [w, h],
					// indices: [i, j],
					sprite: sprite,
					queryId: -1,
	  			});
			}
		}
	}
  
	findNear(x, y, w, h) {
  
		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);
		const clients = [];
		const queryId = this.queryIds++;

		for (let x = i[0], xn = j[0]; x <= xn; ++x) {
			for (let y = i[1], yn = j[1]; y <= yn; ++y) {
		  		const k = this.getKey(x, y);
		  		if (this.cells.has(k)) {
		  			const set = this.cells.get(k);
					for (let client of set.values()) {
						if (client.queryId !== queryId) {
							clients.push(client);
							client.queryId = queryId;
						}

						
			  		}
			  	}
			}
		}
		return clients;
	}

}