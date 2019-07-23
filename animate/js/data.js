function Data() {
	const self = this;

	this.framesCopy = []; // copied frame(s)
	this.framesToCopy = []; // selected frames to copy

	this.saveStates = {
		current: {
			drawings: undefined,
			frames: undefined,
			lines: undefined,
			layers: undefined
		},
		prev: {
			drawings: undefined,
			frames: undefined,
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

			/* save current lines in new frame */
			if (lns.frames[lns.currentFrame] == undefined) 
				lns.frames[lns.currentFrame] = [];
			lns.frames[lns.currentFrame].push({ l: lns.layers.length });

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
				y: 0
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
		/* if copy frames selected ... */
		if (self.framesToCopy.length > 0) {
			self.framesCopy = [];
			for (let i = 0; i < self.framesToCopy.length; i++) {
				const frmIndex = self.framesToCopy[i];
				const frm = lns.frames[frmIndex];
				self.framesCopy[i] = [];
				for (let h = 0; h < frm.length; h++) {
					self.framesCopy[i].push(_.cloneDeep(frm[h]));
				}
			}
		} else { /* copy current frame */
			if (lns.lines.length > 0) self.saveLines();
			if (lns.frames[lns.currentFrame]) {
				self.framesCopy = [];
				self.framesCopy.push([]);
				/* clone all of the drawings in current frame */
				for (let i = 0; i < lns.frames[lns.currentFrame].length; i++) {
					self.framesCopy[0].push(_.cloneDeep(lns.frames[lns.currentFrame][i]));
				}
			}
		}
	};

	/* v key */
	this.pasteFrames = function() {
		self.saveState();
		if (self.framesCopy.length > 1) { /* copy multiple to multiple */
			for (let i = 0; i < self.framesCopy.length; i++) {
				if (lns.frames[lns.currentFrame] == undefined) 
					lns.frames[lns.currentFrame] = [];
				const len = self.framesCopy[i].length;
				for (let h = 0; h < len; h++) {
					lns.frames[lns.currentFrame].push(self.framesCopy[i][h]);
				}
				self.saveLines();
				lns.interface.nextFrame();
			}
			lns.interface.updateFramesPanel();
		} else if (self.framesToCopy.length > 0) { /* copy one frame onto multiple */
			for (let h = 0; h < self.framesToCopy.length; h++) {
				for (let i = 0; i < self.framesCopy[0].length; i++) {
					lns.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[0][i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (self.framesCopy[0]) {
				if (lns.frames[lns.currentFrame] == undefined) {
					if (lns.lines.length > 0) self.saveLines();
					else lns.frames[lns.currentFrame] = [];
				}
				for (let i = 0; i <  self.framesCopy[0].length; i++) {
					lns.frames[lns.currentFrame].push( _.cloneDeep(self.framesCopy[0][i]) );
				}
			}
		}
	};

	/* ctrl v */
	this.clearFramesToCopy = function() {
		self.framesToCopy = [];
		const copyFrameElems = document.getElementsByClassName("copy");
		for (let i = copyFrameElems.length - 1; i >= 0; i--) {
			copyFrameElems[i].classList.remove("copy");
		}
	};

	/* x key */
	this.clearFrame = function() {
		self.saveState();
		if (lns.frames[lns.currentFrame])
			lns.frames[lns.currentFrame] = [];
		lns.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		self.saveState();
		const ftemp = lns.currentFrame;
		if (lns.currentFrame > 0 || lns.frames.length > 1) {
			lns.interface.prevFrame();
			lns.frames.splice(ftemp, 1);
		} else {
			lns.lines = [];
		}
		lns.interface.updateFramesPanel();
	};

	/* shift-d */
	this.deleteFrameRange = function() {
		self.saveState();
		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");
		if (startFrame > 0) lns.currentFrame = startFrame - 1;
		else lns.currentFrame = 0;
		lns.frames.splice(startFrame, endFrame - startFrame + 1);
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
		self.saveState();
		if (lns.frames[lns.currentFrame]) {
			self.saveLines();
			lns.frames[lns.currentFrame].pop(); // pop last drawing
		}
	};

	/* ctrl x */
	this.cutFirstDrawing = function() {
		self.saveState();
		if (lns.frames[lns.currentFrame]) {
			self.saveLines();
			lns.frames[lns.currentFrame].shift(); // pop last drawing
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
			self.saveStates.prev.frames = _.cloneDeep(self.saveStates.current.frames);
			self.saveStates.prev.lines = _.cloneDeep(self.saveStates.current.lines);
			self.saveStates.prev.layers = _.cloneDeep(self.saveStates.current.layers);

		} else {
			self.saveStates.prev.drawings = _.cloneDeep(lns.drawings);
			self.saveStates.prev.frames = _.cloneDeep(lns.frames);
			self.saveStates.prev.lines = _.cloneDeep(lns.lines);
			self.saveStates.prev.layers = _.cloneDeep(lns.layers);

		}

		self.saveStates.current.drawings = _.cloneDeep(lns.drawings);
		self.saveStates.current.frames = _.cloneDeep(lns.frames);
		self.saveStates.current.lines = _.cloneDeep(lns.lines);
		self.saveStates.current.layers = _.cloneDeep(lns.layers);
	};

	/* ctrl z - undo one save state  
		currently only works in some cases: after removing an drawing
		actually super buggy */
	this.undo = function() {
		if (self.saveStates.prev.drawings) {
			lns.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			lns.frames = _.cloneDeep(self.saveStates.prev.frames);
			lns.lines = _.cloneDeep(self.saveStates.prev.lines);

			self.saveStates.current.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			self.saveStates.current.frames = _.cloneDeep(self.saveStates.prev.frames);
			self.saveStates.current.lines = _.cloneDeep(self.saveStates.prev.lines);

			self.saveStates.prev.drawings = undefined;
			self.saveStates.prev.frames = undefined;
			self.saveStates.prev.lines = undefined;
			
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}
		lns.interface.updateFramesPanel();
	};

	/* i key */
	this.insertFrameBefore = function() {
		self.saveLines();
		lns.frames.insert(lns.currentFrame, []);
		lns.interface.updateFramesPanel();
	};

	/* shift-i key */
	this.insertFrameAfter = function() {
		self.saveLines();
		lns.frames.insert(lns.currentFrame + 1, []);
		lns.render.setFrame(lns.currentFrame + 1);
		lns.interface.updateFramesPanel();
	};

	/* m key - copies all drawings in frame and pastes in multiple frames after
		either into current frame or makes new one	 */
	this.addMultipleCopies = function() {
		/* can't save state, saves multiple times */
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
		self.saveLines();
		if (lns.frames[lns.currentFrame]) {
			self.saveLines();
			self.saveState();
			if (!offset) {
				offset = new Cool.Vector( +prompt("x"), +prompt("y") );
			}
			if (offset) {
				// checking to see if layers are selected 
				const layers = lns.interface.layers.length > 0 ? lns.interface.layers : lns.frames[lns.currentFrame];
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
		for (let i = 0; i < lns.frames.length; i++) {
			if (lns.frames[i]) {
				self.saveLines();
				self.saveState();
				// type to prevent mouse event 
				if ((!offset.x && !offset.y) || offset.type) {
					const x = +prompt("x");
					const y = +prompt("y");
					offset = new Cool.Vector(x,y);
				}
				if (offset) {
					for (let j = 0; j < lns.frames[i].length; j++) {
						const layer = lns.frames[i][j];
						const layerIndex = layer.l;
						if (layer) {
							layer.x = lns.layers[layerIndex].x + offset.x;
							layer.y = lns.layers[layerIndex].y + offset.y;
						}
					}
				}
			} else {
				console.log("%c No layers in frame ", "color:yellow; background:black;");
			}
		}
	};

	/* shift v */
	this.selectAll = function() {
		lns.interface.frameElems.looper((elem) => {
			self.addFrameToCopy(elem);
		});
	};

	/* alt v */
	this.selectRange = function() {
		const start = prompt("Start frame:");
		const end = prompt("end frame:");
		lns.interface.frameElems.looper((elem) => {
			self.addFrameToCopy(elem);
		}, start, end);
	};
}