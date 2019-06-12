function Interface() {
	const self = this;

	this.panels = {};
	this.keys = {};
	this.faces = {}; /* references to faces we need ?  */

	this.framesPanel = new UI({ id:"frames" });
	this.frameElems = new UIList({ class:"frame" });

	/* plus frame is unsaved drawing frame */
	this.plusFrame = new UI({
		id:"current",
		event: "click",
		callback: function() {
			self.setFrame(lns.frames.length);
		},
		key: "+"
	});
	this.keys['+'] = this.plusFrame;

	/* f key */
	this.setFrame = function(f) {
		if (+f <= lns.frames.length) {
			self.beforeFrame();
			lns.render.setFrame(+f);
			self.afterFrame();
		}
	};

	/* updates the frame panel representation of frames,
		sets current frame,
		sets copy frames */
	this.updateFramesPanel = function() {
		const numFrames = self.frameElems.getLength();
		/* this creates frames that don't already exist
			loop from the num of already made html frames to frames.length */
		if (lns.frames > numFrames) {
			for (let i = numFrames; i < lns.frames; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				frmElem.dataset.index = i;

				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					lns.render.setFrame(i);
					self.updateFrameNum();
					self.resetLayers();
				};

				/* right click, add/remove from copy frames */
				frmElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					if (!this.classList.toggle("copy")){
						lns.data.framesToCopy.splice(lns.data.framesToCopy.indexOf(i), 1);
					} else {
						this.classList.add("copy");
						lns.data.framesToCopy.push(i);
					}
				};

				/* this is one time un-ui thing */
				this.framesPanel.el.insertBefore(frmElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames; i > lns.frames; i--){
				this.frameElems.remove(i-1); /* remove html frame */
			}
		}
		this.updateFrameNum();
	};

	/* update frame display and current frame */
	this.updateFrameNum = function() {
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id");
		if (self.frameElems.els[lns.currentFrame]) // also un-ui
			self.frameElems.setId("current", lns.currentFrame);
		else
			self.plusFrame.setId("current");
		self.faces.frameDisplay.set(lns.currentFrame);
	};

	/* call before changing a frame */
	this.beforeFrame = function() {
		lns.draw.isDrawing = false;
		lns.data.saveLines();
	};

	/* call after changing a frame */
	this.afterFrame = function() {
		self.updateFramesPanel();
		self.resetLayers();
		self.resetDrawings();
	};

	/* e key - go to next frame */
	this.nextFrame = function() {
		self.beforeFrame();
		lns.render.setFrame(lns.currentFrame + 1);
		if (lns.currentFrame > lns.frames) lns.frames = lns.currentFrame;
		self.afterFrame();
	};

	/* w key - got to previous frame */
	this.prevFrame = function() {
		self.beforeFrame();
		if (lns.currentFrame > 0) lns.render.setFrame(lns.currentFrame - 1);
		self.afterFrame();
	};

	['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(key => {
		self.keys[key] = {
			callback: function() {
				self.setFrame(+key);
			}
		};
	});

	/* fio interface */
	this.title = new UI({ id:"title" });

	this.keys['s'] = new UIButton({
		id: "save",
		callback: function() {
			lns.fio.saveFramesToFile(self.title.getValue(), false, function(title) {
				self.title.setValue(title);
			});
		},
		key: "s"
	});

	this.keys['shift-s'] = new UIButton({
		id: "save-frame",
		callback: function() {
			lns.fio.saveFramesToFile(self.title.getValue(), true, function(filename) {
				self.title.setValue(filename.split("/").pop());
			});
		},
		key: "shift-s"
	});

	this.keys['o'] = new UIButton({
		id: "open",
		callback: lns.fio.loadFramesFromFile,
		key: "o"
	});

	this.keys['shift-o'] = new UIButton({
		id: 're-open',
		callback: lns.fio.reOpenFile,
		key: 'shift-o'
	});

	/* nav drag and drop */
	function dropHandler(ev) {
 		console.log(ev.dataTransfer.files);
 		ev.preventDefault();
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		if (k && self.keys[k] && document.activeElement.type != "text") {
			if (k == "tab") ev.preventDefault(); // works?
			if (ev.shiftKey) k = "shift-" + k;
			if (ev.ctrlKey) k = "ctrl-" + k;
			if (ev.altKey) k = "alt-" + k;

			const key = self.keys[k];
			if (!self.keys[k]) console.log(k, self.keys);
			if (key.handler) key.handler(ev, key);
			else key.callback();
			if (key.press) key.press();

		} else if (document.activeElement.id == 'title') {
			if (k == 'enter') {
				lns.fio.saveFramesToFile(self.title.getValue());
				document.activeElement.blur();
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	/* palette */
	const palette = new Panel('palette', 'Palette');
	this.panels.palette = palette;
	this.palettes = {};

	this.addPalette = function() {
		lns.data.saveLines();
		const name = self.palettes.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				color: lns.lineColor.color,
				seg: lns.draw.segNumRange,
				jig: lns.draw.jiggleRange,
				wig: lns.draw.wiggleRange,
				wigSpeed: lns.draw.wiggleSpeed,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouse: lns.draw.mouseInterval,
				brush: lns.draw.brush,
				brushSpread: lns.draw.brushSpread,
				dots: lns.draw.dots,
				grass: lns.draw.grass
			};
			palette.add(new UIButton({
				title: name,
				callback: function() {
					self.loadPalette(name);
				}
			}));
		}
	};

	this.loadPalette = function(name) {
		/* this is crazy ... */
		lns.data.saveLines();
		self.palettes.current = name;
		lns.lineColor.set(self.palettes[name].color);
		lns.draw.segNumRange = self.palettes[name].seg;
		lns.draw.jiggleRange = self.palettes[name].jig;
		lns.draw.wiggleRange = self.palettes[name].wig;
		lns.draw.wiggleSpeed = self.palettes[name].wigSpeed;
		lns.canvas.ctx.lineWidth = self.palettes[name].lineWidth;
		lns.draw.mouseInterval = self.palettes[name].mouse;
		lns.draw.brush = self.palettes[name].brush;
		lns.draw.brushSpread = self.palettes[name].brushSpread;
		lns.draw.dots = self.palettes[name].dots;
		lns.draw.grass = self.palettes[name].grass;

		lns.interface.faces.segNumRange.setValue(self.palettes[name].seg);
		lns.interface.faces.jiggleRange.setValue(self.palettes[name].jig);
		lns.interface.faces.wiggleRange.setValue(self.palettes[name].wig);
		lns.interface.faces.wiggleSpeed.setValue(self.palettes[name].wigSpeed);
		lns.interface.faces.lineWidth.setValue(self.palettes[name].lineWidth);
		lns.interface.faces.mouse.setValue(self.palettes[name].mouse);
		lns.interface.faces.brush.setValue(self.palettes[name].brush);
		lns.interface.faces.brushSpread.setValue(self.palettes[name].brushSpread);
		lns.interface.faces.dots.setValue(self.palettes[name].dots);
		lns.interface.faces.grass.setValue(self.palettes[name].grass);
	};

	palette.add(new UIButton({
		title: "Add Palette",
		callback: self.addPalette,
		key: "p"
	}));

	/* layer panel */
	this.layerPanel = new Panel("layer-menu", "Layer");
	self.panels['layer'] = this.layerPanel;
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
		self.resetDrawings();
		if (lns.frames[lns.currentFrame]) {
			for (let i = 0; i < lns.frames[lns.currentFrame].length; i++) {
				const layer = lns.frames[lns.currentFrame][i];
				const index = lns.layers[layer.l].d;
				self.layers.push(layer);
				layer.toggled = false;
				const toggleLayer = new UIToggleButton({
					on: layer.l,
					off: layer.l,
					callback: function() {
						self.toggle(layer);
						console.log(lns.layers[layer.l]); // debugging
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
	this.panels['drawing'] = this.drawingPanel; /* add to panels */

	this.showDrawings = function() {
		self.resetLayers();
		self.drawingPanel.addRow('drawings');
		for (let i = 0; i < lns.drawings.length; i++) {
			if (lns.drawings[i]) {
				let layer, index;
				const drawing = lns.drawings[i];

				/* add the full drawing regardless */

				/* check for existing layer */
				for (let j = 0; j < lns.layers.length; j++) {
					const _layer = lns.layers[j];
					if (_layer) {
						if (i == _layer.d) {
							layer = _layer;
							index = j;
							break;
						}
					}
				}

				/* create a layer if none existing */
				if (!layer) {
					if (drawing != null) {
						layer = {
							d: i,
							s: 0,
							e: drawing.length,
							c: lns.lineColor.color,
							...lns.draw.defaults,
							x: 0,
							y: 0
						};
					}
					lns.layers.push(layer);
					index = lns.layers.length - 1;
				} else {
					/* check start and end, create new player if different */
					if (layer.s != 0 || layer.e != drawing.length) {
						layer = { ...layer };
						layer.s = 0;
						layer.e = drawing.length;
						lns.layers.push(layer);
						index = lns.layers.length - 1;
					}
				}

				self.drawingPanel.add(new UIToggleButton({
					title: i,
					on: i,
					off: i,
					callback: function() {
						if (!lns.frames[lns.currentFrame])
							lns.frames[lns.currentFrame] = [];
						const idx = lns.frames[lns.currentFrame].findIndex(e => e.l == index);
						if (idx >= 0)lns.frames[lns.currentFrame].splice(idx, 1);
						else lns.frames[lns.currentFrame].push({ l: index });
					}
				}));
			}
		}
	};

	this.resetDrawings = function() {
		const rows = self.drawingPanel.rows;
		for (let i = rows.length - 1; i >= 1; i--) {
			self.drawingPanel.removeRow(rows[i]);
		}
	};

	/* settings */
	this.settingsPanel = new Panel('settings-menu', "Settings");
	this.panels['settings'] = this.settingsPanel;

	this.saveSettings = function() {
		const settings = {
			canvasColor: lns.bgColor.color,
			lineColor: lns.lineColor.color,
			width: lns.canvas.width,
			height: lns.canvas.height,
			fps: lns.render.fps,
			lps: lns.render.lps,
			onionSkinVisible: lns.render.onionSkinVisible,
			onionSkinNum: lns.render.onionSkinNum,
		};
		settings.panels = {};
		for (const p in lns.interface.panels) {
			settings.panels[p] = {
				open: lns.interface.panels[p].open,
				order: lns.interface.panels[p].order
			};
		}
		settings.palettes = self.palettes;
		localStorage.settings = JSON.stringify(settings);
	};

	this.loadSettings = function() {
		const settings = JSON.parse(localStorage.settings);
		lns.bgColor.set(settings.canvasColor);
		lns.canvas.setWidth(settings.width);
		lns.canvas.setHeight(settings.height);
		lns.render.setFps(settings.fps);
		lns.render.setLps(settings.lps);
		lns.lineColor.set(settings.lineColor);
		lns.render.onionSkinVisible = settings.onionSkinVisible;
		lns.render.onionSkinNum = settings.onionSkinNum;
		for (const p in settings.panels) {
			if (settings.panels[p].open) lns.interface.panels[p].toggle();
			lns.interface.panels[p].setOrder(settings.panels[p].order);
		}
		self.palettes = settings.palettes;
		if (self.palettes.current) self.loadPalette(self.palettes.current);
		for (const key in settings.palettes) {
			if (key != 'current') {
				palette.add(new UIButton({
					title: key,
					callback: function() {
						self.loadPalette(key);
					}
				}));
			}
		}

		lns.interface.faces.width.set(settings.width);
		lns.interface.faces.height.set(settings.height);
		lns.interface.faces.lineColor.setValue(settings.lineColor);
		lns.interface.faces.bgColor.setValue(settings.canvasColor);
	};

	this.clearSettings = function() {
		delete localStorage.settings;
	};

	/* build interface */
	fetch('./js/interface.json')
		.then(response => { return response.json(); })
		.then(data => {
			self.build(data);
			if (localStorage.settings) self.loadSettings();
		});

	const classes = {
		ui: UI,
		button: UIButton,
		toggle: UIToggleButton,
		text: UIText,
		range: UIRange,
		color: UIColor
	};

	this.build = function(data) {
		for (const key in data) {
			let panel;
			if (self.panels[key]) {
				panel = self.panels[key];
			} else {
				panel = new Panel(data[key].id, data[key].label);
				self.panels[key] = panel;
			}
			for (let i = 0; i < data[key].list.length; i++) {
				const u = data[key].list[i];
				const module = u.module || data[key].module;
				const params = { key: u.key, ...u.params };
				for (const k in u.fromModule) {
					params[k] =  lns[module][u.fromModule[k]];
				}

				if (u.set) {
					params.callback = function(value) {
						lns[module][u.set.prop] = u.set.number ? +value : value;

						if (u.set.layer) {
							self.updateProperty(u.set.layer, u.set.number ? +value : value)
						}
					};
					params.value = lns[module][u.set.prop];
				}

				const ui = new classes[u.type](params);
				if (u.row) panel.addRow();
				panel.add(ui);
				if (u.key) self.keys[u.key] = ui;
				if (u.face) self.faces[u.face] = ui;
			}
		}
	};
}
