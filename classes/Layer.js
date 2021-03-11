class Layer {
	constructor(params, drawingEndIndex) {
		this.drawingIndex = params.drawingIndex; // fix some time
		this.tweens = params.tweens || [];

		this.x = params.x || 0;
		this.y = params.y || 0;
		
		this._startFrame = params.startFrame;
		this._endFrame = params.endFrame || params.startFrame;

		this.drawingStartIndex = 0;
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

	toggle() {
		if (!this.isToggled) {
			this.tempColor = this.color;
			this.color = "#00CC96";
		} else if (this.color == "#00CC96") {
			this.color = this.tempColor;
		}
		this.isToggled = !this.isToggled;
	}

	// would never call this outside of animate right?
	addTween(tween) {
		this.tweens.push(tween);
		if (tween.startFrame < this.startFrame) this.startFrame = tween.startFrame;
		if (tween.endFrame > this.endFrame) this.endFrame = tween.endFrame;
		if (lns.anim.stateName == 'default' && lns.anim.state.end < this.endFrame) {
			lns.anim.state.end = this.endFrame;
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

	addIndex(index) {
		if (!this.isInFrame(index)) {
			if (this.f.s - 1 == index) this.f.s -= 1;
			else if (this.f.e + 1 == index) this.f.e += 1;
			else {
				return new Layer({
					...this,
					f: { s: index, e: index }
				});
			}
		}
		return this;
	}

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
			const layer = _.cloneDeep(this);
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
	}

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
	}

	isInFrame(index) {
		// if (lns.anim.layers.indexOf(this) == -1) return false; // idk -- maybe to ignore the draw layer
		if (index >= this.startFrame && index <= this.endFrame) return true;
		else return false;
	}

	get saveProps() {
		const props = {
			n: this.segmentNum,
			r: this.jiggleRange,
			w: this.wiggleRange,
			v: this.wiggleSpeed,
			ws: this.wiggleSegments,
			c: this.isToggled ? this.tempColor : this.color,
			f: [this.startFrame, this.endFrame],
			d: this.drawingIndex,
		};
		if (this.x) props.x = x; // ignore if 0 or undefined
		if (this.y) props.y = y;
		if (this.tweens) props.t = this.tweens.map(tween => { return [tween.prop, tween.startFrame, tween.endFrame, tween.startValue, tween.endValue]});
		if (this.order) props.o = this.order;
		return props;
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
			linesCount: this.linesCount,
			linesInterval: this.linesInterval,
			color: this.color,
			startIndex: this.drawingStartIndex,
			endIndex: this.drawingEndIndex,
			tweens: this.tweens,
		};
		if (this.order) props.o = this.order;
		return props;
	}

	get editProps() {
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
	}

	get tweenProps() {
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
	}
}