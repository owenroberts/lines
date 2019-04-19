function Interface() {
	let self = this;

	this.panels = {}; 
	this.keyCommands = {}; /* parts of the interface? */

	this.framesPanel = new UI({id:"frames"});
	this.frameElems = new UIList({class:"frame"});
	/* plus frame is unsaved drawing frame */
	this.plusFrame = new UI({
		id:"current",
		event: "click",
		callback: function() {
			Lines.currentFrame = Lines.frames.length;
			Lines.drawingInterface.resetLayers();
			self.updateFrameNum();
		}
	});
	this.keyCommands['+'] = this.plusFrame; /* can't add key command bc this module doesn't exist yet */

	this.back = new UI({
		id: 'back',
		callback: function() {
			Lines.draw.setFrame(0);
			Lines.interface.updateFramesPanel();
			Lines.drawingInterface.resetLayers();
		}
	});
	this.keyCommands['backslash'] = this.back;

	/* updates the frame panel representation of frames, 
		sets current frame, 
		sets copy frames */
	this.updateFramesPanel = function() {
		const numFrames = self.frameElems.getLength();
		/* this creates frames that don't already exist
			loop from the num of already made html frames to frames.length */
		if (Lines.frames.length > numFrames) {
			for (let i = numFrames; i < Lines.frames.length; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				frmElem.dataset.index = i;

				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					Lines.draw.setFrame(i);
					self.updateFrameNum();
					Lines.drawingInterface.resetLayers();
				};

				/* right click, add/remove from copy frames */
				frmElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					if (!this.classList.toggle("copy")){
						Lines.data.framesToCopy.splice(Lines.data.framesToCopy.indexOf(i), 1);
					} else {
						this.classList.add("copy");
						Lines.data.framesToCopy.push(i);
					}
				};

				/* this is one time un-ui thing */
				this.framesPanel.el.insertBefore(frmElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames; i > Lines.frames.length; i--){
				this.frameElems.remove(i-1); /* remove html frame */
			}
		}
		this.updateFrameNum();
	};

	/* update frame display and current frame */
	this.updateFrameNum = function() {
		Lines.drawingInterface.frameNumDisplay.set(Lines.currentFrame);
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id");
		if (self.frameElems.els[Lines.currentFrame]) // also un-ui
			self.frameElems.setId("current", Lines.currentFrame);
		else 
			self.plusFrame.setId("current");
	};

	/* call before changing a frame */
	this.beforeFrame = function() {
		Lines.drawEvents.isDrawing = false;
		Lines.data.saveLines();
	};
	
	/* call after changing a frame */
	this.afterFrame = function() {
		self.updateFramesPanel();
		Lines.drawingInterface.resetLayers();
	};
	
	/* e key - go to next frame */
	this.nextFrame = function() {
		self.beforeFrame();
		if (Lines.currentFrame < Lines.frames.length) Lines.draw.setFrame(Lines.currentFrame + 1);
		self.afterFrame();
	};

	/* w key - got to previous frame */
	this.prevFrame = function() {
		self.beforeFrame();
		if (Lines.currentFrame > 0) Lines.draw.setFrame(Lines.currentFrame - 1);
		self.afterFrame();
	};

	['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(key => {
		self.keyCommands[key] = {
			callback: function() {
				self.beforeFrame();
				if (Lines.frames[+key]) Lines.currentFrame = +key;
				self.afterFrame();
			}
		}
	});
	self.keyCommands['`'] = {
		callback: function() {
			self.beforeFrame();
			if (Lines.frames[0]) Lines.currentFrame = 0;
			self.afterFrame();
		}
	}

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space" || k == "tab") ev.preventDefault();
		if (document.activeElement.type != "text") {

			if (ev.shiftKey) k = "shift-" + k;
			if (ev.ctrlKey) k = "ctrl-" + k;
			if (ev.altKey) k = "alt-" + k;

			console.log(k);

			if (self.keyCommands[k].handler) {
				self.keyCommands[k].handler(ev, self.keyCommands[k]);
				//  self.keyCommands[k].addClass('key-down'); show key presses?
				if (self.keyCommands[k].toggleText) self.keyCommands[k].toggleText();
			}
		} else if (document.activeElement.id == 'title') {
			if (k == 'enter') {
				Lines.fio.saveFramesToFile();
				document.activeElement.blur();
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	/* palette */
	const palette = new Panel('palette', 'Palette');
	this.palettes = {};
	
	this.addPalette = function() {
		Lines.data.saveLines();
		const name = self.palettes.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				color: Lines.lineColor.color,
				seg: Lines.drawEvents.segNumRange,
				jig: Lines.drawEvents.jiggleRange,
				wig: Lines.drawEvents.wiggleRange,
				wigSpeed: Lines.drawEvents.wiggleSpeed,
				lineWidth: Lines.canvas.ctx.lineWidth,
				mouse: Lines.drawEvents.mouseInterval,
				brush: Lines.drawEvents.brush,
				brushSpread: Lines.drawEvents.brushSpread,
				dots: Lines.drawEvents.dots,
				grass: Lines.drawEvents.grass
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
		Lines.data.saveLines();
		self.palettes.current = name;
		Lines.lineColor.setColor(self.palettes[name].color);
		Lines.drawEvents.segNumRange = self.palettes[name].seg;
		Lines.drawingInterface.segNumElem.setValue(self.palettes[name].seg);
		Lines.drawEvents.jiggleRange = self.palettes[name].jig;
		Lines.drawingInterface.jiggleElem.setValue(self.palettes[name].jig);
		Lines.drawEvents.wiggleRange = self.palettes[name].wig;
		Lines.drawingInterface.wiggleElem.setValue(self.palettes[name].wig);
		Lines.drawEvents.wiggleSpeed = self.palettes[name].wigSpeed;
		Lines.drawingInterface.wiggleSpeedElem.setValue(self.palettes[name].wigSpeed);
		Lines.canvas.ctx.lineWidth = self.palettes[name].lineWidth;
		Lines.drawingInterface.lineWidth.setValue(self.palettes[name].lineWidth);
		Lines.drawEvents.mouseInterval = self.palettes[name].mouse;
		Lines.drawingInterface.mouseElem.setValue(self.palettes[name].mouse);
		Lines.drawEvents.brush = self.palettes[name].brush;
		Lines.drawingInterface.brushElem.setValue(self.palettes[name].brush);
		Lines.drawEvents.brushSpread = self.palettes[name].brushSpread;
		Lines.drawingInterface.brushSpreadElem.setValue(self.palettes[name].brushSpread);
		Lines.drawEvents.dots = self.palettes[name].dots;
		Lines.drawingInterface.dotsElem.setValue(self.palettes[name].dots);
		Lines.drawEvents.grass = self.palettes[name].grass;
		Lines.drawingInterface.grassElem.setValue(self.palettes[name].grass);
	};

	this.keyCommands['p'] = new UIButton({
		title: "Add Palette",
		callback: self.addPalette
	});
	palette.add(this.keyCommands['p']);
	this.keyCommands['p'].setKey('p');

	/* settings */
	this.saveSettings = function() {
		const settings = {
			canvasColor: Lines.canvas.bgColor.color,
			width: Lines.canvas.width,
			height: Lines.canvas.height,
			fps: Lines.draw.fps,
			lps: Lines.draw.lps,
			onionSkinVisible: Lines.draw.onionSkinVisible,
			onionSkinNum: Lines.draw.onionSkinNum,

		};
		settings.palettes = self.palettes;
		localStorage.settings = JSON.stringify(settings);
	};	

	this.loadSettings = function() {
		const settings = JSON.parse(localStorage.settings);
		Lines.canvas.bgColor.setColor(settings.canvasColor);
		Lines.canvas.setWidth(settings.width);
		Lines.canvas.setHeight(settings.height);
		Lines.draw.setFps(settings.fps);
		Lines.draw.setLps(settings.lps);
		Lines.draw.onionSkinVisible = settings.onionSkinVisible;
		Lines.draw.onionSkinNum = settings.onionSkinNum;
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

	this.keyCommands['ctrl-s'] = new UIButton({
		id: "save-settings",
		title: "Save Settings",
		callback: self.saveSettings,
		key: "ctrl-s"
	});

	this.keyCommands['alt-s'] = new UIButton({
		id: "load-settings",
		title: "Load Settings",
		callback: self.loadSettings,
		key: "alt-s"
	});

	fetch('./js/interface.json')
		.then(response => { return response.json(); })
		.then(data => { self.build(data) });

	const classes = {
		range: UIRange
	}

	this.build = function(data) {
		for (const key in data) {
			const panel = new Panel(data[key].id, data[key].label);
			for (let i = 0; i < data[key].list.length; i++) {
				const u = data[key].list[i];
				const params = u.params;
				for (const k in u.fromModule) {
					params[k] =  Lines[u.module][u.fromModule[k]];
				}
				const ui = new classes[u.type](params);
				panel.add(ui);
				if (u.key) self.keyCommands[u.key] = ui;
			}
		}
	};
}