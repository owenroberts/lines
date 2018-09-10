function Layer() {
	const self = this;

	this.layerPanel = new Panel("layer-menu", "Layer");
	this.frameRow = this.layerPanel.addRow();
	this.layers = [];

	this.resetLayers = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layerToggle(self.layers[i]);
		}
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
	}

	this.layerToggle = function(layer) {
		if (!layer.toggled) {
			layer.prevColor = layer.c;
			layer.c = "00CC96";
		} else {
			layer.c = layer.prevColor;
			const index = self.layers.indexOf(layer);
			if (index != -1)
				self.layers.splice(index, 1);
		}
		layer.toggled = !layer.toggled;
	};

	this.displayLayers = function() {
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
		if (Lines.frames[Lines.currentFrame]) {
			for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
				const layer = Lines.frames[Lines.currentFrame][i];
				self.layers.push(layer);
				layer.toggled = false;
				const toggleLayer = new UIToggleButton({
					on: layer.d,
					off: layer.d,
					callback: function() {
						self.layerToggle(layer);
					}
				});
				self.layerPanel.add(toggleLayer, self.frameRow);
			}
		}
	};

	this.layerPanel.add(new UIButton({
		title: "Update Layers",
		callback: self.displayLayers
	}));

	this.segNum = new UIRange({
		label: "Segments",
		value: 2,
		display: "layer-num-range",
		min: 1,
		max: 20,
		callback: function() {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].n = +this.value;
			}
		}
	});
	this.layerPanel.add(this.segNum);

	this.jigNum = new UIRange({
		label: "Jiggle",
		value: this.jiggleRange,
		min: 0,
		max: 10,
		value: 1,
		display: "layer-jiggle-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].r = +this.value;
			}
		}
	});
	this.layerPanel.add(this.jigNum);

	this.wigNum = new UIRange({
		label: "Wiggle",
		value: this.wiggleRange,
		value: 0,
		min: 0,
		max: 15,
		display: "layer-wiggle-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].w = +this.value;
			}
		}
	});
	this.layerPanel.add(this.wigNum);

	this.wigSpeed = new UIRange({
		label: "Wiggle Amt",
		value: this.wiggleSpeed,
		value: 0,
		min: 0,
		max: 5,
		step: 0.005,
		display: "layer-wiggle-speed-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].v = +this.value;
			}
		}
	});
	this.layerPanel.add(this.wigSpeed);

	this.layerPanel.add(new UIButton({
		"title": "Cut Selected Segment",
		key: "alt-z",
		callback: function() {
			for (let i = 0; i < self.layers.length; i++) {
				const layer = self.layers[i];
				const drawing = Lines.drawings[layer.d];
				drawing.pop(); /* remove "end" */
				drawing.pop(); /* remove segment */
				drawing.push('end'); /* new end */
				layer.e = drawing.length; /* update layer end num */
			}
		}
	}));
}