const LayerMixin = {

	init() {
		this.isToggled = false;
		this.isLocked = false;
	},
	
	toggle() {
		this.isToggled = !this.isToggled;
	},

	isInFrame(index) {
		return (index >= this.startFrame && index <= this.endFrame && !this.dontDraw);
	},

	addTween(tween) {
		this.tweens.push(tween);
		if (tween.startFrame < this.startFrame) this.startFrame = tween.startFrame;
		if (tween.endFrame > this.endFrame) this.endFrame = tween.endFrame;
		if (lns.anim.stateName == 'default' && lns.anim.state.end < this.endFrame) {
			lns.anim.state.end = this.endFrame;
		}
	},

	resetTweens() {
		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];
			if (tween.startFrame < this.startFrame) tween.startFrame = this.startFrame;
			if (tween.endFrame > this.endFrame) tween.endFrame = this.endFrame;
		}
	},

	addIndex(index) {
		if (!this.isInFrame(index)) {
			if (this.startFrame - 1 == index) this.startFrame -= 1;
			else if (this.endFrame + 1 == index) this.endFrame += 1;
			else {
				return new Layer({
					...this.getCloneProps(),
					startFrame: index,
					endFrame: index,
				});
			}
		}
		return this;
	},

	removeIndex(index, removeFunc) {
		/*
			returns a layer to add to layers to calling function
			if no match return "remove" to remove the layer	
			is that sort of stupid?
		*/

		if (this.startFrame == index && this.endFrame == index) removeFunc();
		else if (this.startFrame == index) this.startFrame += 1;
		else if (this.endFrame == index) this.endFrame -= 1;
		else if (index > this.startFrame && index < this.endFrame) {
			const layer = new Layer(this.getCloneProps());
			layer.startFrame = index + 1;
			layer.endFrame = this.endFrame;
			layer.resetTweens();
			this.endFrame = index - 1;
			this.resetTweens();
			return layer;
		} else {
			// outside range? fixes insert?
			return this;
		}
		
		this.resetTweens();
	},

	shiftIndex(index, n) {
		// console.log(index, n, this.startFrame, this.endFrame);
		if (!n) n = -1;	/* n is shift num, negative or positive */

		/* what about insert ... i dont get this ... shift should not delete right */
		// if (this.startFrame == index)
			// return this.removeIndex(index);

		if (this.startFrame >= index) this.startFrame += n;
		if (this.endFrame >= index) this.endFrame += n;

		this.resetTweens(); // can i check this somewhere else ? 
		return this;
	},

	resetDrawingEndIndex(index) {
		this.drawingEndIndex = index;
	},

	getSaveProps() {
		const props = {
			n: this.segmentNum,
			r: this.jiggleRange,
			w: this.wiggleRange,
			v: this.wiggleSpeed,
			ws: this.wiggleSegments,
			c: this.color,
			f: [this.startFrame, this.endFrame],
			d: this.drawingIndex,
			b: this.breaks,
			l: this.linesInterval,
		};
		if (this.x) props.x = this.x; // ignore if 0 or undefined
		if (this.y) props.y = this.y;
		if (this.tweens) props.t = this.tweens.map(tween => { return [tween.prop, tween.startFrame, tween.endFrame, tween.startValue, tween.endValue]});
		return props;
	},

	getEditProps() {
		return {
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			wiggleRange: this.wiggleRange,
			wiggleSpeed: this.wiggleSpeed,
			wiggleSegments: this.wiggleSegments,
			linesInterval: this.linesInterval,
			breaks: this.breaks,
			color: this.color,
		};
	},

	getTweenProps() {
		return {
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			wiggleRange: this.wiggleRange,
			wiggleSpeed: this.wiggleSpeed,
			wiggleSegments: this.wiggleSegments,
			linesInterval: this.linesInterval,
			startIndex: this.drawingStartIndex,
			endIndex: this.drawingEndIndex,
		};
	},

	getCloneProps() {
		return props = {
			drawingIndex: this.drawingIndex,
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			wiggleRange: this.wiggleRange,
			wiggleSpeed: this.wiggleSpeed,
			wiggleSegments: this.wiggleSegments,
			breaks: this.breaks,
			linesInterval: this.linesInterval,
			x: this.x,
			y: this.y,
			color: this.color,
			drawingStartIndex: this.drawingStartIndex,
			drawingEndIndex: this.drawingEndIndex,
			startFrame: this.startFrame,
			endFrame: this.endFrame,
		};
		// ignore tweens for now
	}

};