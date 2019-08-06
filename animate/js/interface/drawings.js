function Drawings(panel) {
	const self = this;

	this.getDrawingLayer = function(index) {
		const layers = [];
		for (let i = 0; i < lns.layers.length; i++) {
			if (lns.layers[i].d == index) layers.push(lns.layers[i]);
		}

		if (layers.length == 0) return false;
		else if (layers.length == 1) return layers[0];
		else {
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(lns.currentFrame)) {
					return layers[i];
				}
			}
			return layers[0];
		}
	};

	this.displayDrawings = function() {
		lns.interface.layers.resetLayers();
		self.resetDrawings();
		panel.addRow('drawings');
		for (let i = 0; i < lns.drawings.length; i++) {
			if (lns.drawings[i]) {
				let toggleOn = false;
				const drawing = lns.drawings[i];

				/* check for existing layer */
				let layer = self.getDrawingLayer(i);
				if (layer) toggleOn = layer.isInFrame(lns.currentFrame);
				else toggleOn = false;

				panel.add(new UIToggleButton({
					title: i,
					on: i,
					off: i,
					isOn: toggleOn,
					callback: function() {
						layer = self.getDrawingLayer(i);
						if (layer) {
							if (layer.isInFrame(lns.currentFrame)) {
								layer.removeIndex(lns.currentFrame);
								if (lns.layers.indexOf(layer) == -1) {
									layer = undefined;
								}
							} else {
								layer.addIndex(lns.currentFrame);
							}
						} else {
							layer = new Layer({
								d: i,
								c: lns.lineColor.color,
								...lns.draw.defaults,
								x: 0,
								y: 0,
								f: { s: lns.currentFrame, e: lns.currentFrame },
								a: []
							});
							lns.layers.push(layer);
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