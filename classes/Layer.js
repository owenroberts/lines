class Layer {
	constructor(params, drawingEndIndex) {
		this.drawingIndex = params.drawingIndex; // fix some time
		this.tweens = params.tweens || [];

		this.x = params.x || 0;
		this.y = params.y || 0;
		
		this._startFrame = params.startFrame;
		this._endFrame = params.endFrame || params.startFrame;

		this.drawingStartIndex = params.drawingStartIndex || 0;
		this.drawingEndIndex = params.drawingEndIndex || -1;
		
		this.color = params.color || '#000000';

		this.segmentNum =  params.segmentNum; // need to fix these ... 
		this.jiggleRange = params.jiggleRange;
		this.wiggleRange = params.wiggleRange;
		this.wiggleSpeed = params.wiggleSpeed;
		this.wiggleSegments = params.wiggleSegments || false; // true/false
		this.breaks = params.breaks || false;
		
		if (params.order) this.order = params.order;

		this.linesInterval = params.linesInterval // draw count per line update
		this.linesCount = 0; // line update counter

		this.isToggled = false; // lns anim layer
		this.resetTweens();
	}

	update() {
		if (this.linesCount >= this.linesInterval) {
			this.linesCount = 0;
			return true;
		} else {
			this.linesCount++;
			return false;
		}
	}

	get startFrame() {
		return this._startFrame;
	}

	set startFrame(f) {
		this._startFrame = Math.max(0, +f);
		this.resetTweens();
	}

	get endFrame() {
		return this._endFrame;
	}

	set endFrame(f) {
		this._endFrame = Math.max(0, +f);
		this.resetTweens();
	}

	resetTweens() {
		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];
			if (tween.startFrame < this.startFrame) tween.startFrame = this.startFrame;
			if (tween.endFrame > this.endFrame) tween.endFrame = this.endFrame;
		}
	}

	isInFrame(index) {
		// if (lns.anim.layers.indexOf(this) == -1) return false; // idk -- maybe to ignore the draw layer
		if (index >= this.startFrame && index <= this.endFrame) return true;
		else return false;
	}

	get drawProps() {
		const props = {
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			wiggleRange: this.wiggleRange,
			wiggleSpeed: this.wiggleSpeed,
			wiggleSegments: this.wiggleSegments,
			x: this.x,
			y: this.y,
			color: this.color,
			startIndex: this.drawingStartIndex,
			endIndex: this.drawingEndIndex,
		};
		if (this.tweens) props.tweens = this.tweens;
		return props;
	}
}