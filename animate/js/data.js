function Data() {
	const self = this;

	this.framesCopy = []; // copied frame(s)
	this.framesToCopy = []; // selected frames to copy

	this.saveStates = {
		current: {
			drawings: undefined,
			frames: undefined
		},
		prev: {
			drawings: undefined,
			frames: undefined
		}
	};

	/* right click drag or shift v 
		add frame num to the list of frames to copy */
	this.addFrameToCopy = function(elem) {
		if (!elem.classList.contains("copy")){
 			elem.classList.add("copy");
 			self.framesToCopy.push( Number(elem.dataset.index) );
 		}
	};

	/* r key - save lines and add new lines */
	this.saveLines = function() {
		if (Lines.lines.length > 0) {
			
			/* save current lines in new frame */
			if (Lines.frames[Lines.currentFrame] == undefined) 
				Lines.frames[Lines.currentFrame] = [];

			/* add drawing ref to frames data */
			const totalSegments = Lines.lines
				.map((line) => { return line.length })
				.reduce((total, len) => { return total + len });
			
			Lines.frames[Lines.currentFrame].push({
				d: Lines.drawings.length, 
				s: 0, 
				e: totalSegments
			});
			
			/* add current lines to drawing data */
			Lines.drawings.push({
				l: Lines.lines,
				c: Lines.lineColor.color,
				n: Lines.drawEvents.segNumRange,
				r: Lines.drawEvents.jiggleRange
			});

			/* add current color to color choices */
			Lines.lineColor.addColorBtn(Lines.lineColor.color);

			/* lines are saved, stop drawing? */
			Lines.lines = [];

			/* update interface */
			Lines.interface.updateFramesPanel();
		}
		/* save current state - one undo currently*/
		self.saveState();
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
			if (Lines.lines.length > 0) 
				self.saveLines();
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
			if (Lines.frames[Lines.currentFrame] == undefined) {
				if (Lines.lines.length > 0) self.saveLines();
				else Lines.frames[Lines.currentFrame] = [];
			}
			for (let i = 0; i <  self.framesCopy[0].length; i++) {
				Lines.frames[Lines.currentFrame].push( _.cloneDeep(self.framesCopy[0][i]) );
			}
		}
	};

	/* g key - duplicate drawing to change offset, color, etc. 
		should be deprecated for v 2 */
	this.duplicate = function() {
		if (Lines.lines.length > 0) self.saveLines();
		if (Lines.frames[Lines.currentFrame]) {
			self.framesCopy = [];
			const drawingIndexOffset = Lines.drawings.length - 1;
			for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
				Lines.drawings.push( 
					_.cloneDeep(Lines.drawings[Lines.frames[Lines.currentFrame][i].d]) 
				);
				self.framesCopy.push({
					d: Lines.drawings.length - 1,
					i: Lines.frames[Lines.currentFrame][i].i,
					e: Lines.frames[Lines.currentFrame][i].e
				});
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
			Lines.frames[Lines.currentFrame] = undefined;
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
		if (startFrame > 0) {
			Lines.currentFrame = startFrame - 1;
		} else {
			Lines.currentFrame = 0;
		}
		Lines.frames.splice(startFrame, endFrame - startFrame + 1);
		Lines.interface.updateFramesPanel();
	};

	/* z key */
	this.cutLastSegment = function() {
		if (Lines.lines.length > 0) 
			Lines.lines.pop();
	};

	/* shift z */
	this.cutLastSegmentNum = function() {
		let num = prompt("How many segments?");
		while (Lines.lines.length > 0 && num > 0) {
			Lines.lines.pop();
			num--;
		}
	};

	/* shift x  */
	this.cutLastDrawing = function() {
		self.saveState();
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].pop(); // pop last drawing
		}
	};

	/* ctrl x  */
	this.cutFirstDrawing = function() {
		self.saveState();
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].shift(); // pop last drawing
		}
	};

	/* save current state of frames and drawing - one undo */
	this.saveState = function() {
		if (self.saveStates.current.drawings) {
			self.saveStates.prev.drawings = _.cloneDeep(self.saveStates.current.drawings);
			self.saveStates.prev.frames = _.cloneDeep(self.saveStates.current.frames);
		} else {
			self.saveStates.prev.drawings = _.cloneDeep(Lines.drawings);
			self.saveStates.prev.frames = _.cloneDeep(Lines.frames);
		}

		self.saveStates.current.drawings = _.cloneDeep(Lines.drawings);
		self.saveStates.current.frames = _.cloneDeep(Lines.frames);
	};

	/* ctrl z - unimplemented save states 
		currently only works in some cases: after removing an drawing
		actually super buggy */
	this.undo = function() {
		if (self.saveStates.prev.drawings) {
			Lines.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			Lines.frames = _.cloneDeep(self.saveStates.prev.frames);

			self.saveStates.current.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			self.saveStates.current.frames = _.cloneDeep(self.saveStates.prev.frames);

			self.saveStates.prev.drawings = undefined;
			self.saveStates.prev.frames = undefined;
			
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
		Lines.interface.updateFramesPanel();
	};

	/* m key - copies all drawings in frame and pastes in multiple frames after
		either into current frame or makes new one	 */
	this.addMultipleCopies = function() {
		/* can't save state, saves multiple times */
		self.framesCopy = [];
		self.clearFramesToCopy();
		let n = prompt("Number of copies: ");
		self.copyFrames();
		if (Number(n)) {
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
		const segmentsPerFrame = Number(prompt("Enter number of segments per frame: "));
		if (segmentsPerFrame > 0) {
			const tempFrames = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			for (let h = tempFrames.length - 1; h >= 0; h--) {
				const tempLines = Lines.drawings[tempFrames[h].d].l;
				let drawnSegments = 0;
				for (let j = 0; j < tempLines.length; j++) {
					const line = tempLines[j];
					let index = Math.max(0, drawnSegments - line.length);
					let ending = Math.min(tempFrames[h].e - drawnSegments, line.length);
					for (let i = index; i < ending; i += segmentsPerFrame) {
						if (!over) {
							self.insertFrameAfter();
							Lines.interface.nextFrame();
						}
						
						if (!Lines.frames[Lines.currentFrame]) 
							Lines.frames[Lines.currentFrame] = [];
						else if (!over) 
							self.saveLines();

						Lines.frames[Lines.currentFrame].push({
							d: tempFrames[h].d,
							s: follow ? i + drawnSegments : 0,
							e: drawnSegments + i + segmentsPerFrame
						});

						if (over)
							Lines.interface.nextFrame();
					}
					drawnSegments += line.length;
				}
			}
			Lines.interface.updateFramesPanel();
		}
	};

	/* reverse of explode - no key 
		could be same function but then maybe my head would explode? 
		simultaneous draw multi drawings at one  (multi) */
	this.reverse = function(simultaneous) {
		self.saveLines();
		const segmentsPerFrame = Number(prompt("Enter number of segments per frame: "));
		if (segmentsPerFrame > 0) {
			const tempFrames = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			const totalSegments = Lines.frames[Lines.currentFrame]
									.map((f) => { return f.e } )
									.reduce((x,y) => { return x + y });
			for (let i = 0; i < totalSegments; i += segmentsPerFrame) {
				let indexMod = 0;
				Lines.interface.nextFrame();
				if (!Lines.frames[Lines.currentFrame]) 
					Lines.frames[Lines.currentFrame] = [];
				let framesAdded = false;
				for (let j = 0; j < tempFrames.length; j++) {
					const drawingIndex = tempFrames[j].d;
					const drawingEnd = tempFrames[j].e;
					const drawingStart = tempFrames[j].i;
					const tempLines = Lines.drawings[drawingIndex].l;
					if (i <= drawingEnd + (simultaneous ? 0 : indexMod)) {
						Lines.frames[Lines.currentFrame].push({
							d: drawingIndex,
							i: simultaneous ? i : i - indexMod,
							e: drawingEnd
						});
						framesAdded = true;
					}
					indexMod += drawingEnd;
				}
				if (!framesAdded)
					self.deleteFrame();
			}
			Lines.interface.updateFramesPanel();
		}
	};

	/* q key - all drawings in current frames, moved in each other frame
		in v2, x y for frame layers */
	this.offsetDrawing = function(offset) {
		self.saveLines();
		self.saveState();
		if (!offset.x && !offset.y) {
			const x = Number(prompt("x"));
			const y = Number(prompt("y"));
			offset = new Cool.Vector(x,y);
		}
		if (offset) {
			for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
				const d = Lines.drawings[Lines.frames[Lines.currentFrame][i].d];
				if (d != "x"){
					for (let j = 0; j < d.l.length; j++) {
						if (d.l[j].e && d.l[j].s) {
							d.l[j].e.y += offset.y;
							d.l[j].s.y += offset.y;
							d.l[j].e.x += offset.x;
							d.l[j].s.x += offset.x;
						}	
					}
				}
			}
		}
	};

	/* interfaces */
	/* should interfaces be spread throughout? 
		should data be broken into multiple modules?
		explode and reverse could be transformations? 
		removing, adding, changing frames 
		offset and canvas size */
	const panel = new Panel("data", "Data");

	panel.add( new UIButton({
		title: "Explode",
		callback: function() {
			self.explode(false, false);
		},
		key: "a"
	}) );
	
	panel.add( new UIButton({
		title: "Explode Over",
		callback: function() {
			self.explode(false, true);
		},
		key: "shift-a"
	}) );

	panel.add( new UIButton({
		title: "Follow",
		callback: function() {
			self.explode(true, false);
		},
		key: "ctrl-a"
	}) );

	panel.add( new UIButton({
		title: "Follow Over",
		callback: function() {
			self.explode(true, true);
		},
		key: "alt-a"
	}) );

	panel.add( new UIButton({
		title: "Reverse Draw",
		callback: function() {
			self.reverse(false);
		}
	}) );

	panel.add( new UIButton({
		title: "Reverse Multi",
		callback: function() {
			self.reverse(true);
		}
	}) );

	panel.add( new UIButton({
		title: "Copy",
		callback: self.copyFrames,
		key: "c"
	}) );

	panel.add( new UIButton({
		title: "Delete Frame",
		callback: self.deleteFrame,
		key: "d"
	}));

	panel.add( new UIButton({
		title: "Delete Frame Range",
		callback: self.deleteFrameRange,
		key: "shift-d"
	}));

	/* duplicate will be unnecessary when frames/drawings are fixed */
	panel.add( new UIButton({
		title: "Duplicate",
		callback: self.duplicate,
		key: "g"
	}) );

	panel.add( new UIButton({
		title: "Insert Before",
		callback: self.insertFrameBefore,
		key: "i"
	}) );

	panel.add( new UIButton({
		title: "Insert After",
		callback: self.insertFrameAfter,
		key: "shift-i"
	}) );

	panel.add( new UIButton({
		title: "Multi Copies",
		callback: self.addMultipleCopies,
		key: "m"
	}) );

	panel.add( new UIButton({
		title: "Offset",
		callback: self.offsetDrawing,
		key: "q"
	}) );

	panel.add( new UIButton({
		title: "Save Lines",
		key:"r",
		callback: self.saveLines
	}));

	panel.add( new UIButton({
		title: "Clear Frame",
		key:"x",
		callback: self.clearFrame
	}));

	panel.add( new UIButton({
		title: "Paste Frames",
		key: "v",
		callback: self.pasteFrames
	}));

	panel.add( new UIButton({
		title: "Select All Frames",
		key: "shift-v",
		callback: function() {
			Lines.interface.frameElems.looper((elem) => {
				self.addFrameToCopy(elem);
			});
		}
	}));

	panel.add( new UIButton({
		title: "Select Some Frames",
		key: "alt-v",
		callback: function() {
			const start = prompt("Start frame:");
			const end = prompt("end frame:");
			Lines.interface.frameElems.looper((elem) => {
				self.addFrameToCopy(elem);
			}, start, end);
		}
	}));

	panel.add( new UIButton({
		title: "Clear Frames to Copy",
		key: "ctrl-v",
		callback: self.clearFramesToCopy
	}) );

	panel.add( new UIButton({
		title: "Cut Last Drawing",
		key: "shift-x",
		callback: self.cutLastDrawing
	}) );

	panel.add( new UIButton({
		title: "Cut First Drawing",
		key: "ctrl-x",
		callback: self.cutFirstDrawing
	}) );

	panel.add( new UIButton({
		title: "Cut Line",
		key: "z",
		callback: self.cutLastSegment
	}) );

	panel.add( new UIButton({
		title: "Cut Segment Num",
		key: "shift-z",
		callback: self.cutLastSegmentNum
	}) );

	panel.add( new UIButton({
		title: "Undo",
		key: "ctrl-z",
		callback: self.undo
	}) );
}