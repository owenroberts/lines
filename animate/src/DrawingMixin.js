/*
	methods for animate
*/

const DrawingMixin = {

	getData() {
		return this.points.map(point => {
			if (point === 'end') return 0;
			if (point === 'add') return 1;
			return [...point];
		});
	},
	
	reset() {
		this.points = [];
		this.offsets = [];
	},

	popPoint() {
		if (this.length > 0) {
			if (this.pop() === 'end') this.pop();
			this.add('end');
		}
	},

	popLine() {
		if (this.length > 0) {
			this.pop(); // remove end
			let len = this.length - 1;
			for (let i = len; i >= 0; i--) {
				if (this.points[i] !== 'end' &&
					this.points[i] !== 'add') {
					this.pop();
				}
				else break;
			}
		}
	}
};