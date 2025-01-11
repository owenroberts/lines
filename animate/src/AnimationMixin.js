import { Drawing } from '../../src/Lines.js';

const AnimationMixin = {
	
	updateProperty(prop, value) {
		/* args from ui */
		for (let i = 0; i < this.layers.length - 1; i++) {
			if (this.layers[i].isToggled) this.layers[i][prop] = value;
		}
	},

	addLayer(layer) {
		// add before draw layer
		if (this.layers.indexOf(layer) == -1) {
			this.layers.splice(this.layers.length - 1, 0, layer);
		}
	},

	removeLayer(layer) {
		const index = this.layers.indexOf(layer);
		if (index >= 0) this.layers.splice(index, 1);
	},

	cutEnd() {
		/* make sure draw layer doesn't extend to far */
		let endFrame = 0;
		for (let i = 0; i < this.layers.length - 1; i++) {
			const layer = this.layers[i];
			if (layer.endFrame > endFrame) endFrame = layer.endFrame;
		}
		const layer = this.getDrawLayer();
		if (layer.endFrame > endFrame) layer.endFrame = endFrame;
	},

	updateStates() {
		for (const k in this.states) {
			if (this.states[k].end > this.endFrame) {
				this.states[k].end = this.endFrame;
			}
		}
	},

	merge(a, b, layer) {
		const dA = this.drawings[a]; // drawing a
		const dB = this.drawings[b];
		if (dA.points[dA.points.length - 1] !== 'end') dA.add('end');
		while (dB.length > 0) {
			dA.add(dB.shift());
		}
		if (!layer) console.warn('No layer'); // if need to get layer from draw index
		this.drawings[b] = null;
		layer.drawingEndIndex = dA.length;
	},

	getDrawLayer() {
		return this.layers[this.layers.length - 1];
	},

	getCurrentDrawing() {
		return this.drawings[this.drawings.length - 1];
	},

	addDrawing(drawing) {
		this.drawings.splice(lns.anim.drawings.length - 1, 0, drawing);
	},

	addNewDrawing() {
		this.drawings.push(new Drawing());
	},

	isDrawingInFrame() {
		return this.layers.some(layer => {
			return layer.isInFrame(this.currentFrame) &&
				this.drawings[layer.drawingIndex].length > 0;
			});
	},

	getLayersInFrame(frame) {
		return this.layers.filter(l => l.isInFrame(frame));
	},

	shiftStates(index) {
		// shift states when inserting
		for (const name in this.states) {
			const state = this.states[name];
			if (state.start >= index) state.start++;
			if (state.end >= index) state.end++;
		}
	}
};

export { AnimationMixin };