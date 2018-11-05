function DrawingInterface() {
	const self = this;

	/* play back menu */
	const panel = new Panel("play-back-menu", "Play Back");

	/* play */
	panel.add(new UIToggleButton({
		id:"play", 
		callback: Lines.draw.toggle, 
		key: "space", 
		on: "Play", 
		off: "Pause"
	}));

	this.frameNumDisplay = new UIDisplay({
		id: "frame", 
		label: "Frame: ", 
		initial: "0"
	});
	panel.add(this.frameNumDisplay); 

	/* prev frame */
	panel.add(new UIButton({
		title: "Prev Frame",
		callback: Lines.interface.prevFrame,
		key: "w"
	}));

	/* next frame */
	panel.add(new UIButton({
		title: "Next Frame",
		callback: Lines.interface.nextFrame,
		key: "e"
	}));

	/* l key - onion skin num */
	panel.add(new UISelect({
		options: [0,1,2,3,4,5,6,7,8,9,10],
		selected: 0,
		label: "Onion Skin",
		callback: function(ev) {
			if (ev.type == "change") {
				Lines.draw.onionSkinNum = +this.value;
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("How many onion skin frames?");
				Lines.draw.onionSkinNum = +n;
				this.setValue(+n);
			}
		},
		key: "l"
	}));

	/* shift l - toggle onion visibility */
	panel.add(new UIToggleButton({
		on: "Hide Onion",
		off: "Show Onion",
		callback: function() {
			Lines.draw.onionSkinIsVisible = !Lines.draw.onionSkinIsVisible;
		},
		key: "shift-l"
	}));

	/* ; key - fps */
	this.fpsSelect = new UISelect({
		label: "FPS",
		options: [1,2,5,10,12,15,24,30,60],
		selected: Lines.draw.fps,
		callback: function(ev) {
			if (ev.type == "change") {
				Lines.draw.setFps(+this.value);
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("FPS?");
				Lines.draw.setFps(+n);
				self.fpsSelect.setValue(+n);
			}
		},
		key: ";"
	});
	panel.add(this.fpsSelect);

	/* ' key - ' lines per second */
	panel.add(new UISelect({
		label: "Lines/Second",
		options: [1,2,5,10,12,15,24,30,60],
		selected: 10,
		callback: function(ev) {
			if (ev.type == "change") {
				Lines.draw.setLps(this.value);
				this.blur();
			} else {
				const n = prompt("Lines per second?");
				Lines.draw.setLps(n);
				this.setValue(n);
			}
		},
		key: "'"
	}));
	
	/* f - go to frame */
	panel.add(new UIButton({
		title: "Go To Frame",
		callback: function() {
			const f = prompt("Frame:");
			self.resetLayers();
			Lines.currentFrame = f;
			Lines.interface.updateFramesPanel();
		},
		key: "f"
	}));

	const capturePanel = new Panel("capture-menu", "Capture");
	/* crtl k - capture cycle */
	capturePanel.add(new UIButton({
		title: "Capture Cycle",
		callback: Lines.draw.captureCycle,
		key: "ctrl-k"
	}));

	/* k -  capture frames with no functions */
	capturePanel.add(new UIButton({
		title: "Capture Frame",
		callback: function() {
			Lines.draw.captureFrames = 1;
		},
		key: "k"
	}));

	/* n - capture bg */
	capturePanel.add(new UIToggleButton({
		title: "Capture BG Color",
		on: "Capture BG",
		off: "Capture BG",
		callback: function() {
			Lines.draw.captureWithBackground = !Lines.draw.captureWithBackground;
		},
		key: "n"
	}));

	/* shift-k - capture multiple frames */
	capturePanel.add(new UIButton({
		title: "Capture Multiple Frames",
		callback: function() {
			Lines.draw.captureFrames = prompt("Capture how many frames?");
		},
		key: "shift-k"
	}));

	/* brush menu */
	const brushPanel = new Panel("brush-menu", "Brush");
	
	this.brushElem = new UIRange({
		label: "Brush",
		value: 0,
		min: 0,
		max: 10,
		input: "brush-range",
		callback: function(ev) {
			/* not dry */
			if (ev.type == 'keyup') {
				self.brushElem.setValue(+ev.target.value);
				Lines.drawEvents.brush = +ev.target.value;
			} else {
				Lines.drawEvents.brush = +this.value;
			}
		}
	});
	brushPanel.add(this.brushElem);

	this.brushSpreadElem = new UIRange({
		label: "Brush Spread",
		value: 1,
		min: 1,
		max: 5,
		input: "brush-spread-range",
		callback: function(ev) {
			/* not dry */
			if (ev.type == 'keyup') {
				self.brushElem.setValue(+ev.target.value);
				Lines.drawEvents.brush = +ev.target.value;
			} else {
				Lines.drawEvents.brush = +this.value;
			}
		}
	});
	brushPanel.add(this.brushSpreadElem);

	this.dotsElem = new UIRange({
		label: "Dots",
		value: 10,
		min: 10,
		max: 50,
		input: "dots-range",
		callback: function(ev) {
			/* not dry */
			if (ev.type == 'keyup') {
				self.dotsElem.setValue(+ev.target.value);
				Lines.drawEvents.dots = +ev.target.value;
			} else {
				Lines.drawEvents.dots = +this.value;
			}
		}
	});
	brushPanel.add(this.dotsElem);

	/* lines panel */
	const linesPanel = new Panel("lines-menu", "Lines");

	/* reset defaults */
	linesPanel.add(new UIButton({
		title: "Reset Defaults",
		callback: function() {
			Lines.drawEvents.setDefaults();
			self.segNumElem.setValue(Lines.drawEvents.defaults.n);
			self.jiggleElem.setValue(Lines.drawEvents.defaults.r);
			self.wiggleElem.setValue(Lines.drawEvents.defaults.w);
			self.wiggleSpeedElem.setValue(Lines.drawEvents.defaults.v);
		}
	}));

	/* h - segment number per line */
	this.segNumElem = new UIRange({
		label: "Segments",
		value: Lines.drawEvents.segNumRange,
		input: "num-range",
		min: 1,
		max: 20,
		callback: function(ev) {
			/* this is not DRY  but more acceptable than it was */
			let value = +(ev.target.value || prompt("Segment num?"));
			self.segNumElem.setValue(value);
			Lines.drawEvents.segNumRange = value;
			if (self.layers.length > 0) {
				self.updateLayerProperty('n', value);
			}
		},
		key: "h"
	});
	linesPanel.add(this.segNumElem);

	/* j - jiggle amt */
	this.jiggleElem = new UIRange({
		label: "Jiggle",
		value: Lines.drawEvents.jiggleRange,
		min: 0,
		max: 10,
		input: "jiggle-range",
		callback: function(ev) {
			/* not dry */
			let value = +(ev.target.value || prompt("Jiggle num?"));
			self.jiggleElem.setValue(value);
			Lines.drawEvents.jiggleRange = value;
			if (self.layers.length > 0) {
				self.updateLayerProperty('r', value);
			}
		},
		key: "j"
	});
	linesPanel.add(this.jiggleElem);

	this.wiggleElem = new UIRange({
		label: "Wiggle",
		value: Lines.drawEvents.wiggleRange,
		min: 0,
		max: 15,
		input: "wiggle-range",
		callback: function(ev) {
			/* not dry */
			let value = +ev.target.value;
			self.wiggleElem.setValue(value);
			Lines.drawEvents.wiggleRange = value;
			if (self.layers.length > 0) {
				self.updateLayerProperty('w', value);
			}
		}
	});
	linesPanel.add(this.wiggleElem);

	this.wiggleSpeedElem = new UIRange({
		label: "Wiggle Amt",
		value: Lines.drawEvents.wiggleSpeed,
		min: 0,
		max: 5,
		step: 0.005,
		input: "wiggle-speed-range",
		callback: function(ev) {
			/* not dry */
			let value = +ev.target.value;
			Lines.drawEvents.wiggleSpeed = value;
			self.wiggleSpeedElem.setValue(value);
			if (self.layers.length > 0) {
				self.updateLayerProperty('v', value);
			}
		}
	});
	linesPanel.add(this.wiggleSpeedElem);

	this.lineWidth = new UIRange({
		label: "Line Width",
		value: 1,
		min: 0.25,
		max: 4,
		step: 0.25,
		input: "line-width-range",
		callback: function(ev) {
			let value = +ev.target.value;
			Lines.canvas.ctx.lineWidth = value;
			self.lineWidth.setValue(value);
		}
	});
	linesPanel.add(this.lineWidth);

	/* layer panel */
	this.layerPanel = new Panel("layer-menu", "Layer");
	this.frameRow = this.layerPanel.addRow();
	this.layers = [];

	this.updateLayerProperty = function(prop, value) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layers[i][prop] = value;
		}
	};

	this.resetLayers = function() {
		while (self.layers.length > 0) {
			self.layerToggle(self.layers[0]);
		}
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
		while (self.drawingPanel.rows.length > 1) {
			self.drawingPanel.removeRow(self.drawingPanel.rows[self.drawingPanel.rows.length - 1]);
		}
	};

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

	this.killLayer = function() {
		const n = prompt("Layer number");
		Lines.frames.forEach(function(fr) {
   			fr.forEach(function(layer) {
   				if (layer.d == n) { 
   					fr.splice(fr.indexOf(layer), 1) 
   				}							
   			});
		});
	};

	this.displayLayers = function() {
		self.resetLayers();
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

	/* maybe use regular cut here? */
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

	this.layerPanel.add(new UIButton({
		"title": "Kill a Layer",
		callback: self.killLayer
	}));

	this.layerPanel.add(new UIText({
		label: "Change Color",
		value: Lines.lineColor.color,
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled) {
					self.layers[i].c = self.layers[i].prevColor = ev.target.value;
				}
				
			}
		}
	}));

	/* drawing panel */
	this.drawingPanel = new Panel("drawing-menu", "Drawings");

	this.drawingPanel.add(new UIButton({
		title: "Update Drawings",
		callback: function() {
			/* have to regenerate this stuff to work with other frames */
			self.resetLayers();
			for (let i = 0; i < Lines.drawings.length; i++) {
				let layer; /* check if layer is in frame already */
				if (Lines.frames[Lines.currentFrame]) {
					for (let k = 0; k < Lines.frames[Lines.currentFrame].length; k++) {
						if (i == Lines.frames[Lines.currentFrame][k].d)
							layer = Lines.frames[Lines.currentFrame][k];
					}
				}
				if (!layer) {
					/* check all the frames */
					for (let j = 0; j < Lines.frames.length; j++) {
						const frame = Lines.frames[j];
						for (let k = 0; k < frame.length; k++) {
							if (i == frame[k].d) {
								layer = frame[k];
								break;
							}
						}
					}
				}
				if (!layer) {
					const drawing = Lines.drawings[i];
					if (drawing != null) {
						layer = {
							d: i,
							s: 0,
							e: drawing.length,
							c: '000000',
							n: 2,
							r: 1,
							w: 0,
							v: 0,
							x: 0,
							y: 0
						}; /* defaults, maybe grab from existing layer? */
					}
				}

				if (layer)
					self.layers.push(layer);

				const row = self.drawingPanel.addRow(i + '-drawing-row');
					
				self.drawingPanel.add(new UIToggleButton({
					title: i,
					on: i,
					off: i,
					callback: function() {
						if (layer)
							Lines.drawingInterface.layerToggle(layer);
					}
				}), row);

				self.drawingPanel.add(new UIButton({
					title: "+",
					callback: function() {
						Lines.data.saveLines();
						if (Lines.frames[Lines.currentFrame] == undefined) 
							Lines.frames[Lines.currentFrame] = [];
						Lines.frames[Lines.currentFrame].push(layer);
					}
				}), row);

				self.drawingPanel.add(new UIButton({
					title: "-",
					callback: function() {
						Lines.data.saveLines();
						if (Lines.frames[Lines.currentFrame]) {
							const index = Lines.frames[Lines.currentFrame].indexOf(layer);
							if (index != -1)
								Lines.frames[Lines.currentFrame].splice(index, 1);
						}
					}
				}), row);
			}
		}
	}));

	/* u - change mouse timer */
	const mousePanel = new Panel("mouse-menu", "Mouse");
	this.mouseElem = new UIRange({
		label: "Mouse Time",
		value: 30,
		min: 0,
		max: 100,
		input: "mouse-range",
		callback: function(ev) {
			/* not dry */
			if (ev.type == 'keyup') {
				Lines.drawEvents.mouseInterval = +ev.target.value;
				self.mouseElem.setValue(+ev.target.value);
			} else if (ev.type == "input") {
				Lines.drawEvents.mouseInterval = +this.value;
			} else if (ev.type == "keydown") {
				const n = prompt("Mouse move?");
				Lines.drawEvents.mouseInterval = +n;
			}
		},
		key: "u"
	});
	mousePanel.add(this.mouseElem);
}