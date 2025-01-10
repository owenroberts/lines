/*

	layer style
	includes props
	color, segmentNum, jiggleRange, wiggleRange, wiggleSpeed, wiggleSegments, breaks, drawInterval
	
	layer refs a layer style
*/

export class Style {
	constructor(params={}) {
		this.color = params.color ?? '#000000';
		this.lineWidth = params.lineWidth ?? 1;
		this.segmentNum =  params.segmentNum ?? 2; // need to fix these ... 
		this.jiggleRange = params.jiggleRange ?? 1;
		this.wiggleRange = params.wiggleRange ?? 1;
		this.wiggleSpeed = params.wiggleSpeed ?? 0.1;
		this.wiggleSegments = params.wiggleSegments ?? false; // true/false
		this.breaks = params.breaks ?? false;
		this.linesInterval = params.linesInterval ?? 5; // draw count per line update
	}

	reset() {
		this.color = '#000000';
		this.lineWidth = 1;
		this.segmentNum =  2; // need to fix these ... 
		this.jiggleRange = 1;
		this.wiggleRange = 1;
		this.wiggleSpeed = 0.1;
		this.wiggleSegments = false; // true/false
		this.breaks = false;
		this.linesInterval = 5; // draw count per line 
	}

	getProps() {
		return {
			color: this.color,
			lineWidth: this.lineWidth,
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			wiggleRange: this.wiggleRange,
			wiggleSpeed: this.wiggleSpeed,
			wiggleSegments: this.wiggleSegments,
			breaks: this.breaks,
			linesInterval: this.linesInterval,
		}
	}
}