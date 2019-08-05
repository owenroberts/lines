function Data() {
	const self = this;

	this.copyFrame = []; // copy layers in frame
	this.pasteFrames = []; // frame indexes to paste

	this.saveStates = {
		current: {
			drawings: undefined,
			lines: undefined,
			layers: undefined
		},
		prev: {
			drawings: undefined,
			lines: undefined,
			layers: undefined
		}
	};

	/* r key - save lines and add new lines */
	this.saveLines = function() {
		if (lns.lines.length > 0) {
			/* save render settings to a new layer */
			lns.layers.push(new Layer({
				d: lns.drawings.length, // drawing index
				c: lns.lineColor.color, // color
				n: lns.draw.n, // segment number
				r: lns.draw.r, // jiggle ammount
				w: lns.draw.w, // wiggle amount
				v: lns.draw.v, // wiggle change speed (v for velocity i guess)
				x: 0, // default x and y
				y: 0,
				f: { s: lns.currentFrame, e: lns.currentFrame },
				a: []
			}));

			lns.drawings.push(lns.lines); /* add current lines to drawing data */
			lns.lineColor.addColorBtn(lns.lineColor.color); /* add current color to color choices */
			lns.lines = []; /* lines are saved, stop drawing? */
			lns.interface.updateInterface(); /* update interface */
		}
		self.saveState(); /* save current state - one undo currently */
	};

	/* c key  */
	this.copy = function() {
		self.saveLines();
		for (let i = 0; i < lns.layers.length; i++) {
			if (lns.layers[i].isInFrame(lns.currentFrame))
				self.copyFrame.push(lns.layers[i]);
		}
	};

	/* v key */
	this.paste = function() {
		self.saveState();

		if (self.pasteFrames.length == 0)
			self.pasteFrames.push(lns.currentFrame); 

		/* copy one frame onto multiple */
		for (let i = 0; i < self.pasteFrames.length; i++) {
			for (let j = 0; j < self.copyFrame.length; j++) {
				self.copyFrame[j].addIndex(self.pasteFrames[i]);
			}
		}

		self.clearSelected();
	};

	this.selectFrame = function(elem) {
		if (!elem.classList.contains("selected")) {
 			elem.classList.add("selected");
 			self.pasteFrames.push(+elem.dataset.index);
 		}
	};

	/* shift v */
	this.selectAll = function() {
		lns.interface.frameElems.looper(elem => {
			self.selectFrame(elem);
		});
	};

	/* alt v */
	this.selectRange = function() {
		const start = prompt("Start frame:");
		const end = prompt("end frame:");
		lns.interface.frameElems.looper(elem => {
			self.selectFrame(elem);
		}, start, end);
	};

	/* ctrl v */
	this.clearSelected = function() {
		self.pasteFrames = [];

		/* this is a ui thing ... */
		const copyFrameElems = document.getElementsByClassName("selected");
		for (let i = copyFrameElems.length - 1; i >= 0; i--) {
			copyFrameElems[i].classList.remove("selected");
		}
	};

	/* x key */
	this.clearFrame = function() {
		self.saveState();
		/* separate lns.lines and layers ? */
		lns.lines = [];

		for (let i = 0; i < lns.layers.length; i++) {
			if (lns.layers[i].isInFrame(lns.currentFrame))
				lns.layers[i].removeIndex(lns.currentFrame);
		}
	};

	/* d key */
	this.deleteFrame = function() {
		self.saveState();
		if (lns.layers.length > 0) {
			for (let i = lns.layers.length - 1; i >= 0; i--) {
				lns.layers[i].removeIndex(lns.currentFrame);
				if (lns.layers[i])
					lns.layers[i].shiftIndex(lns.currentFrame + 1, -1);
			}
			lns.numFrames--;
		}
		lns.interface.updateInterface();
		self.clearFrame();
	};

	/* shift-d */
	this.deleteFrameRange = function() {
		self.saveState();
		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");

		if (endFrame > 0) {
			for (let i = 0; i < lns.layers.length; i++) {
				for (let j = endFrame; j >= startFrame; j--) {
					lns.layers[i].removeIndex(j);
					lns.layers[i].shiftIndex(j + 1, -1);
				}
			}

			lns.numFrames -= endFrame - startFrame + 1;
			if (startFrame > 0) lns.render.setFrame(startFrame - 1);
			else lns.currentFrame = 0;
			lns.interface.updateFramesPanel();
		}
	};

	/* z key */
	this.cutLastSegment = function() {
		if (lns.interface.layers.length > 0) lns.interface.cutLayerSegment();
		else if (lns.lines.length > 0) {
			if (lns.lines.pop() == 'end')
				lns.lines.pop();
			lns.lines.push('end');
		}
	};

	/* shift z */
	this.cutLastLine = function() {
		if (lns.interface.layers.length > 0) lns.interface.cutLayerLine();
		if (lns.lines.length > 0) {
			lns.lines.pop(); // remove end
			for (let i = lns.lines.length - 1; i > 0; i--) {
				if (lns.lines[i] != 'end') lns.lines.pop();
				else break;
			}
		}
	};

	/* save current state of frames and drawing - one undo */
	this.saveState = function() {
		/*
			if save state already exists, save current to previous state
			if not save previous to new
			always save current to new
		*/
		if (self.saveStates.current.drawings) {
			self.saveStates.prev.drawings = _.cloneDeep(self.saveStates.current.drawings);
			self.saveStates.prev.lines = _.cloneDeep(self.saveStates.current.lines);
			self.saveStates.prev.layers = _.cloneDeep(self.saveStates.current.layers);
		} else {
			self.saveStates.prev.drawings = _.cloneDeep(lns.drawings);
			self.saveStates.prev.lines = _.cloneDeep(lns.lines);
			self.saveStates.prev.layers = _.cloneDeep(lns.layers);
		}

		self.saveStates.current.drawings = _.cloneDeep(lns.drawings);
		self.saveStates.current.lines = _.cloneDeep(lns.lines);
		self.saveStates.current.layers = _.cloneDeep(lns.layers);
	};

	/* ctrl z - undo one save state
		currently only works in some cases: after removing an drawing
		actually super buggy */
	this.undo = function() {
		if (self.saveStates.prev.drawings) {
			lns.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			lns.lines = _.cloneDeep(self.saveStates.prev.lines);
			lns.layers = _.cloneDeep(self.saveStates.prev.layers);


			self.saveStates.current.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			self.saveStates.current.lines = _.cloneDeep(self.saveStates.prev.lines);
			self.saveStates.current.layers = _.cloneDeep(self.saveStates.prev.layers);

			self.saveStates.prev.drawings = undefined;
			self.saveStates.prev.lines = undefined;
			self.saveStates.prev.layers = undefined;
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}
		lns.interface.updateFramesPanel();
	};

	/* i key */
	this.insertFrameBefore = function() {
		self.saveLines();
		for (let i = 0; i < lns.layers.length; i++) {
			lns.layers[i].shiftIndex(lns.currentFrame, 1);
			lns.layers[i].removeIndex(lns.currentFrame);
		}
		lns.numFrames++;
		lns.interface.updateFramesPanel();
	};

	/* shift-i key */
	this.insertFrameAfter = function() {
		self.saveLines();
		for (let i = 0; i < lns.layers.length; i++) {
			lns.layers[i].shiftIndex(lns.currentFrame, -1);
			lns.layers[i].removeIndex(lns.currentFrame + 1);
		}
		lns.numFrames++;
		lns.render.setFrame(lns.currentFrame + 1);
		lns.interface.updateFramesPanel();
	};

	/* m key */
	this.addMultipleCopies = function() {
		self.copyFrame = [];
		self.clearSelected();
		let n = +prompt("Number of copies: ");
		self.copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.interface.nextFrame();
				self.paste();
			}
		}
	};

	/* q key  */
	this.offsetDrawing = function(offset) {
		self.saveLines();
		const _layers = [];
		for (let i = 0; i < lns.layers.length; i++) {
			if (lns.layers[i].isInFrame(lns.currentFrame)) 
				_layers.push(lns.layers[i]);
		}
		if (_layers) {
			self.saveLines();
			self.saveState();
			if (!offset) offset = new Cool.Vector(+prompt("x"), +prompt("y"));
			if (offset) {
				
				// check to see if layers are selected
				let layers = [];
				if (lns.interface.layers.length > 0) {
					for (let i = 0; i < lns.interface.layers.length; i++) {
						if (lns.interface.layers[i].toggled)
							layers.push(lns.interface.layers[i])
					}
				} else {
					layers = _layers;
				}

				for (let i = 0; i < layers.length; i++) {
					layers[i].x += offset.x;
					layers[i].y += offset.y;
				}
			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	};

	/* a key */
	this.explode = function(params) {
		self.saveLines();
		const frames = +prompt('Number of frames?');
		for (let i = 0; i < lns.layers.length; i++) {
			const layer = lns.layers[i];
			layer.f.e = layer.f.s + frames;
			if (layer.f.e > lns.numFrames) lns.numFrames = layer.f.e;
			layer.draw = params.type;
		}
		lns.interface.updateFramesPanel();
	};
}
