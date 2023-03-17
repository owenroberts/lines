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
		if (point === 'add' || point === 1) {
			this.points.push('add');
		} else if (point === 'end' || point === 0) {
			this.points.push('end');
		} else if (Array.isArray(point)) { 	// from json file
			this.points.push(point);
		} else {
			this.points.push([point.x, point.y]);
		}

		// this is prob where offset errors come from, update this to use layer segNum
		this.offsets.push([[0,0], [0,0]]); // default add an offset even for end ... work on better way to update this
	}

	pop() {
		this.offsets.pop();
		return this.points.pop();
	}

	shift() {
		this.offsets.shift();
		return this.points.shift();
	}

	get(index) {
		/*
			this is pretty confusing for lines
			check performance if this is { point, offset }
		*/
		if (index < 0) { // catch for draw.js end func
			// [point, offset]
			return [this.points[this.points.length + index], this.offsets[this.offsets.length + index]];
		}
		return [this.points[index], this.offsets[index]];
	}

	get length() {
		return this.points.length;
	}

	get needsUpdate() {
		// refernces global/window drawCount
		if (this.lastDrawCount < drawCount) {
			this.lastDrawCount = drawCount;
			return true;
		} else {
			return false;
		}
	}

	update(props) {

		// test destructuring performance increase
		// const { segmentNum, jiggleRange, wiggleRange, wiggleSpeed, wiggleSegments } = props;

		// start with speed and offset based on wiggle range
		// skip this if wiggle range is below 0?
		const speed = [
			Cool.random(-props.wiggleSpeed, props.wiggleSpeed), 
			Cool.random(-props.wiggleSpeed, props.wiggleSpeed)
		];
		const wiggle = [Cool.random(0, -props.wiggleRange), Cool.random(0, props.wiggleRange)];

		// add random offsets for xy for each segment of the lines
		for (let i = 0, len = this.points.length; i < len; i++) {
			if (this.points[i] !== 'end') {
				this.offsets[i] = [];

				// one offset for each segment -- do i ever use last offset?
				for (let j = 0; j < props.segmentNum; j++) {
					// wiggle increases by point or by segment
					if (props.wiggleRange > 0 && (j === 0 || props.wiggleSegments)) {
			
						// add wiggle speed to wiggle offset
						wiggle[0] += speed[0];
						wiggle[1] += speed[1];

						// reverse direction when exceeding wiggle range
						if (wiggle[0] >= props.wiggleRange || wiggle[0] <= -props.wiggleRange) {
							speed[0] *= -1;
						}

						if (wiggle[1] >= props.wiggleRange || wiggle[1] <= -props.wiggleRange) {
							speed[1] *= -1;
						}
					}

					// add jiggle to wiggle -- needs to figure the fuck out!
					this.offsets[i].push([
						Cool.random(-props.jiggleRange, props.jiggleRange) + wiggle[0],
						Cool.random(-props.jiggleRange, props.jiggleRange) + wiggle[1]
					]);
				}

			}
		}
	}

}

window.Lines.Drawing = Drawing;
