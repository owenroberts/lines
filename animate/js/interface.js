function Interface() {
	const self = this;

	this.panels = {};
	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */

	this.framesPanel = new UI({ id:"frames" });
	this.frameElems = new UIList({ class: "frame" });

	/* update interface */
	this.updateInterface = function() {
		self.updateFrameNum();
		self.layers.drawLayers();
		self.updateFramesPanel();
	};

	/* plus frame is unsaved drawing frame
		do i need a plus frame? */
	this.plusFrame = new UI({
		id:"current",
		event: "click",
		callback: function() {
			/* make frame ui */
			self.setFrame(lns.numFrames);
		},
		key: "+"
	});
	this.keys['+'] = this.plusFrame;

	/* f key */
	this.setFrame = function(f) {
		if (+f <= lns.numFrames) {
			self.beforeFrame();
			lns.render.setFrame(+f);
			self.afterFrame();
		}
	};

	/* updates the frame panel representation of frames,
		sets current frame,
		sets copy frames */
	this.updateFramesPanel = function() {

		const numFrames = self.frameElems.getLength() - 1;
		/* this creates frames that don't already exist
			loop from the num of already made html frames to frames.length */
		if (lns.numFrames > numFrames) {
			/* this seems bad ... */
			for (let i = numFrames; i < lns.numFrames; i++) {
				/* should be a ui? */
				const frameElem = document.createElement("div");
				frameElem.classList.add("frame");
				frameElem.textContent = i;
				frameElem.dataset.index = i;

				/* click on frame, set the current frame */
				frameElem.onclick = function(ev) {
					lns.render.setFrame(i);
					self.updateInterface();
					self.resetLayers();
				};

				/* right click, add/remove from copy frames */
				frameElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					lns.data.selectFrame(ev.currentTarget);
				};

				/* this is one time un-ui thing */
				// this.framesPanel.el.appendChild(frameElem);
				this.framesPanel.el.insertBefore(frameElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames - 1; i >= lns.numFrames; i--){
				this.frameElems.remove(i); /* remove html frame */
			}
		}
		this.updateFrameNum();
	};

	/* update frame display and current frame */
	this.updateFrameNum = function() {

		if (lns.currentFrame == lns.numFrames && self.layersInFrame(lns.currentFrame)) {
			lns.numFrames++;
		}

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

		/* determine if add to num frames */
		if (self.layersInFrame(lns.currentFrame) && lns.numFrames < lns.currentFrame + 1)
			lns.numFrames++;
	};

	this.layersInFrame = function(n) {
		let inFrame = false;
		for (let i = 0; i < lns.layers.length; i++) {
			if (lns.layers[i].isInFrame(n)) 
				inFrame = true;
		}
		return inFrame;
	};

	/* call after changing a frame */
	this.afterFrame = function() {
		self.updateInterface();
		self.layers.resetLayers();
		self.drawings.resetDrawings();
	};

	/* e key - go to next frame */
	this.nextFrame = function() {
		self.beforeFrame();
		if (lns.currentFrame < lns.numFrames) lns.render.setFrame(lns.currentFrame + 1);
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
				lns.files.saveFramesToFile(self.title.getValue());
				document.activeElement.blur();
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	/* external interfaces */
	this.palette = new Palette();
	
	this.panels.layers = new Panel('layers-menu', 'Layers');
	this.layers = new Layers(this.panels.layers);

	this.panels.drawings = new Panel("drawing-menu", "Drawings");
	this.drawings = new Drawings(this.panels.drawings);

	this.panels.settings = new Panel('settings-menu', "Settings");
	this.settings = new Settings(this.panels.settings);

	this.fio = new FilesInterface(this);	

	/* build interface */
	fetch('./js/interface.json')
		.then(response => { return response.json(); })
		.then(data => {
			self.build(data);
			if (localStorage.settings) self.settings.loadSettings();
			// console.log(self.panels);
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
			/* grab panel reference if it exists, 
				create if it doesn't */
			if (self.panels[key]) {
				panel = self.panels[key];
			} else {
				panel = new Panel(data[key].id, data[key].label);
				self.panels[key] = panel;
			}
			/* create uis from list */
			for (let i = 0; i < data[key].list.length; i++) {
				const u = data[key].list[i];
				const module = u.module || data[key].module;
				const sub = u.sub || data[key].sub;
				const mod = sub ? lns[module][sub] : lns[module];
				const params = { key: u.key, ...u.params };
				for (const k in u.fromModule) {
					params[k] = mod[u.fromModule[k]];
				}

				/* setters don't need a callback for one value */
				if (u.set) {
					params.callback = function(value) {
						mod[u.set.prop] = u.set.number ? +value : value;
						if (u.set.layer) {
							self.updateProperty(u.set.layer, u.set.number ? +value : value)
						}
					};
					params.value = mod[u.set.prop];
				}

				const ui = new classes[u.type](params);
				if (u.row) panel.addRow();
				panel.add(ui);
				if (u.key) self.keys[u.key] = ui;
				if (u.face) self.faces[u.face] = ui;
			}
		}
	};

	if (Cool.mobilecheck()) document.body.classList.add('mobile');
}
