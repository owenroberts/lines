/*
	methods for animate
*/

import { POINTS } from '../../src/Lines.js';

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
			if (this.pop() === POINTS.END) this.pop();
			this.add(POINTS.END);
		}
	},

	popLine() {
		if (this.length > 0) {
			this.pop(); // remove end
			let len = this.length - 1;
			for (let i = len; i >= 0; i--) {
				if (this.points[i] !== POINTS.END &&
					this.points[i] !== POINTS.ADD) {
					this.pop();
				}
				else break;
			}
		}
	}
};