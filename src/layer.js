/*
	layer includes a drawing index, start and end frame of animation
	layer style properties - color, segNum, jiggle, wiggleRange and speed, wiggleSegments, breaks, drawInterval, drawStartIndex, drawEndIndex
	what about xy? maybe there should not be xy? what about offset?
	add active property?

	layer props
	drawingIndex, styleIndex
	tweens
	isVisible
	xy, startFrame, endFrame, drawingStart, drawingEnd
	linesCount
*/

export class Layer {
	constructor(params={}, drawingEndIndex) {
		this.drawingIndex = params.drawingIndex ?? 0; // fix some time
		this.styleIndex = params.styleIndex ?? 0;
		this.tweens = params.tweens ?? [];

		this.isVisible = true;

		// *** ever use this?
		this.x = params.x ?? 0;
		this.y = params.y ?? 0;

		this.startFrame = params.startFrame ?? 0;
		this.endFrame = params.endFrame ?? params.startFrame ?? 0;

		this.drawingStartIndex = params.drawingStartIndex ?? 0;
		this.drawingEndIndex = params.drawingEndIndex ?? -1;
		
		this.linesCount = params.linesCount ?? 0; // line update counter

		if (this.init) this.init(params); // mixin init
	}

	isInFrame(index) {
		// if (lns.anim.layers.indexOf(this) == -1) return false; // idk -- maybe to ignore the draw layer
		if (index >= this.startFrame && index <= this.endFrame) return true;
		else return false;
	}

	getProps() {
		const props = {
			x: this.x,
			y: this.y,
			startIndex: this.drawingStartIndex,
			endIndex: this.drawingEndIndex,
			drawingIndex: this.drawingIndex,
			styleIndex: this.styleIndex,
			tweens: this.tweens,
		};
		return props;
	}
}