class SpatialHashGrid_Doodoo {
	constructor(bounds, columns, rows) {
		this.bounds = [
			[bounds.left, bounds.top],
			[bounds.right, bounds.bottom],
		];
		this.dimensions = [Math.round(columns), Math.round(rows)];
		// this.cells = new Map();
		this.cells = [new Array(this.dimensions[0]), new Array(this.dimensions[1])];
		for (let x = 0; x < this.dimensions[0]; x++) {
			this.cells[x] = [];
			for (let y = 0; y < this.dimensions[1]; y++) {
				this.cells[x][y] = [];
			}
		}
		console.log(this.cells);

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
  

	addSprite(sprite) {
		const { x, y } = sprite.position;
		const w = sprite.width;
		const h = sprite.height;

		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);

		for (let xs = i[0], xn = j[0]; xs <= xn; ++xs) {
			for (let ys = i[1], yn = j[1]; ys <= yn; ++ys) {
				// if (!this.cells[xs][ys]) this.cells[xs][ys] = [];
				
				this.cells[xs][ys].push({
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
		  		// const k = this.getKey(x, y);
	  			const set = this.cells[x][y];
	  			for (let i = 0; i < set.length; i++) {
	  				const client = set[i];
					if (client.queryId !== queryId) {
						clients.push(client);
						client.queryId = queryId;
					}
				}
			}
		}
		return clients;
	}

}