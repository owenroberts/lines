function DrawingInterface() {
	const self = this;

	/* layer panel */
	this.layerPanel = new Panel("layer-menu", "Layer");
	lns.interface.panels['layer'] = this.layerPanel;
	this.frameRow = this.layerPanel.addRow('layers');
	this.layerPanel.addRow();
	this.layers = [];

	this.updateProperty = function(prop, value) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layers[i][prop] = value;
		}
	};

	this.resetLayers = function() {
		for (let i = self.layers.length - 1; i >= 0; i--) {
			if (self.layers[i]) {
				if (self.layers[i].toggled)
					self.toggle(self.layers[i]);
			}
		}
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
		while (self.drawingPanel.rows.length > 2) {
			self.drawingPanel.removeRow(self.drawingPanel.rows[self.drawingPanel.rows.length - 1]);
		}
	};

	/* could be part of a layer class */
	this.toggle = function(layer) {
		if (!layer.toggled) {
			layer.prevColor = layer.c;
			layer.c = "#00CC96";
			layer.toggled = true;
		} else {
			layer.c = layer.prevColor;
			delete layer.prevColor;
			delete layer.toggled;
			const index = self.layers.indexOf(layer);
			if (index != -1) self.layers.splice(index, 1);
		}
	};

	this.killLayer = function() {
		const layers = self.layers.filter(l => l.toggled);
		
		// remove frames
		for (let i = lns.frames.length - 1; i >= 0; i--) {
			const frame = lns.frames[i];
			for (let j = frame.length - 1; j >= 0; j--) {
				if (lns.layers[frame[j].l].toggled)
					frame.splice(j, 1);
			}
		}

		// remove layers
		for (let i = lns.layers.length - 1; i >= 0; i--) {
			if (lns.layers[i].toggled)
				lns.layers[i].remove = true; // remove in fio
			// this is dumb right?  structure depends on index like drawing
		}
	};

	/*
		this references the layer in each frame
		not layer reference in lns.layers
	*/
	this.displayLayers = function() {
		self.resetLayers();
		if (lns.frames[lns.currentFrame]) {
			for (let i = 0; i < lns.frames[lns.currentFrame].length; i++) {
				const layer = lns.frames[lns.currentFrame][i];
				const index = lns.layers[layer.l].d;
				self.layers.push(layer);
				layer.toggled = false;
				const toggleLayer = new UIToggleButton({
					on: index,
					off: index,
					callback: function() {
						self.toggle(layer);
					}
				});
				self.layerPanel.add(toggleLayer, self.frameRow);
			}
		}
	};

	this.cutLayerSegment = function() {
		for (let i = 0; i < self.layers.length; i++) {
			const layer = self.layers[i];
			const drawing = lns.drawings[layer.d];
			drawing.pop(); /* remove "end" */
			drawing.pop(); /* remove segment */
			drawing.push('end'); /* new end */
			layer.e = drawing.length; /* update layer end num */
		}
	};

	this.updateLayerColor = function(color) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) {
				self.layers[i].c = self.layers[i].prevColor = color;
			}
		}
	};

	/* drawing panel */
	this.drawingPanel = new Panel("drawing-menu", "Drawings");
	lns.interface.panels['drawing'] = this.drawingPanel; /* add to panels */

	this.showDrawings = function() {
		self.resetLayers();
		self.drawingPanel.addRow('drawings');
		for (let i = 0; i < lns.drawings.length; i++) {
			let layer, index; /* check if layer is in frame already */
			const frame = lns.frames[lns.currentFrame];
			if (frame) {
				for (let k = 0; k < frame.length; k++) {
					if (i == lns.layers[frame[k].l].d) {
						layer = lns.layers[frame[k].l];
						index = k;
					}
				}
			}
			
			if (!layer) { /* then check existing layers */
				for (let j = 0; j < lns.layers.length; j++) {
					const layers = lns.layers[j];
					for (let k = 0; k < layers.length; k++) {
						if (i == lns.layers[k].d) {
							layer = lns.layers[k];
							index = k;
							break;
						}
					}
				}
			}
			
			if (!layer) { /* then create a layer*/
				const drawing = lns.drawings[i];
				if (drawing != null) {
					layer = {
						d: i,
						s: 0,
						e: drawing.length,
						c: '000000',
						...lns.draw.defaults,
						x: 0,
						y: 0
					};
				}
				lns.layers.push(layer);
				index = lns.layers.length - 1;
			}

			if (layer) self.layers[index] = layer; /* weidr but using indexes */
				
			self.drawingPanel.add(new UIToggleButton({
				title: i,
				on: i,
				off: i,
				callback: function() {
					if (layer) lns.drawingInterface.toggle(layer);
				}
			}));
		}
	};

	this.addDrawing = function() {
		lns.data.saveLines();
		if (lns.frames[lns.currentFrame] == undefined) 
			lns.frames[lns.currentFrame] = [];
		if (self.layers.length > 0) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i]) lns.frames[lns.currentFrame].push({ l: i });
			}
		} 
		else console.log('%c no drawing', 'color:white;background:hotpink;');
	};

	this.cutDrawing = function() {
		lns.data.saveLines();
		const frame = lns.frames[lns.currentFrame];
		if (frame) {
			for (let i = frame.length - 1; i >= 0; i--) {
				console.log(self.layers);
				for (let j = 0; j < self.layers.length; j++) {
					if (self.layers[j] && frame[i].l == j)
						frame.splice(i, 1);
				}
			}
		}
	};
}