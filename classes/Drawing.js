class Drawing {
	constructor(points) {
		this.points = [];
		if (points) {
			for (let i = 0; i < points.length; i++) {
				this.add(points[i]);
			}
		}

		this.lastDrawCount = 0;
	}

	// add a point
	add(point) {
		if (point == 'end' || point === 0) {
			this.points.push('end');
		} else if (Array.isArray(point)) { 	// from json file
			this.points.push(new Cool.Vector(point));
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

	get needsUpdate() {
		if (this.lastDrawCount < drawCount) {
			this.lastDrawCount = drawCount;
			return true;
		} else {
			return false;
		}
	}

	update(props) {

		const { segmentNum, jiggleRange, wiggleRange, wiggleSpeed, wiggleSegments } = props;
		const speed = new Cool.Vector().random(wiggleSpeed);
		const offset = new Cool.Vector().random(0, wiggleRange);

		// add random offsets for xy for each segment of the lines
		for (let i = 0, len = this.points.length; i < len; i++) {
			if (this.points[i] != 'end') {
				this.points[i].off = []; // point offset 

				for (let j = 0; j < segmentNum; j++) {
					// calculate wiggle 
					if (wiggleRange > 0 && (j === 0 || wiggleSegments)) {
						offset.add(speed);
						for (const xy in speed) {
							if (offset[xy] >= wiggleRange || offset[xy] <= -wiggleRange) {
								speed[xy] *= -1;
							}
						}
					}

					// add jiggle to wiggle -- needs to figure the fuck out!
					this.points[i].off.push({
						x: Cool.random(-jiggleRange, jiggleRange) + offset.x,
						y: Cool.random(-jiggleRange, jiggleRange) + offset.y
					});
				}

			}
		}
	}
}