function Drawings(panel) {
	const self = this;

	this.getDrawingLayer = function(index) {
		const layers = [];
		for (let i = 0; i < lns.anim.layers.length; i++) {
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

	this.displayDrawings = function() {
		lns.ui.layers.resetLayers();
		self.resetDrawings();
		panel.addRow('drawings');
		for (let i = 0; i < lns.anim.drawings.length; i++) {
			if (lns.anim.drawings[i]) {
				let toggleOn = false;
				const drawing = lns.anim.drawings[i];

				/* check for existing layer */
				let layer = self.getDrawingLayer(i);
				let props;
				if (layer) {
					toggleOn = layer.isInFrame(lns.anim.currentFrame);
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
				else toggleOn = false;

				panel.add(new UIToggleButton({
					title: i,
					on: i,
					off: i,
					isOn: toggleOn,
					callback: function() {
						layer = self.getDrawingLayer(i);
						if (layer) {
							if (layer.isInFrame(lns.anim.currentFrame)) {
								layer.removeIndex(lns.anim.currentFrame);
								if (lns.anim.layers.indexOf(layer) == -1) {
									layer = undefined; /* maybe save this as props */
								}
							} else {
								layer.addIndex(lns.anim.currentFrame);
							}
						} else {
							/* fuck */
							console.log(props); /* save in drawing? */
							layer = new Layer({
								d: i,
								c: lns.draw.layer.c,
								...lns.draw.defaults,
								x: 0,
								y: 0,
								f: { s: lns.anim.currentFrame, e: lns.anim.currentFrame },
								a: []
							});
							if (props) {
								for (key in props) {
									layer[key] = props[key];
								}
							}
							lns.anim.layers.push(layer);
						}
					}
				}));
			}
		}
	};

	this.resetDrawings = function() {
		const rows = panel.rows;
		for (let i = rows.length - 1; i >= 1; i--) {
			panel.removeRow(rows[i]);
		}
	};
}