class Drawing {
	constructor(points) {
		this.points = [];
		if (points) {
			for (let i = 0; i < points.length; i++) {
				this.add(points[i]);
			}
		}

		this.offset = new Cool.Vector();
	}

	// add a point
	add(point) {
		if (point == 'end' || point == 0) {
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

	// update the animtor  properties - happens when the lineCount is 0
	// n number of segments, r randomness of segments
	// w wiggle amount, v, wiggle speed
	// ws is wiggle segments (true/false)
	update(props) {
		const { segmentNum, jiggleRange, wiggleRange, v, ws } = props;
		const speed = new Cool.Vector().random(v);
		this.offset = new Cool.Vector().random(0, wiggleRange);

		// add random offsets for xy for each segment of the lines
		for (let i = 0; i < this.points.length; i++) {
			if (this.points[i] != 'end') {
				this.points[i].off = []; // point offset 

				for (let j = 0; j < segmentNum; j++) {
					// calculate wiggle 
					if (wiggleRange > 0 && (j == 0 || ws)) {
						this.offset.add(speed);
						for (const xy in speed) {
							if (this.offset[xy] >= wiggleRange || this.offset[xy] <= -wiggleRange) {
								speed[xy] *= -1;
							}
						}
					}

					// add jiggle to wiggle -- needs to figure the fuck out!
					this.points[i].off.push({
						x: Cool.random(-jiggleRange, jiggleRange) + this.offset.x,
						y: Cool.random(-jiggleRange, jiggleRange) + this.offset.y
					});
				}

			}
		}
	}
}