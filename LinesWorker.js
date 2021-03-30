/*
	process random offset for lines animations
*/

function random(min, max) {
	return Math.random() * (max - min) + min;
}

onmessage = function(event) {

	const { segmentNum, jiggleRange, wiggleRange, wiggleSpeed, wiggleSegments } = event.data.props;
	const points = event.data.points;

	// const speed = new Cool.Vector().random(wiggleSpeed);
	const speed = [random(-wiggleSpeed, wiggleSpeed), random(-wiggleSpeed, wiggleSpeed)];

	// const offset = new Cool.Vector().random(0, wiggleRange);
	const offset = [random(0, wiggleRange), random(0, wiggleRange)];
	
	const offsets = [];

	// add random offsets for xy for each segment of the lines
	for (let i = 0; i < points.length; i++) {
		if (points[i] != 'end') {
			offsets[i] = [];

			for (let j = 0; j < segmentNum; j++) {
				// calculate wiggle 
				if (wiggleRange > 0 && (j == 0 || wiggleSegments)) {
					offset[0] += speed[0];
					offset[1] += speed[1];

					for (let c = 0; c < offset.length; c++) {
						// offset[c] += speed[c];
						if (offset[c] >= wiggleRange || offset[c] <= -wiggleRange) {
							speed[c] *= -1;
						}
					}
				}

				offsets[i] = [];
				offsets[i].push([
					random(-jiggleRange, jiggleRange) + offset[0],
					random(-jiggleRange, jiggleRange) + offset[1],
				]);
			}
		} else {
			offsets.push('end');
		}
	}

	postMessage(offsets);
};