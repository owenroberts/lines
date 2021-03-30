class Drawing {
	constructor(points) {
		this.points = [];
		if (points) {
			for (let i = 0; i < points.length; i++) {
				this.add(points[i]);
			}
		}

		// this.offset = new Cool.Vector();

	}

	// add a point
	add(point) {
		if (point == 'end' || point == 0) {
			this.points.push('end');
		} else if (Array.isArray(point)) { 	// from json file
			const v = new Cool.Vector(point);
			v.off = [];
			this.points.push(v);
		} else {
			point.off = []; // maybe ditch cool.js and make LinesVector ? -- 
			this.points.push(point);
		}
	}

	pop() {
		this.points.pop();
	}

	get(index) {
		if (index < 0) {
			return this.points[this.points.length - index];
		}
		return this.points[index];
	}

	get length() {
		return this.points.length;
	}

	// update the animtor  properties - happens when the lineCount is 0
	update(props) {

		if (!this.worker) {
			console.log(location);
			this.worker = new Worker('lines/build/worker.min.js');
			this.worker.onmessage = (event) => {
				this.workerUpdate(event.data);
			}
		}

		this.worker.postMessage({
			props: props,
			points: this.points.map(v => v == 'end' ? 'end' : [v.x, v.y]),
		});
		
	}

	workerUpdate(offsets) {
		for (let i = 0; i < offsets.length; i++) {
			if (this.points[i] != 'end') {
				this.points[i].off = offsets[i].map(off => {
					return { x: off[0], y: off[1] };
				});
			}
		}
	}
}