const AnimationMixin = {
	
	updateProperty(prop, value) {
		/* args from ui */
		for (let i = 0; i < this.layers.length - 1; i++) {
			if (this.layers[i].isToggled) this.layers[i][prop] = value;
		}
	},

	addLayer(layer) {
		// add before draw layer
		if (this.layers.indexOf(layer) == -1)
			this.layers.splice(lns.anim.layers.length - 1, 0, layer);
	},

	removeLayer(layer) {
		const index = this.layers.indexOf(layer);
		if (index >= 0) this.layers.splice(index, 1);
	},

	updateStates() {
		for (const k in this.states) {
			if (this.states[k].end > this.endFrame) {
				this.states[k].end = this.endFrame;
			}
		}
	},

	merge(a, b, layer) {
		const dA = lns.anim.drawings[a]; // drawing a
		const dB = lns.anim.drawings[b];
		while (dB.length > 0) {
			dA.add(dB.shift());
		}
		if (!layer) console.warn('No layer'); // if need to get layer from draw index
		lns.anim.drawings[b] = null;
		layer.drawingEndIndex = dA.length;
	},

	getDrawLayer() {
		return this.layers[this.layers.length - 1];
	},

	getCurrentDrawing() {
		return this.drawings[lns.anim.drawings.length - 1];
	},

	newDrawing() {
		this.drawings.push(new Drawing());
	},

	isDrawingInFrame() {
		return this.layers.some(layer => {
			return layer.isInFrame(this.currentFrame) &&
				this.drawings[layer.drawingIndex].length > 0;
			});
	}

};