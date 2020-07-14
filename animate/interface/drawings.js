function Drawings() {
	const self = this;

	this.getLayer = function(index) {
		const layers = [];
		// - 1 for draw layer
		// get layers containing drawing
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].d == index) layers.push(lns.anim.layers[i]);
		}

		if (layers.length == 0) return false;
		else if (layers.length == 1) return layers[0];
		else {
			// get a layer in the current frame if it exists
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(lns.anim.currentFrame)) {
					return layers[i];
				}
			}
			// or just return the first layer
			return layers[0];
		}
	};

	this.update = function() {
		self.panel.drawings.clear();
		// -1 to ignore draw drawing
		for (let i = 0; i < lns.anim.drawings.length - 1; i++) {
			if (lns.anim.drawings[i]) {
				const drawing = lns.anim.drawings[i];
				let layer = self.getLayer(i); /* check for existing layer */
				let inFrame = layer ? layer.isInFrame(lns.anim.currentFrame) : false;

				self.panel.drawings.append(new UIToggle({
					text: i,
					isOn: inFrame,
					callback: function() {
						let layer = self.getLayer(i);

						/* add */
						if (!this.isOn) {
							if (layer) {
								layer = layer.addIndex(lns.anim.currentFrame);
							} else {
								layer = new Layer({
									...drawing.props,
									d: i,
									f: { s: lns.anim.currentFrame, e: lns.anim.currentFrame },
								});
								delete drawing.props;
								lns.anim.addLayer(layer);
							}
						} else {
							if (layer) {
								if (layer.isInFrame(lns.anim.currentFrame)) {
									const newLayer = layer.removeIndex(lns.anim.currentFrame);
									
									if (newLayer == 'remove') {
										drawing.props = layer.props; // is this bad?
										lns.anim.removeLayer(layer);
									}
									else if (newLayer) {
										lns.anim.addLayer(layer);
									}
								} 
							} 
						}
						
						lns.ui.update();
					}
				}), i);
			}
		}
	};

	this.clear = function() {
		self.panel.drawings.clear();
	};
}