function Layers(panel) {
	const self = this;
	this.layers = [];
	this.panel = panel;

	this.updateProperty = function(prop, value) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) self.layers[i][prop] = value;
		}
	};

	this.resetLayers = function() {
		for (let i = self.layers.length - 1; i >= 0; i--) {
			if (self.layers[i].toggled) self.layers[i].toggle();
		}
		for (let i = self.panel.rows.length - 1; i > 1; i--) {
			self.panel.removeRow(self.panel.rows[i]);
		}
		self.layers = [];
	};

	this.displayLayers = function() {
		self.resetLayers();
		lns.ui.drawings.resetDrawings();

		for (let i = 0; i < lns.layers.length; i++) {
			const layer = lns.layers[i];
			if (layer.isInFrame(lns.currentFrame)) {
				self.layers.push(layer);

				const row = self.panel.addRow(`layer-${i}`);
				self.panel.add(new UIDisplay({text: `${i}` }), row);

				self.panel.add(new UIToggleButton({
					on: '◐',
					off: '◑',
					callback: function() {
						layer.toggle();
						/*
							maybe some ui render setttings function here
							crazy and repetetive but also useful
						*/
						if (layer.toggled) {
							lns.ui.faces.w.setValue(layer.n);
							lns.ui.faces.r.setValue(layer.r);
							lns.ui.faces.w.setValue(layer.w);
							lns.ui.faces.v.setValue(layer.v);
						} else {
							lns.ui.faces.w.setValue(lns.draw.n);
							lns.ui.faces.r.setValue(lns.draw.r);
							lns.ui.faces.w.setValue(lns.draw.w);
							lns.ui.faces.v.setValue(lns.draw.v);
						}
					}
				}), row); /* select */

				self.panel.add(new UIText({
					label: 'S',
					blur: true,
					value: layer.f.s,
					callback: function(value) {
						layer.startFrame = +value;
						if (layer.startFrame > lns.numFrames) lns.numFrames = layer.startFrame;
						if (layer.endFrame < layer.startFrame) layer.endFrame = layer.startFrame;
						lns.ui.updateInterface();
					}
				}), row);

				self.panel.add(new UIText({
					label: 'E',
					blur: true,
					value: layer.f.e,
					callback: function(value) {
						layer.endFrame = +value;
						if (layer.endFrame > lns.numFrames) lns.numFrames = layer.endFrame;
						if (layer.startFrame > layer.endFrame) layer.startFrame = layer.endFrame;
						lns.ui.updateInterface();
					}
				}), row);

				self.panel.add(new UIButton({
					title: "+",
					callback: function() {
						const n = new Layer(_.cloneDeep(layer));
						n.f.s = n.f.e = lns.currentFrame + 1;
						layer.f.e = lns.currentFrame;
						lns.layers.push(n);
						lns.ui.nextFrame();
					}
				}), row); /* duplicate */

				self.panel.add(new UIToggleButton({
					on: 'x',
					off: 'x',
					callback: function() {
						layer.remove();
						self.resetLayers();
					}
				}), row); /* delete */

				// self.panels['layer'].add(new UIToggleButton({
				// 	on: '👀',
				// 	off: '🕶️',
				// 	callback: function() {
				// 		layers[i].toggle();
				// 	}
				// }), row);

				/* add animation */
				function addAnimation(a) {
					const aRow = self.panel.addRow(`layer-${i}-anim-${layer.a.length}`);
					self.panel.add(new UISelect({
						options: ['anim', 's', 'e', 'n', 'r', 'w', 'v'],
						selected: a.prop || 'anim',
						value: a.prop || 'anim',
						callback: function(value) {
							a.prop = value;
							if (value == 's' || value == 'e') {
								a.sv = 0;
								a.ev = lns.drawings[layer.d].length
							}
						}
					}), aRow);
					self.panel.add(new UIText({
						label: 'sf',
						value: a.sf,
						blur: true,
						callback: function(value) {
							a.sf = +value;
						}
					}), aRow);
					self.panel.add(new UIText({
						label: 'ef',
						value: a.ef,
						blur: true,
						callback: function(value) {
							a.ef = +value;
						}
					}), aRow);
					self.panel.add(new UIText({
						label: 'sv',
						value: a.sv,
						blur: true,
						callback: function(value) {
							a.sv = +value;
						}
					}), aRow);
					self.panel.add(new UIText({
						label: 'ev',
						value: a.ev,
						blur: true,
						callback: function(value) {
							a.ev = +value;
						}
					}), aRow);

					self.panel.add(new UIButton({
						title: '↻',
						callback: function() {
							a.sv = 0;
							a.ev = lns.drawings[layer.d].length;
							lns.ui.updateInterface();
						}
					}));

					self.panel.add(new UIButton({
						title: 'X',
						callback: function() {
							self.panels['layer'].removeRow(aRow);
							layer.a.splice(layer.a.indexOf(a));
						}
					}));
				}

				self.panel.add(new UIButton({
					title: '❏',
					callback: function() {
						const a = {
							prop: undefined,
							sf: lns.currentFrame,
							ef: lns.currentFrame,
							sv: 0,
							ev: 0
						};
						addAnimation(a);
						layer.a.push(a);
					}
				}), row);

				for (let i = 0; i < layer.a.length; i++) {
					addAnimation(layer.a[i]);
				}
				// https://unicode.org/charts/PDF/U2600.pdf
				// https://tutorialzine.com/2014/12/you-dont-need-icons-here-are-100-unicode-symbols-that-you-can-use
				// ☠ ☰ ☁ ☂ ⛄ ⚆ ⚈ ⚇ ⚉ 
			}
		}
	};

	this.allToggled = false;

	this.toggleAll = function() {
		/* match all toggled */
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled != self.allToggled)
				self.layers[i].toggle();
		}
		
		/* toggle */
		for (let i = 0; i < self.layers.length; i++) {
			self.layers[i].toggle();
		}

		self.allToggled = !self.allToggled; /* set toggle */

		/* how to make ui react here ??? */
	};

	/* z */
	this.cutLayerSegment = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) {
				const drawing = lns.drawings[self.layers[i].d];
				drawing.pop(); /* remove "end" */
				drawing.pop(); /* remove segment */
				drawing.push('end'); /* new end */
				self.layers[i].e = drawing.length; /* update layer end num */
			}
		}
	};

	/* shift z */
	this.cutLayerLine = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) {
				const drawing = lns.drawings[self.layers[i].d];
				drawing.pop(); /* remove "end" */
				for (let i = drawing.length - 1; i > 0; i--) {
					if (drawing[i] != 'end') drawing.pop();
					else break;
				}
				self.layers[i].e = drawing.length; /* update layer end num */
			}
		}
	};

	this.updateLayerColor = function(color) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layers[i].c = self.layers[i].prevColor = color;
		}
	};

	this.canvas = new Canvas("draw-layers", 0, 0, '#F2F4F4');

	/* do this with real ui later*/
	this.toggleCanvas = new UIToggleButton({
		id: 'toggle-layers',
		on: "Close Layers",
		off: "Open Layers",
		callback: function() {
			if (this.isOn) self.canvas.canvas.style.display = 'none';
			else self.canvas.canvas.style.display = '';
		}
	})

	this.drawLayers = function() {
		const maxWidth = 60;
		const w = Math.min(640, self.canvas.canvas.parentElement.offsetWidth);
		console.log(w);
		const row = 4;
		const h = row * (lns.layers.length + 1);
		self.canvas.setHeight(h);
		const col = Math.min(maxWidth, w / (lns.numFrames));
		console.log(col);
		self.canvas.setWidth(Math.min(w, col * lns.numFrames));

		for (let i = 0; i < lns.numFrames; i++) {
			const x = i * col;
			if (i == lns.currentFrame) self.canvas.ctx.fillStyle = '#FF79FF';
			else self.canvas.ctx.fillStyle = '#fdf';
			self.canvas.ctx.fillRect((i * col) + col/20, h - 5, col - col/10, 4);
		}

		for (let i = 0; i < lns.layers.length; i++) {
			const layer = lns.layers[i];
			const x = layer.f.s * col + 1;
			const y = i * row + row/20;
			const _w = (layer.f.e - layer.f.s + 1) * col - 2;
			self.canvas.ctx.fillStyle = '#ADD8E6';
			self.canvas.ctx.fillRect(x, y, _w, row - 1);
		}
	};
}