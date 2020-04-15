class LnsAnim extends LinesAnimation {
	
	updateProperty(prop, value) {
		/* args from ui */
		for (let i = 0; i < this.layers.length - 1; i++) {
			if (this.layers[i].toggled) this.layers[i][prop] = value;
		}
	}

}