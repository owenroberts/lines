function Data() {
	const self = this;

	this.framesCopy = []; // copied frame(s)
	this.framesToCopy = []; // selected frames to copy

	this.addFrameToCopy = function(elem) {
		if (!elem.classList.contains("copy")){
 			elem.classList.add("copy");
 			self.framesToCopy.push( Number(elem.dataset.index) );
 		}
	};

	/* r key - save lines and add new lines */
	this.saveLines = function() {
		if (Lines.lines.length > 0) {
			
			if (Lines.frames[Lines.currentFrame] == undefined) 
				Lines.frames[Lines.currentFrame] = [];

			/* add drawing ref to frames data */
			Lines.frames[Lines.currentFrame].push({
				d:Lines.drawings.length, 
				i:0, 
				e:Lines.lines.length
			});
			
			/* add current lines to drawing data */
			Lines.drawings.push({
				l: Lines.lines,
				c: Lines.color.color,
				n: Lines.drawEvents.segNumRange,
				r: Lines.drawEvents.jiggleRange
			});

			/* add current color to color choices */
			Lines.color.addColorBtn(Lines.color.color);

			/* lines are saved, stop drawing? */
			Lines.lines = [];

			/* ignoring save states 
			or maybe figuring it out.... 
			should be module anyway */

			// kinda dump way to update the frame interface
			Lines.interface.nextFrame();
			Lines.interface.prevFrame();
		}
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
				/* clone all of the drawings in current frame */
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					self.framesCopy.push(_.cloneDeep(Lines.frames[Lines.currentFrame][i]));
				}
			}
		}
	};

	/* v key */
	this.pasteFrames = function() {
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
				for (let i = 0; i < self.framesCopy.length; i++) {
					Lines.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (Lines.frames[Lines.currentFrame] == undefined) {
				if (Lines.lines.length > 0) self.saveLines();
				else Lines.frames[Lines.currentFrame] = [];
				for (let i = 0; i < self.framesCopy.length; i++) {
					Lines.frames[Lines.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			} else {
				for (let i = 0; i <  self.framesCopy.length; i++) {
					Lines.frames[Lines.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
		}
	};

	/* g key - duplicate drawing to change offset, color, etc. */
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
		
		// if (self.frames[Lines.currentFrame]) {
			// for (let i = 0; i < self.frames[Lines.currentFrame].length; i++) {
				/* can't splice drawings until we figure out indexing 
					actually don't want to do this in case drawing is on other frame
					delete drawings in file i/o already happening i think */
			// }
		// }
		
		if (Lines.frames[Lines.currentFrame])
			Lines.frames[Lines.currentFrame] = undefined;
		Lines.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		/* when updated drawing indexes, delete unused drawings here? (have to not be used anywhere) */
		const ftemp = Lines.currentFrame;
		if (Lines.currentFrame > 0 || Lines.frames.length > 1) {
			Lines.interface.prevFrame();
			Lines.frames.splice(ftemp, 1);
		} else {
			Lines.lines = [];
		}
		Lines.interface.updateFramesPanel();
	};

	/* z key */
	this.cutLastSegment = function() {
		if (Lines.lines.length > 0) Lines.lines.pop();
	};

	/* alt z */
	this.cutLastSegmentNum = function() {
		let num = prompt("How many segments?");
		while (Lines.lines.length > 0 && num > 0) {
			Lines.lines.pop();
			num--;
		}
	};

	/* shift z (does this make more sense as x... ) */
	this.cutLastDrawing = function() {
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].pop(); // pop last drawing
		}
	};

	/* ctrl z (does this make more sense as x... ) */
	this.cutFirstDrawing = function() {
		if (Lines.frames[Lines.currentFrame]) {
			self.saveLines();
			Lines.frames[Lines.currentFrame].shift(); // pop last drawing
		}
	};

	/* ctrl z - unimplemented save states */
	this.undo = function() {
		/*if (saveStates.length > 1) {
			saveStates.pop();
			frames = _.cloneDeep(saveStates[saveStates.length - 1].f);
			drawings = _.cloneDeep(saveStates[saveStates.length - 1].d);
		}*/
		/* almost working now but need to figure out frame updates, need interface for this too */
		// updateFramesPanel();
		//cutting already drawn line?? maybe later
		//else if (frames[currentFrame].length > 0) frames[currentFrame].pop();
	};

	/* i key */
	this.insertFrame = function() {
		self.saveLines();
		Lines.frames.insert(Lines.currentFrame, []);
		Lines.interface.updateFramesPanel();
	};

	/* m key - should work with one copy, can imagine issues 
		will copy all drawings in frame, use insert */
	this.addMultipleCopies = function() {
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
	/* a: explode, shift a: follow, ctrl a: explode over, alt a: follow over */
	/* over states get fucked up with two drawings, need to figure
		out after adding drawing nums to frames in v2 */
	this.explode = function(follow, over) {
		self.saveLines();
		const segmentsPerFrame = Number(prompt("Enter number of segments per frame: "));
		if (segmentsPerFrame > 0) {
			const tempFrames = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			// Lines.frames.splice(Lines.currentFrame, 1);
			for (let h = tempFrames.length - 1; h >= 0; h--) {
				const tempLines = Lines.drawings[tempFrames[h].d];
				if (over) {
					for (let i = 0; i < tempLines.l.length - 1; i += segmentsPerFrame) {
						if (!Lines.frames[Lines.currentFrame]) 
							Lines.frames[Lines.currentFrame] = [];
						else self.saveLines();
						Lines.frames[Lines.currentFrame].push({
							d: tempFrames[h].d,
							i: follow ? i : 0,
							e: i + segmentsPerFrame
						});
						Lines.interface.nextFrame();
					}
				} else {
					for (let i = tempLines.l.length - 1 - segmentsPerFrame; i >= 0; i -= segmentsPerFrame) {
						self.insertFrame();
						if (!Lines.frames[Lines.currentFrame]) 
							Lines.frames[Lines.currentFrame] = [];
						if (!follow) {
							for (let j = 0; j < h; j++) {
								Lines.frames[Lines.currentFrame].push(tempFrames[j]);
							}
						}
						Lines.frames[Lines.currentFrame].push({
							d: tempFrames[h].d,
							i: follow ? i : 0,
							e: i + segmentsPerFrame
						});
					}
				}
			}
			Lines.interface.updateFramesPanel();
		}
	};

	this.reverse = function(simultaneous) {
		self.saveLines();
		const segmentsPerFrame = Number(prompt("Enter number of segments per frame: "));
		if (segmentsPerFrame > 0) {
			const tempFrames = _.cloneDeep(Lines.frames[Lines.currentFrame]);
			const totalSegments = Lines.frames[Lines.currentFrame]
									.map((f) => { return f.e} )
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
	}

	/* q key */
	this.offsetDrawing = function(offset) {
		self.saveLines();
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

	/* f key */
	this.fitCanvasToDrawing = function() {
		self.saveLines();
		
		let tolerance = 0;
		let minx = 10000;
		let maxx = 0;
		let miny = 10000;
		let maxy = 0;

		for (let i = 0; i < Lines.drawings.length; i++) {
			if (Lines.drawings[i] != "x"){
				for (let j = 0; j < Lines.drawings[i].l.length; j++) {
					if (Lines.drawings[i].l[j].e && Lines.drawings[i].l[j].s) {

						tolerance = Math.max( tolerance, Lines.drawings[i].r * 4 );

						minx = Math.min( minx, Lines.drawings[i].l[j].e.x );
						miny = Math.min( miny, Lines.drawings[i].l[j].e.y );
						minx = Math.min( minx, Lines.drawings[i].l[j].s.x );
						miny = Math.min( miny, Lines.drawings[i].l[j].s.y );

						maxx = Math.max( maxx, Lines.drawings[i].l[j].e.x );
						maxy = Math.max( maxy, Lines.drawings[i].l[j].e.y );
						maxx = Math.max( maxx, Lines.drawings[i].l[j].s.x );
						maxy = Math.max( maxy, Lines.drawings[i].l[j].s.y );

					}	
				}
			}
		}

		Lines.canvas.setWidth((maxx - minx) + tolerance * 2);
		Lines.canvas.setHeight((maxy - miny) + tolerance * 2);

		for (let i = 0; i < Lines.drawings.length; i++) {
			if (Lines.drawings[i] != "x"){
				for (var j = 0; j < Lines.drawings[i].l.length; j++) {
					if (Lines.drawings[i].l[j].e && Lines.drawings[i].l[j].s) {
						Lines.drawings[i].l[j].e.x -= minx - tolerance;
						Lines.drawings[i].l[j].e.y -= miny - tolerance;
						Lines.drawings[i].l[j].s.x -= minx - tolerance;
						Lines.drawings[i].l[j].s.y -= miny - tolerance;
					}	
				}
			}
		}
	};


	/* interfaces */
	const panel = new Panel("data", "Data");
	Lines.interface.panels["data"] = panel;

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

	panel.addRow();
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

	panel.addRow();
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

	panel.addRow();
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

	panel.addRow();
	panel.add( new UIButton({
		title: "Fit Canvas to Drawing",
		callback: self.fitCanvasToDrawing,
		key: "f"
	}) );

	panel.addRow();
	/* duplicate with be unnecessary when frames/drawings are fixed */
	panel.add( new UIButton({
		title: "Duplicate",
		callback: self.duplicate,
		key: "g"
	}) );

	panel.add( new UIButton({
		title: "Insert",
		callback: self.insertFrame,
		key: "i"
	}) );

	panel.addRow();
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

	panel.addRow();
	panel.add( new UIButton({
		title: "Save Lines",
		key:"r",
		callback: self.saveLines
	}))


	panel.add( new UIButton({
		title: "Clear Frame",
		key:"x",
		callback: self.clearFrame
	}) );

	panel.addRow();
	panel.add( new UIButton({
		title: "Paste Frames",
		key: "v",
		callback: self.pasteFrames
	}) );

	panel.addRow();
	panel.add( new UIButton({
		title: "Select All Frames",
		key: "shift-v",
		callback: function() {
			Lines.interface.frameElems.looper((elem) => {
				self.addFrameToCopy(elem);
			});
		}
	}) );

	panel.addRow();
	panel.add( new UIButton({
		title: "Clear Frames to Copy",
		key: "ctrl-v",
		callback: self.clearFramesToCopy
	}) );

	panel.addRow();
	panel.add( new UIButton({
		title: "Cut Last Drawing",
		key: "shift-z",
		callback: self.cutLastDrawing
	}) );

	panel.add( new UIButton({
		title: "Cut First Drawing",
		key: "ctrl-z",
		callback: self.cutFirstDrawing
	}) );

	panel.addRow();
	panel.add( new UIButton({
		title: "Cut Line",
		key: "z",
		callback: self.cutLastSegment
	}) );

	panel.add( new UIButton({
		title: "Cut Segment Num",
		key: "alt-z",
		callback: self.cutLastSegmentNum
	}) );

	/* leave out until/if undo is actually implemented */
	// panel.addRow();
	// panel.add( new UIButton({
	// 	title: "Undo",
	// 	key: "ctrl-z",
	// 	callback: self.undo
	// }) );
}