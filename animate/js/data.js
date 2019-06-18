function Data() {
	const self = this;

	this.framesCopy = []; // copied frame(s)
	this.framesToCopy = []; // selected frames to copy

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

	/* right click drag or shift v
		add frame num to the list of frames to copy */
	this.addFrameToCopy = function(elem) {
		if (!elem.classList.contains("copy")) {
 			elem.classList.add("copy");
 			self.framesToCopy.push(+elem.dataset.index);
 		}
	};

	/* r key - save lines and add new lines */
	this.saveLines = function() {
		if (lns.lines.length > 0) {
			/* save render settings to a new layer */
			lns.layers.push({
				d: lns.drawings.length, // drawing index
				s: 0, // start point
				e: lns.lines.length, // end point
				c: lns.lineColor.color, // color
				n: lns.draw.segNumRange, // segment number
				r: lns.draw.jiggleRange, // jiggle ammount
				w: lns.draw.wiggleRange, // wiggle amount
				v: lns.draw.wiggleSpeed, // wiggle change speed (v for velocity i guess)
				x: 0, // default x and y
				y: 0,
				f: [{
					s: lns.currentFrame,
					e: lns.currentFrame
				}]
			});

			lns.drawings.push(lns.lines); /* add current lines to drawing data */
			lns.lineColor.addColorBtn(lns.lineColor.color); /* add current color to color choices */
			lns.lines = []; /* lines are saved, stop drawing? */
			lns.interface.updateFramesPanel(); /* update interface */
		}
		self.saveState(); /* save current state - one undo currently */
	};

	/* c key  */
	this.copyFrames = function() {
		/* if copy frames selected ... 
			i don't really use this ... */
		if (self.framesToCopy.length > 0) {
			self.framesCopy = [];

		} else { /* copy current frame */
			if (lns.lines.length > 0) self.saveLines();
			/* turn this into a function somewhere? 
				or part of layer class ... */
			lns.getLayers(lns.currentFrame, layer => {
				self.framesCopy[0].push(_.cloneDeep(layer));
			});
		}
	};

	/* v key */
	this.pasteFrames = function() {
		self.saveState();
		if (self.framesCopy.length > 1) { 
			/* copy multiple to multiple 
				not really used, ignore for now */
			
		}

		if (self.framesToCopy.length == 0)
			self.framesToCopy.push(lns.currentFrame); 

		/* copy one frame onto multiple */
		for (let h = 0; h < self.framesToCopy.length; h++) {
			for (let i = 0; i < self.framesCopy[0].length; i++) {
				/* need to check frames in each layer */
				/* i never want duplicate layers, right? */
				const frameIndex = self.framesToCopy[h];
				const layer = self.framesCopy[0][i];
				let adjacentFrame = false;
				for (let j = 0; j < layer.f.length; j++) {
					const frames = layer.f[j];
					if (frames.s - 1 == frameIndex) {
						frames.s -= 1;
						adjacentFrame = true;
					}
					if (frames.e + 1 == frameIndex) {
						frames.e += 1;
						adjacentFrame = true;
					}
				}
				if (!adjacentFrame)
					layer.f.push({s: frameIndex, e: frameIndex});
				/* hopefully this takes care of multiple copies ... */

			}
		}

		self.clearFramesToCopy();
	};

	/* ctrl v */
	this.clearFramesToCopy = function() {
		self.framesToCopy = [];

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
		lns.getLayers(lns.currentFrame, (layer, frames, frame) => {
			if (frame.s == lns.currentFrame) {
				frame.s++;
			} else if (frame.e == lns.currentFrame) {
				frame.e--;
			} else {
				frames.push({s: lns.currentFrame + 1, e: frame.e });
				frame.e = lns.currentFrame - 1;
			}
		});
	};

	/* d key */
	this.deleteFrame = function() {
		/* i don't know if this is even relevant
			... but maybe this is why frames is good ... */
		self.saveState();

		/* delete ? */

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

	/* m key - copies all drawings in frame and pastes in multiple frames after
		either into current frame or makes new one	 */
	this.addMultipleCopies = function() {
		/* can't save state, saves multiple times */
		/* maybe this works ? */
		self.framesCopy = [];
		self.clearFramesToCopy();
		let n = +prompt("Number of copies: ");
		self.copyFrames();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.interface.nextFrame();
				self.pasteFrames();
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
