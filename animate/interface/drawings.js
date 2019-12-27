function Drawings() {
	const self = this;

	this.getLayer = function(index) {
		const layers = [];
		// - 1 for draw layer
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].d == index) layers.push(lns.anim.layers[i]);
		}

		if (layers.length == 0) return false;
		else if (layers.length == 1) return layers[0];
		else {
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(lns.anim.currentFrame)) {
					return layers[i];
				}
			}
			return layers[0];
		}
	};

	this.update = function() {
		// -1 to ignore draw drawing
		for (let i = 0; i < lns.anim.drawings.length - 1; i++) {
			if (lns.anim.drawings[i]) {
				const drawing = lns.anim.drawings[i];
				let layer = self.getLayer(i); /* check for existing layer */
				let inFrame = layer ? layer.isInFrame(lns.anim.currentFrame) : false;
				if (!self.panel.drawings[i]) {
					let props;
					if (layer) {
						// user layer.props ?? 
						props = {
							n: layer.n,
							r: layer.r,
							w: layer.w, 
							v: layer.v,
							c: layer.c,
							x: layer.x,
							y: layer.y
						} /* prob a better way to do this ... 
							this stops existing when updating interface */
					}

					self.panel.drawings.append(new UIToggle({
						text: i,
						isOn: inFrame,
						callback: function() {
							let layer = self.getLayer(i);
							if (layer) {
								if (layer.isInFrame(lns.anim.currentFrame)) {
									layer = layer.removeIndex(lns.anim.currentFrame);
									if (!layer) lns.ui.layers.remove(i);
								} else {
									layer = layer.addIndex(lns.anim.currentFrame);
									if (lns.anim.layers.indexOf(layer) == -1) {
										lns.anim.layers.push(layer);
									}
								}
							} else {
								/* fuck */
								// console.log(props); /* save in drawing? */
								layer = new Layer({
									...props,
									d: i,
									f: { s: lns.anim.currentFrame, e: lns.anim.currentFrame },
								});
								// lns.anim.layers.unshift(layer);
								lns.anim.layers.splice(lns.anim.layers.length - 1, 0, layer);
							}
							
							lns.ui.layers.update();
						}
					}), i);
				} else {
					if (inFrame) self.panel.drawings[i].on();
					else self.panel.drawings[i].off();
				}
			}
		}
	};

	this.clear = function() {
		self.panel.drawings.clear();
	};
}