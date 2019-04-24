function Interface() {
	let self = this;

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
			lns.draw.setFrame(+f);
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
		if (lns.frames.length > numFrames) {
			for (let i = numFrames; i < lns.frames.length; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				frmElem.dataset.index = i;

				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					lns.draw.setFrame(i);
					self.updateFrameNum();
					lns.drawingInterface.resetLayers();
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
			for (let i = numFrames; i > lns.frames.length; i--){
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
		lns.drawEvents.isDrawing = false;
		lns.data.saveLines();
	};
	
	/* call after changing a frame */
	this.afterFrame = function() {
		self.updateFramesPanel();
		lns.drawingInterface.resetLayers();
	};
	
	/* e key - go to next frame */
	this.nextFrame = function() {
		self.beforeFrame();
		if (lns.currentFrame < lns.frames.length) lns.draw.setFrame(lns.currentFrame + 1);
		self.afterFrame();
	};

	/* w key - got to previous frame */
	this.prevFrame = function() {
		self.beforeFrame();
		if (lns.currentFrame > 0) lns.draw.setFrame(lns.currentFrame - 1);
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
	/* set title after save, load? - observer ... */
	/* duplicated key value because of set key ... */

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

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		if (k && self.keys[k] && document.activeElement.type != "text") {
			if (k == "tab") ev.preventDefault(); // works?
			if (ev.shiftKey) k = "shift-" + k;
			if (ev.ctrlKey) k = "ctrl-" + k;
			if (ev.altKey) k = "alt-" + k;

			console.log('key', k, self.keys[k]);

			if (self.keys[k].handler) self.keys[k].handler(ev, self.keys[k]);
			else self.keys[k].callback();
			self.keys[k].press();

		} else if (document.activeElement.id == 'title') {
			if (k == 'enter') {
				lns.fio.saveFramesToFile();
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
				seg: lns.drawEvents.segNumRange,
				jig: lns.drawEvents.jiggleRange,
				wig: lns.drawEvents.wiggleRange,
				wigSpeed: lns.drawEvents.wiggleSpeed,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouse: lns.drawEvents.mouseInterval,
				brush: lns.drawEvents.brush,
				brushSpread: lns.drawEvents.brushSpread,
				dots: lns.drawEvents.dots,
				grass: lns.drawEvents.grass
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
		lns.lineColor.setColor(self.palettes[name].color);
		lns.drawEvents.segNumRange = self.palettes[name].seg;
		lns.drawingInterface.segNumElem.setValue(self.palettes[name].seg);
		lns.drawEvents.jiggleRange = self.palettes[name].jig;
		lns.drawingInterface.jiggleElem.setValue(self.palettes[name].jig);
		lns.drawEvents.wiggleRange = self.palettes[name].wig;
		lns.drawingInterface.wiggleElem.setValue(self.palettes[name].wig);
		lns.drawEvents.wiggleSpeed = self.palettes[name].wigSpeed;
		lns.drawingInterface.wiggleSpeedElem.setValue(self.palettes[name].wigSpeed);
		lns.canvas.ctx.lineWidth = self.palettes[name].lineWidth;
		lns.drawingInterface.lineWidth.setValue(self.palettes[name].lineWidth);
		lns.drawEvents.mouseInterval = self.palettes[name].mouse;
		lns.drawingInterface.mouseElem.setValue(self.palettes[name].mouse);
		lns.drawEvents.brush = self.palettes[name].brush;
		lns.drawingInterface.brushElem.setValue(self.palettes[name].brush);
		lns.drawEvents.brushSpread = self.palettes[name].brushSpread;
		lns.drawingInterface.brushSpreadElem.setValue(self.palettes[name].brushSpread);
		lns.drawEvents.dots = self.palettes[name].dots;
		lns.drawingInterface.dotsElem.setValue(self.palettes[name].dots);
		lns.drawEvents.grass = self.palettes[name].grass;
		lns.drawingInterface.grassElem.setValue(self.palettes[name].grass);
	};

	palette.add(new UIButton({
		title: "Add Palette",
		callback: self.addPalette,
		key: "p"
	}));

	/* settings */
	this.saveSettings = function() {
		const settings = {
			canvasColor: lns.bgColor.color,
			width: lns.canvas.width,
			height: lns.canvas.height,
			fps: lns.draw.fps,
			lps: lns.draw.lps,
			onionSkinVisible: lns.draw.onionSkinVisible,
			onionSkinNum: lns.draw.onionSkinNum,
		};
		settings.open = [];
		for (const p in lns.interface.panels) {
			if (lns.interface.panels[p].open) settings.open.push(p) 
		}
		settings.palettes = self.palettes;
		localStorage.settings = JSON.stringify(settings);
	};	

	this.loadSettings = function() {
		const settings = JSON.parse(localStorage.settings);
		lns.bgColor.set(settings.canvasColor);
		lns.canvas.setWidth(settings.width);
		lns.canvas.setHeight(settings.height);
		lns.draw.setFps(settings.fps);
		lns.draw.setLps(settings.lps);
		lns.draw.onionSkinVisible = settings.onionSkinVisible;
		lns.draw.onionSkinNum = settings.onionSkinNum;
		for (let i = 0; i < settings.open.length; i++) {
			lns.interface.panels[settings.open[i]].toggle();
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
	};

	this.keys['ctrl-s'] = new UIButton({
		id: "save-settings",
		title: "Save Settings",
		callback: self.saveSettings,
		key: "ctrl-s"
	});

	this.keys['alt-s'] = new UIButton({
		id: "load-settings",
		title: "Load Settings",
		callback: self.loadSettings,
		key: "alt-s"
	});

	fetch('./js/interface.json')
		.then(response => { return response.json(); })
		.then(data => { self.build(data) });

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
					};
					params.value = lns[module][u.set.prop];

					/* update layer property .... ie 
						if (self.layers.length > 0) {
							self.updateLayerProperty('n', value);
						}
					*/
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