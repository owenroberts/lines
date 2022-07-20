const LinesMixin = {
	
	updateProperty(value, prop) {
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
	}

};