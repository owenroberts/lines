function DrawingInterface() {
	const self = this;

	/*
		self.segNumElem.setValue(Lines.drawEvents.defaults.n);
		self.jiggleElem.setValue(Lines.drawEvents.defaults.r);
		self.wiggleElem.setValue(Lines.drawEvents.defaults.w);
		self.wiggleSpeedElem.setValue(Lines.drawEvents.defaults.v);
	*/


	/* layer panel */
	this.layerPanel = new Panel("layer-menu", "Layer");
	Lines.interface.panels['layer-menu'] = this.layerPanel;
	this.frameRow = this.layerPanel.addRow();
	this.layerPanel.addRow();
	this.layers = [];

	this.updateLayerProperty = function(prop, value) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layers[i][prop] = value;
		}
	};

	this.resetLayers = function() {
		for (let i = self.layers.length - 1; i >= 0; i--) {
			if (self.layers[i]) {
				if (self.layers[i].toggled)
					self.layerToggle(self.layers[i]);
			}
		}
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
		while (self.drawingPanel.rows.length > 1) {
			self.drawingPanel.removeRow(self.drawingPanel.rows[self.drawingPanel.rows.length - 1]);
		}
	};

	/* could be part of a layer class */
	this.layerToggle = function(layer) {
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
		for (let i = Lines.frames.length - 1; i >= 0; i--) {
			const frame = Lines.frames[i];
			for (let j = frame.length - 1; j >= 0; j--) {
				if (Lines.layers[frame[j].l].toggled)
					frame.splice(j, 1);
			}
		}

		// remove layers
		for (let i = Lines.layers.length - 1; i >= 0; i--) {
			if (Lines.layers[i].toggled)
				Lines.layers[i].remove = true; // remove in fio
			// this is dumb right?  structure depends on index like drawing
		}
	};

	/*
		this references the layer in each frame
		not layer reference in Lines.layers
	*/
	this.displayLayers = function() {
		self.resetLayers();
		if (Lines.frames[Lines.currentFrame]) {
			for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
				const layer = Lines.frames[Lines.currentFrame][i];
				const index = Lines.layers[layer.l].d;
				self.layers.push(layer);
				layer.toggled = false;
				const toggleLayer = new UIToggleButton({
					on: index,
					off: index,
					callback: function() {
						self.layerToggle(layer);
					}
				});
				self.layerPanel.add(toggleLayer, self.frameRow);
			}
		}
	};

	this.cutLayerSegment = function() {
		for (let i = 0; i < self.layers.length; i++) {
			const layer = self.layers[i];
			const drawing = Lines.drawings[layer.d];
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
	/* add in panel */
	Lines.interface.panels['drawing-menu'] = this.drawingPanel;

	this.showDrawings = function() {
		self.resetLayers();
		self.drawingPanel.addRow();
		for (let i = 0; i < Lines.drawings.length; i++) {
			let layer; /* check if layer is in frame already */
			let layerIndex;
			const frame = Lines.frames[Lines.currentFrame];
			if (frame) {
				for (let k = 0; k < frame.length; k++) {
					if (i == Lines.layers[frame[k].l].d) {
						layer = Lines.layers[frame[k].l];
						layerIndex = k;
					}
				}
			}
			
			if (!layer) { /* then check existing layers */
				for (let j = 0; j < Lines.layers.length; j++) {
					const layers = Lines.layers[j];
					for (let k = 0; k < layers.length; k++) {
						if (i == Lines.layers[k].d) {
							layer = Lines.layers[k];
							layerIndex = k;
							break;
						}
					}
				}
			}
			
			if (!layer) { /* then create a layer*/
				const drawing = Lines.drawings[i];
				if (drawing != null) {
					layer = {
						d: i,
						s: 0,
						e: drawing.length,
						c: '000000',
						...Lines.drawEvents.defaults,
						x: 0,
						y: 0
					};
				}
				Lines.layers.push(layer);
				layerIndex = Lines.layers.length - 1;
			}

			console.log(layerIndex)
			if (layer) self.layers[layerIndex] = layer;
			/* weidr but using indexes */
				
			self.drawingPanel.add(new UIToggleButton({
				title: i,
				on: i,
				off: i,
				callback: function() {
					if (layer) Lines.drawingInterface.layerToggle(layer);
				}
			}));
		}
	};

	this.addDrawing = function() {
		Lines.data.saveLines();
		if (Lines.frames[Lines.currentFrame] == undefined) 
			Lines.frames[Lines.currentFrame] = [];
		if (self.layers.length > 0) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i]) Lines.frames[Lines.currentFrame].push({ l: i });
			}
		} 
		else console.log('%c no drawing', 'color:white;background:hotpink;');
	};

	this.cutDrawing = function() {
		Lines.data.saveLines();
		const frame = Lines.frames[Lines.currentFrame];
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