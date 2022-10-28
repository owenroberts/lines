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
	}
};