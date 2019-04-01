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
		if (Lines.lines.length > 0) {

			/* save current lines in new frame */
			if (Lines.frames[Lines.currentFrame] == undefined) 
				Lines.frames[Lines.currentFrame] = [];
			Lines.frames[Lines.currentFrame].push({ l: Lines.layers.length });

			/* save render settings to a new layer */	
			Lines.layers.push({
				d: Lines.drawings.length, // drawing index
				s: 0, // start point
				e: Lines.lines.length, // end point
				c: Lines.lineColor.color, // color
				n: Lines.drawEvents.segNumRange, // segment number
				r: Lines.drawEvents.jiggleRange, // jiggle ammount
				w: Lines.drawEvents.wiggleRange, // wiggle amount
				v: Lines.drawEvents.wiggleSpeed, // wiggle change speed (v for velocity i guess)
				x: 0, // default x and y
				y: 0
			});

			Lines.drawings.push(Lines.lines); /* add current lines to drawing data */
			Lines.lineColor.addColorBtn(Lines.lineColor.color); /* add current color to color choices */
			Lines.lines = []; /* lines are saved, stop drawing? */
			Lines.interface.updateFramesPanel(); /* update interface */
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
				const frm = Lines.frames[frmIndex];
				self.framesCopy[i] = [];
				for (let h = 0; h < frm.length; h++) {
					self.framesCopy[i].push(_.cloneDeep(frm[h]));
				}
			}
		} else { /* copy current frame */
			if (Lines.lines.length > 0) self.saveLines();
			if (Lines.frames[Lines.currentFrame]) {
				self.framesCopy = [];
				self.framesCopy.push([]);
				/* clone all of the drawings in current frame */
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					self.framesCopy[0].push(_.cloneDeep(Lines.frames[Lines.currentFrame][i]));
				}
			}
		}
	};

	/* v key */
	this.pasteFrames = function() {
		self.saveState();
		if (self.framesCopy.length > 1) { /* copy multiple to multiple */
			for (let i = 0; i < self.framesCopy.length; i++) {
				if (Lines.frames[Lines.currentFrame] == undefined) 
					Lines.frames[Lines.currentFrame] = [];
				const len = self.framesCopy[i].length;
				for (let h = 0; h < len; h++) {
					Lines.frames[Lines.currentFrame].push(self.framesCopy[i][h]);
				}
				self.saveLines();
				Lines.interface.nextFrame();
			}
			Lines.interface.updateFramesPanel();
		} else if (self.framesToCopy.length > 0) { /* copy one frame onto multiple */
			for (let h = 0; h < self.framesToCopy.length; h++) {
				for (let i = 0; i < self.framesCopy[0].length; i++) {
					Lines.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[0][i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (self.framesCopy[0]) {
				if (Lines.frames[Lines.currentFrame] == undefined) {
					if (Lines.lines.length > 0) self.saveLines();
					else Lines.frames[Lines.currentFrame] = [];
				}
				for (let i = 0; i <  self.framesCopy[0].length; i++) {
					Lines.frames[Lines.currentFrame].push( _.cloneDeep(self.framesCopy[0][i]) );
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
		if (Lines.frames[Lines.currentFrame])
			Lines.frames[Lines.currentFrame] = [];
		Lines.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		self.saveState();
		const ftemp = Lines.currentFrame;
		if (Lines.currentFrame > 0 || Lines.frames.length > 1) {
			Lines.interface.prevFrame();
			Lines.frames.splice(ftemp, 1);
		} else {
			Lines.lines = [];
		}
		Lines.interface.updateFramesPanel();
	};

	/* shift-d */
	this.deleteFrameRange = function() {
		self.saveState();
		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");
		if (startFrame > 0) Lines.currentFrame = startFrame - 1;
		else Lines.currentFrame = 0;
		Lines.frames.splice(startFrame, endFrame - startFrame + 1);
		Lines.interface.updateFramesPanel();
	};

	/* z key */
	this.cutLastSegment = function() {
		if (Lines.lines.length > 0) Lines.lines.pop();
	};

	/* shift z */
	this.cutLastSegmentNum = function() {
		let num = prompt("How many segments?");
		while (Lines.lines.length > 0 && num > 0) {
			Lines.lines.pop();
			num--;
		}
	};

	/* shift x */
	this.cutLastDrawing = function() {
		self.saveState();
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].pop(); // pop last drawing
		}
	};

	/* ctrl x */
	this.cutFirstDrawing = function() {
		self.saveState();
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].shift(); // pop last drawing
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
			self.saveStates.prev.drawings = _.cloneDeep(Lines.drawings);
			self.saveStates.prev.frames = _.cloneDeep(Lines.frames);
			self.saveStates.prev.lines = _.cloneDeep(Lines.lines);
			self.saveStates.prev.layers = _.cloneDeep(Lines.layers);

		}

		self.saveStates.current.drawings = _.cloneDeep(Lines.drawings);
		self.saveStates.current.frames = _.cloneDeep(Lines.frames);
		self.saveStates.current.lines = _.cloneDeep(Lines.lines);
		self.saveStates.current.layers = _.cloneDeep(Lines.layers);
	};

	/* ctrl z - undo one save state  
		currently only works in some cases: after removing an drawing
		actually super buggy */
	this.undo = function() {
		if (self.saveStates.prev.drawings) {
			Lines.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			Lines.frames = _.cloneDeep(self.saveStates.prev.frames);
			Lines.lines = _.cloneDeep(self.saveStates.prev.lines);

			self.saveStates.current.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			self.saveStates.current.frames = _.cloneDeep(self.saveStates.prev.frames);
			self.saveStates.current.lines = _.cloneDeep(self.saveStates.prev.lines);

			self.saveStates.prev.drawings = undefined;
			self.saveStates.prev.frames = undefined;
			self.saveStates.prev.lines = undefined;
			
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}
		Lines.interface.updateFramesPanel();
	};

	/* i key */
	this.insertFrameBefore = function() {
		self.saveLines();
		Lines.frames.insert(Lines.currentFrame, []);
		Lines.interface.updateFramesPanel();
	};

	/* shift-i key */
	this.insertFrameAfter = function() {
		self.saveLines();
		Lines.frames.insert(Lines.currentFrame + 1, []);
		Lines.draw.setFrame(Lines.currentFrame + 1);
		Lines.interface.updateFramesPanel();
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
				Lines.interface.nextFrame();
				self.pasteFrames();
			}
		}
	};

	/* animate a drawing segment by segment (or multiple) 
		follow means they don't accumulate to form drawing at the end
		over means go over/add to subsequent frames */
	/* a: explode, ctrl a: follow, shift a: explode over, alt a: follow over */
	/* over states get fucked up with two drawings, need to figure
		out after adding drawing nums to frames in v2 */
	this.explode = function(follow, over) {
		self.saveLines();
		/* can't undo multiple saves */
		const segmentsPerFrame = +prompt("Enter number of segments per frame:");
		if (segmentsPerFrame > 0) {
			const layers = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			for (let i = 0; i < layers.length; i++) {
				const layerIndex = layers[i].l;
				const drawingIndex = Lines.layers[layerIndex].d;
				const lines = Lines.drawings[drawingIndex];
				for (let j = 0; j < lines.length - 1; j += segmentsPerFrame) {
					if (!over) Lines.interface.nextFrame();
					
					if (!Lines.frames[Lines.currentFrame]) Lines.frames[Lines.currentFrame] = [];
					else if (!over) self.saveLines();

					/* add previous drawings 
						add another parameter for separating drawings? 
						i think that exists in reverse draw? */
					if (!follow) {
						for (let k = 0; k < i; k++) {
							Lines.frames[Lines.currentFrame].push({
								l: layerIndex,
								s: 0,
								e: Lines.drawings[drawingIndex].length,
							});
						}
					}
					
					Lines.frames[Lines.currentFrame].push({
						l: layerIndex,
						s: follow ? j : 0,
						e: Math.min(lines.length, j + segmentsPerFrame), /* maybe fix error */
					});

					if (over) Lines.interface.nextFrame();
				}

			}
			Lines.interface.updateFramesPanel();
		}
	};

	/* reverse of explode - shift-r - multi alt-r
		could be same function but then maybe my head would explode? 
		simultaneous draw multi drawings at one  (multi) */
	this.reverse = function(simultaneous) {
		self.saveLines();
		const segmentsPerFrame = +prompt("Enter number of segments per frame:");
		if (segmentsPerFrame > 0) {
			const layers = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			const totalSegments = Lines.frames[Lines.currentFrame]
									.map(f => { return Lines.layers[f.l].e} )
									.reduce((x,y) => { return x + y });
			for (let i = 0; i < totalSegments; i += segmentsPerFrame) {
				let indexMod = 0; // where to start 
				Lines.interface.nextFrame();
				if (!Lines.frames[Lines.currentFrame]) Lines.frames[Lines.currentFrame] = [];
				let framesAdded = false;
				for (let j = 0; j < layers.length; j++) {
					const layerIndex = layers[j].l;
					const drawingIndex = Lines.layers[layerIndex].d;
					const lines = Lines.drawings[drawingIndex];
					const drawingEnd = Lines.layers[layerIndex].e;
					const drawingStart = Lines.layers[layerIndex].s;
					if (i <= drawingEnd + (simultaneous ? 0 : indexMod) ) {
						Lines.frames[Lines.currentFrame].push({
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
			Lines.interface.updateFramesPanel();
		}
	};

	/* q key - all drawings in current frames, moved in each other frame
		in v2, x y for frame layers */
	this.offsetDrawing = function(offset) {
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			self.saveState();
			if (!offset.x && !offset.y) {
				const x = +prompt("x");
				const y = +prompt("y");
				offset = new Cool.Vector(x,y);
			}
			if (offset) {
				// checking to see if layers are selected 

				const layers = Lines.drawingInterface.layers.length > 0 ? Lines.drawingInterface.layers : Lines.frames[Lines.currentFrame];
				// toggled - come back after layer panel is fixed .... 

				for (let i = 0; i < layers.length; i++) {
					const layer = layers[i];
					const layerIndex = layer.l; // is the layer layer[i] or Lines.layers[layer.l]
					layer.x = Lines.layers[layerIndex].x + offset.x;
					layer.y = Lines.layers[layerIndex].y + offset.y;
				}
				
			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	};

	/* shift q - prob should be default? */
	this.offsetAll = function(offset) {
		for (let i = 0; i < Lines.frames.length; i++) {
			if (Lines.frames[i]) {
				self.saveLines();
				self.saveState();
				if (!offset.x && !offset.y) {
					const x = +prompt("x");
					const y = +prompt("y");
					offset = new Cool.Vector(x,y);
				}
				if (offset) {
					for (let j = 0; j < Lines.frames[i].length; j++) {
						const layer = Lines.frames[i][j];
						const layerIndex = layer.l;
						if (layer) {
							layer.x = Lines.layers[layerIndex].x + offset.x;
							layer.y = Lines.layers[layerIndex].y + offset.y;
						}
					}
				}
			} else {
				console.log("%c No layers in frame ", "color:yellow; background:black;");
			}
		}
	};

	/* interfaces */
	/* should interfaces be spread throughout? 
		should data be broken into multiple modules?
		explode and reverse could be transformations? 
		removing, adding, changing frames 
		offset and canvas size */
	const editPanel = new Panel("data-menu", "Edit");
	const explodePanel = new Panel("explode-menu", "Explode");

	/* explode */
	explodePanel.add(new UIButton({
		title: "Explode",
		callback: function() {
			self.explode(false, false);
		},
		key: "a"
	}));
	
	/* explode over */
	explodePanel.add(new UIButton({
		title: "Explode Over",
		callback: function() {
			self.explode(false, true);
		},
		key: "shift-a"
	}));

	/* follow */
	explodePanel.add(new UIButton({
		title: "Follow",
		callback: function() {
			self.explode(true, false);
		},
		key: "ctrl-a"
	}));

	/* follow over */
	explodePanel.add(new UIButton({
		title: "Follow Over",
		callback: function() {
			self.explode(true, true);
		},
		key: "alt-a"
	}));

	/* reverse draw */
	explodePanel.add(new UIButton({
		title: "Reverse Draw",
		callback: function() {
			self.reverse(false);
		},
		key: "shift-r"
	}));

	/* reverse multi  */
	explodePanel.add(new UIButton({
		title: "Reverse Multi",
		callback: function() {
			self.reverse(true);
		},
		key: "alt-r"
	}));

	/* copy */
	editPanel.add(new UIButton({
		title: "Copy",
		callback: self.copyFrames,
		key: "c"
	}));

	/* delete frame */
	editPanel.add(new UIButton({
		title: "Delete Frame",
		callback: self.deleteFrame,
		key: "d"
	}));

	/* delete frame range */
	editPanel.add(new UIButton({
		title: "Delete Frame Range",
		callback: self.deleteFrameRange,
		key: "shift-d"
	}));

	/* duplicate will be unnecessary when frames/drawings are fixed */
	editPanel.add(new UIButton({
		title: "Duplicate",
		callback: self.duplicate,
		key: "g"
	}));

	/* insert before */
	editPanel.add(new UIButton({
		title: "Insert Before",
		callback: self.insertFrameBefore,
		key: "i"
	}));

	/* insert after */
	editPanel.add(new UIButton({
		title: "Insert After ",
		callback: self.insertFrameAfter,
		key: "shift-i"
	}) );

	/* multi copies */
	editPanel.add( new UIButton({
		title: "Multi Copies",
		callback: self.addMultipleCopies,
		key: "m"
	}));

	/* offset */
	editPanel.add(new UIButton({
		title: "Offset",
		callback: self.offsetDrawing,
		key: "q"
	}));

	editPanel.add(new UIButton({
		title: "Offset All",
		callback: self.offsetAll,
		key: "shift-q"
	}));

	/* save lines */
	editPanel.add(new UIButton({
		title: "Save Lines",
		key:"r",
		callback: self.saveLines
	}));

	/* clear frame */
	editPanel.add(new UIButton({
		title: "Clear Frame",
		key:"x",
		callback: self.clearFrame
	}));

	/* paste frames */
	editPanel.add(new UIButton({
		title: "Paste Frames",
		key: "v",
		callback: self.pasteFrames
	}));

	/* select all frames */
	editPanel.add(new UIButton({
		title: "Select All Frames",
		key: "shift-v",
		callback: function() {
			Lines.interface.frameElems.looper((elem) => {
				self.addFrameToCopy(elem);
			});
		}
	}));

	/* select frame range */
	editPanel.add(new UIButton({
		title: "Select Frame Range",
		key: "alt-v",
		callback: function() {
			const start = prompt("Start frame:");
			const end = prompt("end frame:");
			Lines.interface.frameElems.looper((elem) => {
				self.addFrameToCopy(elem);
			}, start, end);
		}
	}));

	/* clear selected frames  */
	editPanel.add(new UIButton({
		title: "Clear Frames to Copy",
		key: "ctrl-v",
		callback: self.clearFramesToCopy
	}));

	/* cut last layer */
	editPanel.add(new UIButton({
		title: "Cut Last Layer",
		key: "shift-x",
		callback: self.cutLastDrawing
	}));

	/* cut first layer */
	editPanel.add(new UIButton({
		title: "Cut First Layer",
		key: "ctrl-x",
		callback: self.cutFirstDrawing
	}));

	/* cut line segment */
	editPanel.add(new UIButton({
		title: "Cut Line",
		key: "z",
		callback: self.cutLastSegment
	}));

	/* cut range of segments */
	editPanel.add(new UIButton({
		title: "Cut Segment Num",
		key: "shift-z",
		callback: self.cutLastSegmentNum
	}));

	/* undo */
	editPanel.add(new UIButton({
		title: "Undo",
		key: "ctrl-z",
		callback: self.undo
	}));
}