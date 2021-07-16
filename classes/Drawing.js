class Drawing {
	constructor(points) {
		this.points = [];
		this.offsets = [];
		if (points) {
			for (let i = 0; i < points.length; i++) {
				this.add(points[i]);
			}
		}

		this.lastDrawCount = 0;
		this.firstUpdate = true;
	}

	// add a point
	add(point) {
		if (point === 'end' || point === 0) {
			this.points.push('end');
		} else if (Array.isArray(point)) { 	// from json file
			this.points.push(point);
		} else {
			this.points.push([point.x, point.y]);
		}
		this.offsets.push([[0,0], [0,0]]); // default add an offset even for end ... work on better way to update this
	}

	pop() {
		this.points.pop();
	}

	get(index) {
		if (index < 0) { // catch for draw.js end func
			return [this.points[this.points.length - index], this.offsets[this.offsets.length - index]];
		}
		return [this.points[index], this.offsets[index]];
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
		const speed = [Cool.random(-wiggleSpeed, wiggleSpeed), Cool.random(-wiggleSpeed, wiggleSpeed)];
		const offset = [Cool.random(0, wiggleRange), Cool.random(0, wiggleRange)];

		// add random offsets for xy for each segment of the lines
		for (let i = 0, len = this.points.length; i < len; i++) {
			if (this.points[i] !== 'end') {
				// this.points[i].off = []; // point offset 
				this.offsets[i] = [];

				for (let j = 0; j < segmentNum; j++) {
					// calculate wiggle 
					if (wiggleRange > 0 && (j === 0 || wiggleSegments)) {
						// offset.add(speed);
						offset[0] += speed[0];
						offset[1] += speed[1];

						if (offset[0] >= wiggleRange || offset[0] <= -wiggleRange) {
							speed[0] *= -1;
						}

						if (offset[1] >= wiggleRange || offset[1] <= -wiggleRange) {
							speed[1] *= -1;
						}
					}

					// add jiggle to wiggle -- needs to figure the fuck out!
					this.offsets[i].push([
						Cool.random(-jiggleRange, jiggleRange) + offset[0],
						Cool.random(-jiggleRange, jiggleRange) + offset[1]
					]);
				}

			}
		}
	}
}