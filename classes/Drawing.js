class Drawing {
	constructor(points) {
		this.points = [];
		if (points) {
			for (let i = 0; i < points.length; i++) {
				this.add(points[i]);
			}
		}

		this.offset = new Cool.Vector();
		this.lastDrawCount = 0;
	}

	// add a point
	add(point) {
		if (point == 'end' || point == 0) {
			this.points.push('end');
		} else if (Array.isArray(point)) {
			// from json file
			this.points.push({ x: point[0], y: point[1], off: [] });
		} else {
			this.points.push({ ...point, off: [] });
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

	get needsUpdate() {
		if (this.lastDrawCount < drawCount) {
			this.lastDrawCount = drawCount;
			return true;
		} else {
			return false;
		}
	}



	// update the animtor  properties - happens when the lineCount is 0
	// n number of segments, r randomness of segments
	// w wiggle amount, v, wiggle speed
	// ws is wiggle segments
	update(n, r, w, v, ws) {

		this.offset = new Cool.Vector().random(0, w);
		let speed = new Cool.Vector().random(v);

		// add random offsets for xy for each segment of the lines
		for (let i = 0; i < this.points.length; i++) {
			if (this.points[i] != 'end') {
				this.points[i].off = []; // point offset 

				for (let j = 0; j < n; j++) {
					// calculate wiggle 
					if (w > 0 && (j == 0 || ws)) {
						this.offset.add(speed);
						for (const xy in speed) {
							if (this.offset[xy] >= w || this.offset[xy] <= -w) {
								speed[xy] *= -1;
							}
						}
					}

					// add jiggle to wiggle
					this.points[i].off.push({
						x: Cool.random(-r, r) + this.offset.x,
						y: Cool.random(-r, r) + this.offset.y
					});
				}

			}
		}
	}


}