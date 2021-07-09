/*
	spatial (hash?) grid 
*/

function sat(x) {
	return Math.min(Math.max(x, 0.0), 1.0);
}

class SpatialGrid {
	constructor(bounds, dimensions) {
		this.bounds = [[bounds.left, bounds.top], [bounds.right, bounds.bottom]];
		this.dimensions = dimensions; // [w, h]
		this.cells = new Map();
	}

	getCellIndex(position) {
		const x = sat((position[0] - this.bounds[0][0]) / (
			this.bounds[1][0] - this.bounds[0][0]));
   		const y = sat((position[1] - this.bounds[0][1]) / (
			this.bounds[1][1] - this.bounds[0][1]));
  
      const xIndex = Math.floor(x * (this.dimensions[0] - 1));
      const yIndex = Math.floor(y * (this.dimensions[1] - 1));
  
      return [xIndex, yIndex];
	}

	getKey(i, j) {
		return `${i}.${j}`;
	}

	addClient(position, dimensions) {
		const [x, y] = position;
		const [w, h] = dimensions;
		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);
		
		for (let x = i[0], xn = j[0]; x <= xn; x++) {
			for (let y = i[1], yn = j[1]; y < yn; y++) {
				const k = this.getKey(x, y);
				if (!(k in this.cells)) {
					this.cells[k] = new Set();
				}
				const client = {
					position: position,
					dimensions: dimensions,
					indexes: [i, j],
				};
				this.cells[k].add(client);
			}
		}
	}

	getCells(x, y, w, h) {
		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);
		const cells = [];
		console.log(x,y, w,h, i, j);
		for (let x = i[0], xn = j[0]; x <= xn; x++) {
			for (let y = i[1], yn = j[1]; y < yn; y++) {
				const k = this.getKey(x, y);
				cells.push(k);
			}
		}
		return cells;
	}

	getNearBy(x, y, w, h) {
		const i = this.getCellIndex([x - w / 2, y - h / 2]);
		const j = this.getCellIndex([x + w / 2, y + h / 2]);
		const clients = new Set();
		for (let x = i[0], xn = j[0]; x <= xn; ++x) {
			for (let y = i[1], yn = j[1]; y <= yn; ++y) {
				const k = this.getKey(x, y);
				if (k in this.cells) {
					for (let v of this.cells[k]) {
						clients.add(v);
					}
				}
			}
		}
		return clients;
	}

}