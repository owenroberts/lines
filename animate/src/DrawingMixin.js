
import { Points } from '../../src/Lines.js';

/**
 * methods used in animate
 * @type {object}
 */
export const DrawingMixin = {

	getPoints() {
		return structuredClone(this.points);
	},
	
	reset() {
		this.points = [];
		this.offsets = [];
	},

	popPoint() {
		if (this.length > 0) {
			if (this.pop() === Points.END) this.pop();
			this.add(Points.END);
		}
	},

	popLine() {
		if (this.length > 0) {
			this.pop(); // remove end
			let len = this.length - 1;
			for (let i = len; i >= 0; i--) {
				if (this.points[i] !== Points.END &&
					this.points[i] !== Points.ADD) {
					this.pop();
				}
				else break;
			}
		}
	}
};