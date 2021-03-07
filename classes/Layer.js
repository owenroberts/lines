class Layer {
	constructor(params, drawingEndIndex) {
		// console.log(params);
		this.drawingIndex = params.d;
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.tweens = params.t || [];
		
		this.f = params.f;
		this._startFrame = params.f.s;
		this._endFrame = params.f.e;

		this.drawingStartIndex = 0;
		this.drawingEndIndex = drawingEndIndex || -1;
		
		this.color = params.c || params.color || '#000000';
		this.segmentNum =  params.segmentNum || params.n; // need to fix these ... 
		this.jiggleRange = params.jiggleRange || params.r;
		this.wiggleRange = params.wiggleRange || params.w;
		this.v = params.v;
		this.ws = params.ws || false; // wiggle segments
		if (params.o) this.order = params.o;

		this.linesInterval = params.l || 5; // draw count per line update
		this.linesCount = 0; // line update counter

		this.isToggled = false;
		this.resetTweens();

		// console.trace();
		console.log(this);
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

	// remove this??
	remove() {
		lns.anim.layers.splice(lns.anim.layers.indexOf(this), 1);
	}

	addTween(tween) {
		this.tweens.push(tween);
		if (tween.sf < this.startFrame) this.startFrame = tween.sf;
		if (tween.ef > this.endFrame) this.endFrame = tween.ef;
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
		if (lns.anim.layers.indexOf(this) == -1) return false
		else if (index >= this.f.s && index <= this.f.e) return true;
		else return false;
	}

	get saveProps() {
		const props = {
			n: this.segmentNum,
			r: this.jiggleRange,
			w: this.w,
			v: this.v,
			ws: this.ws,
			x: this.x,
			y: this.y,
			c: this.isToggled ? this.tempColor : this.color,
			f: { s: this.startFrame, e: this.endFrame },
			d: this.drawingIndex,
		};
		if (this.tweens) props.t = this.tweens;
		if (this.order) props.o = this.order;
		return props;
	}

	get props() {
		const props = {
			segmentNum: this.segmentNum,
			jiggleRange: this.jiggleRange,
			w: this.w,
			v: this.v,
			ws: this.ws,
			x: this.x,
			y: this.y,
			l: this.l,
			linesInterval: this.linesInterval,
			c: this.isToggled ? this.tempColor : this.color,
		};
		if (this.order) props.o = this.order;
		return props;
	}

	resetTweens() {
		for (let i = 0; i < this.tweens.length; i++) {
			const tween = this.tweens[i];
			if (tween.sf < this.startFrame) tween.sf = this.startFrame;
			if (tween.ef > this.endFrame) tween.ef = this.endFrame;
		}
	}
}