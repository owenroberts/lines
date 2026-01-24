/*
	adds functionality only needed by animation editor
*/

import { Layer } from '../../src/lines.js';

export const LayerMixin = {

	init(params) {
		this.isToggled = false;
		this.isLocked = false;
		this.isHighlighted = false;
		this.groupNumber = typeof params.groupNumber !== 'undefined' ? params.groupNumber : -1;
		// this.highlightColor = '#94dfe3'; // default -- doesn't currently work
 	},

	reset() {
		this.isToggled = false;
		this.isLocked = false;
		this.isHighlighted = false;
		this.highlightColor = '#94dfe3';
	},
	
	toggle() {
		this.isToggled = !this.isToggled;
	},

	isInFrame(index) {
		return (index >= this.startFrame && index <= this.endFrame && !this.dontDraw);
	},

	addKeyframe(keyframe) {
		for (let i = 0; i < keyframe.frames.length; i++) {
			if (keyframe.frames[i][0] < this.startFrame) {
				keyframe.frames[i][0] = this.startFrame;
			}
			if (keyframe.frames[i][0] > this.endFrame) {
				keyframe.frames[i][0] = this.startFrame;
			}
		}
		this.keyframes.push(keyframe);
	},

	resetKeyframes() {
		for (let i = 0; i < this.keyframes.length; i++) {
			if (keyframe.frames[i][0] < this.startFrame) {
				keyframe.frames[i][0] = this.startFrame;
			}
			if (keyframe.frames[i][0] > this.endFrame) {
				keyframe.frames[i][0] = this.startFrame;
			}

			if (i > 0) {
				if (keyframe.frames[i][0] < keyframe.frames[i - 1][0]) {
					keyframe.frames[i][0] = keyframe.frames[i - 1][0];
				}
			}
		}
	},

	addIndex(index) {
		if (!this.isInFrame(index)) {
			if (this.startFrame - 1 == index) this.startFrame -= 1;
			else if (this.endFrame + 1 == index) this.endFrame += 1;
			else {
				return new Layer({
					styleIndex: this.styleIndex,
					startFrame: index,
					endFrame: index,
				});
			}
		}
		return this;
	},

	removeIndex(index, callback) {
		/*
			returns a layer to add to layers to calling function
			if no match return "remove" to remove the layer	
			is that sort of stupid?
		*/

		if (this.startFrame === index && this.endFrame === index) callback();
		else if (this.startFrame === index) this.startFrame += 1;
		else if (this.endFrame === index) this.endFrame -= 1;
		else if (index > this.startFrame && index < this.endFrame) {
			const clone = new Layer(this.getCloneProps());
			clone.startFrame = index + 1;
			clone.endFrame = this.endFrame;
			clone.resetKeyframes();
			this.endFrame = index - 1;
			this.resetKeyframes();
			return clone;
		} else {
			// outside range? fixes insert?
			return this;
		}
		
		this.resetKeyframes();
	},

	shiftIndex(index, n) {
		// console.log(index, n, this.startFrame, this.endFrame);
		if (!n) n = -1;	/* n is shift num, negative or positive */

		/* what about insert ... i dont get this ... shift should not delete right */
		// if (this.startFrame == index)
			// return this.removeIndex(index);

		if (this.startFrame >= index) this.startFrame += n;
		if (this.endFrame >= index) this.endFrame += n;

		this.resetKeyframes();
		return this;
	},

	resetDrawingEndIndex(index) {
		this.drawingEndIndex = index;
	},

	getSaveProps() {
		const props = { 
			d: this.drawingIndex, 
			s: this.styleIndex,
		};
		if (this.keyframes) props.k = this.keyframes;
		if (this.group) props.g = this.group;
		// if (this.drawingIndex >= 0) props.d = this.drawingIndex;
		if (this.startFrame > 0 || this.endFrame > 0) props.f = [this.startFrame, this.endFrame];
		if (this.x) props.x = this.x; // ignore if 0 or undefined
		if (this.y) props.y = this.y;
		return props;
	},

	getCloneProps() {
		return {
			drawingIndex: this.drawingIndex,
			styleIndex: this.styleIndex,
			x: this.x,
			y: this.y,
			drawingStartIndex: this.drawingStartIndex,
			drawingEndIndex: this.drawingEndIndex,
			startFrame: this.startFrame,
			endFrame: this.endFrame,
			groupNumber: this.groupNumber
		};
	},

	setParams(json) {
		const params = this.loadParams(json);
		for (const k in params) {
			this[k] = params[k];
		}
	},
};