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
				s: 0, // start point
				e: lns.lines.length, // end point
				c: lns.lineColor.color, // color
				n: lns.draw.n, // segment number
				r: lns.draw.r, // jiggle ammount
				w: lns.draw.w, // wiggle amount
				v: lns.draw.v, // wiggle change speed (v for velocity i guess)
				x: 0, // default x and y
				y: 0,
				f: [{
					s: lns.currentFrame,
					e: lns.currentFrame
				}]
			}));

			lns.drawings.push(lns.lines); /* add current lines to drawing data */
			lns.lineColor.addColorBtn(lns.lineColor.color); /* add current color to color choices */
			lns.lines = []; /* lines are saved, stop drawing? */
			lns.interface.updateFramesPanel(); /* update interface */
		}
		self.saveState(); /* save current state - one undo currently */
	};

	/* c key  */
	this.copy = function() {
		self.saveLines();
		lns.getLayers(lns.currentFrame, layer => {
			self.copyFrame.push(layer);
		});
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

		self.pasteFrames = [];
	};

	/* ctrl v */
	this.clearPasteFrames = function() {
		self.pasteFrames = [];

		/* this is a ui thing ... */
		const copyFrameElems = document.getElementsByClassName("copy");
		for (let i = copyFrameElems.length - 1; i >= 0; i--) {
			copyFrameElems[i].classList.remove("copy");
		}
	};

	/* x key */
	this.clearFrame = function() {
		self.saveState();
		/* separate lns.lines and layers ? */
		lns.lines = [];
		lns.getLayers(lns.currentFrame, layer => {
			layer.removeIndex(lns.currentFrame);
		});
	};

	/* d key */
	this.deleteFrame = function() {
		/* i don't know if this is even relevant
			... but maybe this is why frames is good ... */
		self.saveState();

		for (let i = 0; i < lns.layers.length; i++) {
			lns.layers[i].shiftIndex(lns.currentFrame);
		}

		lns.numFrames--;
		lns.lines = []; /* separate ... */
		lns.interface.updateFramesPanel();
	};

	/* shift-d */
	this.deleteFrameRange = function() {
		/* also don't know if this is relevant ... */
		self.saveState();
		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");
		if (startFrame > 0) lns.currentFrame = startFrame - 1;
		else lns.currentFrame = 0;
		lns.interface.updateFramesPanel();
	};

	/* z key */
	this.cutLastSegment = function() {
		if (lns.lines.length > 0) lns.lines.pop();
	};

	/* shift z */
	this.cutLastSegmentNum = function() {
		let num = prompt("How many segments?");
		while (lns.lines.length > 0 && num > 0) {
			lns.lines.pop();
			num--;
		}
	};

	/* shift x */
	this.cutLastDrawing = function() {
		/* also not relevant, remove layer or something */
		self.saveState();

	};

	/* ctrl x */
	this.cutFirstDrawing = function() {
		/* ditto */
		self.saveState();
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
		
		/* move indexes */

		lns.interface.updateFramesPanel();
	};

	/* shift-i key */
	this.insertFrameAfter = function() {
		self.saveLines();
		/* move indexes */
		lns.render.setFrame(lns.currentFrame + 1);
		lns.interface.updateFramesPanel();
	};

	/* m key */
	this.addMultipleCopies = function() {
		/* can't save state, saves multiple times */
		/* maybe this works ? */
		self.copyFrame = [];
		self.clearPasteFrames();
		let n = +prompt("Number of copies: ");
		self.copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.interface.nextFrame();
				self.paste();
			}
		}
	};

	this.newLayer = function(layer, layerIndex, frameIndex) {
		const prevLayer = lns.layers[layerIndex];
		const newLayer = {};
		for (const key in prevLayer) {
			if (layer[key] && layer[key] != prevLayer[key])
				newLayer[key] = layer[key];
			else
				newLayer[key] = prevLayer[key];
		}
		lns.layers.push(newLayer);
		layerIndex = lns.layers.length - 1;
		lns.frames[lns.currentFrame][frameIndex] = { l: layerIndex };
		return layerIndex;
	};

	/* this should basically all become irrelevant ... */

	/* animate a drawing segment by segment (or multiple)
		follow means they don't accumulate to form drawing at the end
		over means go over/add to subsequent frames */
	/* a: explode, ctrl a: follow, shift a: explode over, alt a: follow over */
	/* over states get fucked up with two drawings, need to figure
		out after adding drawing nums to frames in v2 */
	this.explode = function(params) {
		const follow = params.follow;
		const over = params.over;
		self.saveLines();
		/* can't undo multiple saves */
		const segmentsPerFrame = +prompt("Enter number of segments per frame:");
		if (segmentsPerFrame > 0) {
			const layers = _.cloneDeep(lns.frames[lns.currentFrame]);
			for (let i = 0; i < layers.length; i++) {
				const layer = layers[i];
				let layerIndex = layers[i].l;
				const drawingIndex = lns.layers[layerIndex].d;
				const lines = lns.drawings[drawingIndex];

				// if there's more than just a layer number, make new layer -  ??
				if (Object.keys(layer).length > 1) {
					layerIndex = self.newLayer(layer, layerIndex, i);
				}

				for (let j = 0; j < lines.length - 1; j += segmentsPerFrame) {
					if (!over) lns.interface.nextFrame();

					if (!lns.frames[lns.currentFrame]) lns.frames[lns.currentFrame] = [];
					else if (!over) self.saveLines();

					/* add previous drawings
						add another parameter for separating drawings?
						i think that exists in reverse draw? */
					if (!follow) {
						for (let k = 0; k < i; k++) {
							lns.frames[lns.currentFrame].push({
								...layers[k],
								s: 0,
								e: lns.drawings[ lns.layers[layers[k].l].d ].length,
							});
						}
					}

					lns.frames[lns.currentFrame].push({
						l: layerIndex,
						s: follow ? j : 0,
						e: Math.min(lines.length, j + segmentsPerFrame), /* maybe fix error */
					});

					if (over) lns.interface.nextFrame();
				}

			}
			lns.interface.updateFramesPanel();
		}
	};

	/* reverse of explode - shift-r - multi alt-r
		could be same function but then maybe my head would explode?
		simultaneous draw multi drawings at one  (multi) */
	this.reverse = function(params) {
		const simultaneous = params.simultaneous;
		self.saveLines();
		const segmentsPerFrame = +prompt("Enter number of segments per frame:");
		if (segmentsPerFrame > 0) {
			const layers = _.cloneDeep(lns.frames[lns.currentFrame]);
			const totalSegments = lns.frames[lns.currentFrame]
				.map(f => { return lns.layers[f.l].e} )
				.reduce((x,y) => { return x + y });

			// make new layers if necessary
			for (let i = 0; i < layers.length; i++) {
				const layer = layers[i];
				let layerIndex = layers[i].l;
				if (Object.keys(layer).length > 1) {
					layers[i] = { l: self.newLayer(layer, layerIndex, i) };
				}
			}

			for (let i = 0; i < totalSegments; i += segmentsPerFrame) {
				let indexMod = 0; // where to start
				lns.interface.nextFrame();
				if (!lns.frames[lns.currentFrame]) lns.frames[lns.currentFrame] = [];
				let framesAdded = false;
				for (let j = 0; j < layers.length; j++) {
					const layerIndex = layers[j].l;
					const drawingIndex = lns.layers[layerIndex].d;
					const lines = lns.drawings[drawingIndex];
					const drawingEnd = lns.layers[layerIndex].e;
					const drawingStart = lns.layers[layerIndex].s;
					if (i <= drawingEnd + (simultaneous ? 0 : indexMod) ) {
						lns.frames[lns.currentFrame].push({
							l: layerIndex,
							s: simultaneous ? i : (i - indexMod < 0 ? 0 : i - indexMod),
							e: drawingEnd
						});
						framesAdded = true;
					}
					indexMod += drawingEnd;
				}
				if (!framesAdded) self.deleteFrame();
			}
			lns.interface.updateFramesPanel();
		}
	};

	/* q key - all drawings in current frames, moved in each other frame
		in v2, x y for frame layers
		no context where argument is used ... */
	this.offsetDrawing = function(offset) {
		const _layers = lns.getLayers();
		if (_layers) {
			self.saveLines();
			self.saveState();
			if (!offset) offset = new Cool.Vector(+prompt("x"), +prompt("y"));
			if (offset) {
				// checking to see if layers are selected
				const layers = lns.interface.layers.length > 0 ? lns.interface.layers : _layers;
				// toggled - come back after layer panel is fixed ....
				for (let i = 0; i < layers.length; i++) {
					const layer = layers[i]; // frame layer
					const index = layer.l; // index of lines.layers
					layer.x = (layer.x ? layer.x : lns.layers[index].x) + offset.x;
					layer.y = (layer.y ? layer.y : lns.layers[index].y) + offset.y;
				}

			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	};

	/* shift q - prob should be default? */
	this.offsetAll = function(offset) {
		// forget this for now ... 
	};

	/* shift v */
	this.selectAll = function() {
		lns.interface.frameElems.looper(elem => {
			self.addFrameToCopy(elem);
		});
	};

	/* alt v */
	this.selectRange = function() {
		const start = prompt("Start frame:");
		const end = prompt("end frame:");
		lns.interface.frameElems.looper(elem => {
			self.addFrameToCopy(elem);
		}, start, end);
	};
}
