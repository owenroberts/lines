import { Anim, Drawing, Points } from '../../src/lines.js';

/**
 * Anim methods for working in animate app
 * get/set endFrame to adjust to changing animation length
 */
export class AnimateAnim extends Anim {
	constructor(renderer) {
		super(renderer);
		this.activeLayerIndex = 0;
	}

	get endFrame() {
		const endFrame = this.layers.map(layer => { return layer.endFrame; });
		// when is layers.length 0 ??
		// return this.layers.length > 0 ? Math.max.apply(Math, endFrame) : 0;
		return Math.max.apply(Math, endFrame);
	}

	set endFrame(n) {
		this.layers.forEach(layer => { layer.endFrame = n; });
	}

	updateProperty(prop, value) {
		/* args from ui */
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i].isToggled) this.layers[i][prop] = value;
		}
	}

	addLayer(layer) {
		// add before draw layer
		if (this.layers.indexOf(layer) === -1) {
			// this.layers.splice(this.layers.length - 1, 0, layer);
			this.layers.push(layer);
		}
	}

	removeLayer(layer) {
		const index = this.layers.indexOf(layer);
		if (index >= 0) this.layers.splice(index, 1);
	}

	cutEnd() {
		/* make sure draw layer doesn't extend to far */
		let endFrame = 0;
		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			if (layer.endFrame > endFrame) endFrame = layer.endFrame;
		}
		
		// const layer = this.getDrawLayer();
		if (this.activeLayer.endFrame > endFrame) {
			this.activeLayer.endFrame = endFrame;
		}
	}

	updateStates() {
		for (const k in this.states) {
			if (this.states[k].end > this.endFrame) {
				this.states[k].end = this.endFrame;
			}
		}
	}

	merge(a, b, layer) {
		const dA = this.drawings[a]; // drawing a
		const dB = this.drawings[b];
		if (dA.points[dA.points.length - 1] !== Points.END) dA.add(Points.END);
		while (dB.length > 0) {
			dA.add(dB.shift());
		}
		if (!layer) console.warn('No layer'); // if need to get layer from draw index
		this.drawings[b] = null;
		layer.drawingEndIndex = dA.length;
	}

	get activeLayer() {
		return this.layers[this.activeLayerIndex];
	}

	get activeDrawing() {
		return this.drawings[this.activeLayer.drawingIndex];
	}

	addDrawing(drawing) {
		this.drawings.push(drawing);
	}

	addNewDrawing() {
		this.drawings.push(new Drawing());
	}

	isDrawingInFrame() {
		return this.layers.some(layer => {
			return layer.isInFrame(this.currentFrame) &&
				this.drawings[layer.drawingIndex].length > 0;
			});
	}

	getLayersInFrame(frame) {
		return this.layers.filter(l => l.isInFrame(frame));
	}

	shiftStates(index) {
		// shift states when inserting
		for (const name in this.states) {
			const state = this.states[name];
			if (state.start >= index) state.start++;
			if (state.end >= index) state.end++;
		}
	}

	swapLayer(layerIndex, swapIndex) {
		if (swapIndex < 0) return;
		[this.layers[swapIndex], this.layers[layerIndex]] = [this.layers[layerIndex], this.layers[swapIndex]];
		this.update();
	}

	sortLayer(layerIndex, swapIndex) {
		if (swapIndex < 0) return;
		const layer = this.layers.splice(layerIndex, 1);
		this.layers.splice(swapIndex, 0, layer[0]);
	}
}

