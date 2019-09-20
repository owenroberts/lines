function animateInterface(ui) {
	const self = ui;

	Object.defineProperty(lns.anim, 'plusFrame', {
		get: function() { return this.endFrame + 1; }
	}); // get the plus frame, end frame + 1

	ui.framesPanel = new UI({ id:"frames" });
	ui.frameElems = new UIList({ class: "frame" });

	ui.rl = new UIToggleButton({
		id: "right-left",
		on: "R/L",
		off: "L/R",
		callback: function() {
			if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
			else lns.canvas.canvas.parentElement.classList.remove('right');
		}
	});

	/* update interface */
	ui.updateInterface = function() {
		self.updateFrameNum();
		self.layers.resetLayers();
		self.drawings.resetDrawings();
		self.layers.drawLayers();
		self.updateFramesPanel();
	};

	ui.plusFrame = new UI({
		id:"current",
		event: "click",
		callback: function() {
			self.setFrame(lns.anim.plusFrame);
		},
		key: "+"
	});
	ui.keys['+'] = ui.plusFrame; /* just ui.keys['+'] ... */

	/* f key */
	ui.setFrame = function(f) {
		if (+f <= lns.anim.plusFrame) {
			self.beforeFrame();
			lns.render.setFrame(+f);
			self.afterFrame();
		}
	};

	/* updates the frame panel representation of frames,
		sets current frame,
		sets copy frames */
	ui.updateFramesPanel = function() {

		const numFrames = self.frameElems.length - 1;
		const animFrames = lns.anim.plusFrame;
		/* this creates frames that don't already exist, end Frame plus plus frame */
		if (animFrames > numFrames) {
			/* this seems bad ... */
			for (let i = numFrames; i < animFrames; i++) {
				/* should be a ui? */
				const frameElem = document.createElement("div");
				frameElem.classList.add("frame");
				frameElem.textContent = i;
				frameElem.dataset.index = i;

				/* click on frame, set the current frame */
				frameElem.onclick = function(ev) {
					lns.render.setFrame(i); /* use lns.anim ?? */
					self.updateInterface();
				};

				/* right click, add/remove from copy frames */
				frameElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					lns.data.selectFrame(ev.currentTarget);
				};

				/* this is one time un-ui thing */
				// this.framesPanel.el.appendChild(frameElem);
				ui.framesPanel.el.insertBefore(frameElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames - 1; i >= animFrames; i--){
				ui.frameElems.remove(i); /* remove html frame */
			}
		}
		ui.updateFrameNum();
	};

	/* update frame display and current frame */
	ui.updateFrameNum = function() {
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id");
		if (self.frameElems.els[lns.anim.currentFrame]) 
			self.frameElems.setId("current", lns.anim.currentFrame);
		else
			self.plusFrame.setId("current");
		self.faces.frameDisplay.set(lns.anim.currentFrame);
	};

	/* call before changing a frame */
	ui.beforeFrame = function() {
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		lns.data.saveLines();
	};

	ui.layersInFrame = function(n) {
		let inFrame = false;
		for (let i = 0; i < lns.anim.layers.length; i++) {
			if (lns.anim.layers[i].isInFrame(n)) 
				inFrame = true;
		}
		return inFrame;
	};

	/* call after changing a frame */
	ui.afterFrame = function() {
		lns.draw.reset();
		self.updateInterface();
	};

	/* e key - go to next frame */
	ui.nextFrame = function() {
		lns.anim.isPlaying = false;
		self.beforeFrame();
		if (lns.anim.currentFrame < lns.anim.plusFrame) {
			lns.render.setFrame(lns.anim.currentFrame + 1);
			if (lns.anim.states.default.end != lns.anim.endFrame)
				lns.anim.states.default.end = lns.anim.endFrame;
		}
		self.afterFrame();
	};

	/* w key - got to previous frame */
	ui.prevFrame = function() {
		lns.anim.isPlaying = false;
		self.beforeFrame();
		if (lns.anim.currentFrame > 0) lns.render.setFrame(lns.anim.currentFrame - 1);
		self.afterFrame();
	};

	['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(key => {
		self.keys[key] = {
			callback: function() {
				self.setFrame(+key);
			}
		};
	});

	/* external interfaces */
	ui.palette = new Palette();

	ui.panels.layers = new Panel('layers-menu', 'Layers');
	ui.layers = new Layers(ui.panels.layers);

	ui.panels.drawings = new Panel("drawing-menu", "Drawings");
	ui.drawings = new Drawings(ui.panels.drawings);

	ui.panels.states = new Panel("states-menu", "States");
	ui.states = new States(ui.panels.states);

	ui.fio = new FilesInterface(ui);
	ui.capture = new Capture();

	function appSave() {
		return {
			canvasColor: lns.canvas.bgColor,
			lineWidth: lns.canvas.ctx.lineWidth,
			c: lns.draw.layer.c,
			width: lns.canvas.width,
			height: lns.canvas.height,
			fps: lns.anim.fps,
			lps: lns.render.lps,
			onionSkinIsVisible: lns.render.onionSkinIsVisible,
			onionSkinNum: lns.render.onionSkinNum,
			mouseInterval: lns.draw.mouseInterval,
			palettes: lns.ui.palette.palettes,
			rl: lns.ui.rl.isOn,
			displayLayers: lns.ui.layers.canvas.canvas.style.display
		};
	}

	function appLoad(settings) {
		lns.canvas.setBGColor(settings.canvasColor);
		lns.canvas.setWidth(settings.width);
		lns.canvas.setHeight(settings.height);
		lns.canvas.setLineWidth(settings.lineWidth);
		lns.render.setFps(settings.fps);
		lns.render.setLps(settings.lps);
		lns.draw.layer.c = settings.c;
		lns.render.onionSkinIsVisible = settings.onionSkinIsVisible;
		lns.render.onionSkinNum = settings.onionSkinNum;

		lns.ui.faces.lps.setValue(settings.lps);
		lns.ui.faces.fps.setValue(settings.fps);
		lns.ui.faces.lineWidth.setValue(settings.lineWidth);
		lns.ui.faces.c.setValue(settings.c);
		/* this can be done with update, but i dont like lns.ui.faces being the location ... 
			update is also setting value
			setValue doesn't set the input for range values 
			lotta ui work left to do! */

		lns.ui.faces.bgColor.setValue(settings.canvasColor);
		lns.ui.faces.lineWidth.update(settings.lineWidth);
		lns.ui.faces.onionSkinNum.setValue(settings.onionSkinNum);

		/* update sets value and calls callback ...*/
		lns.ui.faces.mouseInterval.update(settings.mouseInterval); 

		lns.ui.palette.palettes = settings.palettes;
		if (lns.ui.palette.current) 
			self.loadPalette(lns.palettes.current);
		for (const key in settings.palettes) {
			if (key != 'current') {
				lns.ui.panels.palette.add(new UIButton({
					title: key,
					callback: function() {
						lns.ui.palette.loadPalette(key);
					}
				}));
			}
		}

		if (settings.rl == false) {
			ui.rl.callback();
			ui.rl.toggle();
		}

		if (settings.displayLayers) {
			ui.layers.toggleCanvas.callback();
			ui.layers.toggleCanvas.toggle();
		}
	}

	ui.settings = new Settings(lns, 'lns', appSave, appLoad);

	ui.settings.canvasLoad = function() {
		if (localStorage['settings-lns']) {
			const settings = JSON.parse(localStorage['settings-lns']);
			if (settings) lns.canvas.setLineWidth(settings.lineWidth);
		}
	};

	ui.settings.toggleSaveSettings = function() {
		lns.files.saveSettingsOnUnload = !lns.files.saveSettingsOnUnload;
	};
}
