function Data() {
	const self = this;

	this.frames = [];
	this.lines = []; // lines currently being drawn
	this.drawings = []; // saved drawings

	this.framesCopy = []; // not sure? this probably doesn't need to be global ....
	this.framesToCopy = [];

	/* r key - save lines and add new lines */
	this.saveLines = function() {
		if (self.lines.length > 0) {
			
			if (self.frames[Lines.draw.currentFrame] == undefined) 
				self.frames[Lines.draw.currentFrame] = [];

			/* add drawing ref to frames data */
			self.frames[Lines.draw.currentFrame].push({
				d:self.drawings.length, 
				i:0, 
				e:self.lines.length
			});
			
			/* add current lines to drawing data */
			self.drawings.push({
				l: self.lines,
				c: Lines.color.color,
				n: Lines.mouse.segNumRange,
				r: Lines.mouse.jiggleRange
			});

			/* add current color to color choices */
			Lines.color.addColorBtn(Lines.color.color);

			/* lines are saved, stop drawing? */
			self.lines = [];

			/* ignoring save states 
			or maybe figuring it out.... 
			should be module anyway */
		}
	};
	
	/* c key  */
	this.copyFrames = function() {
		/* if copy frames selected ... */
		/* this seems to automatically add these frames to end which is not ideal
			should be when plus frame is selected 
			selecting frames to copy vs paste should be different states */
		if (self.framesToCopy.length > 0) {
			for (let i = 0; i < self.framesToCopy.length; i++) {
				if (self.frames[Lines.draw.currentFrame] == undefined) self.frames[Lines.draw.currentFrame] = [];
				for (let h = 0; h < self.frames[self.framesToCopy[i]].length; h++) {
					self.frames[Lines.draw.currentFrame].push(self.frames[self.framesToCopy[i]][h]);
				}
				self.saveLines();
				Lines.interface.nextFrame();
			}
		} else {
			/* copy current frame */
			if (self.lines.length > 0) self.saveLines();
			if (self.frames[Lines.draw.currentFrame]) {
				self.framesCopy = [];
				/* clone all of the drawings in current frame */
				for (let i = 0; i < self.frames[Lines.draw.currentFrame].length; i++) {
					self.framesCopy.push(_.cloneDeep(self.frames[Lines.draw.currentFrame][i]));
				}
			}
		}
	};

	/* g key - duplicate drawing to change offset, color, etc. */
	this.duplicate = function() {
		if (self.lines.length > 0) self.saveLines();
		if (self.frames[Lines.draw.currentFrame]) {
			self.framesCopy = [];
			const drawingIndexOffset = self.drawings.length - 1;
			for (let i = 0; i < self.frames[Lines.draw.currentFrame].length; i++) {
				self.drawings.push( _.cloneDeep(self.drawings[self.frames[Lines.draw.currentFrame][i].d]) );
				self.framesCopy.push({
					d: self.drawings.length - 1,
					i: self.frames[Lines.draw.currentFrame][i].i,
					e: self.frames[Lines.draw.currentFrame][i].e
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

	/* v key */
	this.pasteFrames = function() {
		/* copy one frame onto multiple */
		if (self.framesToCopy.length > 0) {
			for (let h = 0; h < self.framesToCopy.length; h++) {
				for (let i = 0; i < self.framesCopy.length; i++) {
					self.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (self.frames[Lines.draw.currentFrame] == undefined) {
				if (self.lines.length > 0) self.saveLines();
				else self.frames[Lines.draw.currentFrame] = [];
				for (let i = 0; i < self.framesCopy.length; i++) {
					self.frames[Lines.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			} else {
				for (let i = 0; i <  self.framesCopy.length; i++) {
					self.frames[Lines.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
		}
	};

	/* x key */
	this.clearFrame = function() {
		
		// if (self.frames[Lines.draw.currentFrame]) {
			// for (let i = 0; i < self.frames[Lines.draw.currentFrame].length; i++) {
				/* can't splice drawings until we figure out indexing 
					actually don't want to do this in case drawing is on other frame
					delete drawings in file i/o already happening i think */
			// }
		// }
		
		if (self.frames[Lines.draw.currentFrame])
			self.frames[Lines.draw.currentFrame] = undefined;
		self.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		/* when updated drawing indexes, delete unused drawings here? (have to not be used anywhere) */
		const ftemp = Lines.draw.currentFrame;
		if (Lines.draw.currentFrame > 0) {
			Lines.interface.prevFrame();
			self.frames.splice(ftemp, 1);
		} else 
			self.lines = [];
		Lines.interface.updateFramesPanel();
	};

	/* z key */
	this.cutLastSegment = function() {
		if (self.lines.length > 0) self.lines.pop();
	};

	/* alt z */
	this.cutLastSegmentNum = function() {
		let num = prompt("How many segments?");
		while (self.lines.length > 0 && num > 0) {
			self.lines.pop();
			num--;
		}
	};

	/* shift z (does this make more sense as x... ) */
	this.cutLastDrawing = function() {
		if (self.frames[Lines.draw.currentFrame]) {
			self.saveLines();
			self.frames[Lines.draw.currentFrame].pop(); // pop last drawing
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
		self.frames.insert(Lines.draw.currentFrame, []);
		Lines.interface.updateFramesPanel();
	};

	/* m key - should work with one copy, can imagine issues */
	this.addMultipleCopies = function() {
		self.framesCopy = [];
		self.clearFramesToCopy();
		let n = prompt("Number of copies: ");
		if (Number(n)) {
			for (let i = 0; i < n; i++) {
				self.copyFrames();
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
			const tempFrames = _.cloneDeep(self.frames[Lines.draw.currentFrame]);
			// self.frames.splice(Lines.draw.currentFrame, 1);
			for (let h = tempFrames.length - 1; h >= 0; h--) {
				const tempLines = self.drawings[tempFrames[h].d];
				if (over) {
					for (let i = 0; i < tempLines.l.length - 1; i += segmentsPerFrame) {
						if (!self.frames[Lines.draw.currentFrame]) self.frames[Lines.draw.currentFrame] = [];
						else self.saveLines();
						self.frames[Lines.draw.currentFrame].push({
							d: tempFrames[h].d,
							i: follow ? i : 0,
							e: i + segmentsPerFrame
						});
						Lines.draw.currentFrame++;
					}
				} else {
					for (let i = tempLines.l.length - 1 - segmentsPerFrame; i >= 0; i -= segmentsPerFrame) {
						self.insertFrame();
						if (!self.frames[Lines.draw.currentFrame]) self.frames[Lines.draw.currentFrame] = [];
						if (!follow) {
							for (let j = 0; j < h; j++) {
								self.frames[Lines.draw.currentFrame].push(tempFrames[j]);
							}
						}
						self.frames[Lines.draw.currentFrame].push({
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

	/* q key */
	this.offsetDrawing = function(offset) {
		self.saveLines();
		if (!offset.x && !offset.y) {
			const x = Number(prompt("x"));
			const y = Number(prompt("y"));
			offset = new Cool.Vector(x,y);
		}
		if (offset) {
			for (let i = 0; i < self.frames[Lines.draw.currentFrame].length; i++) {
				const d = self.drawings[self.frames[Lines.draw.currentFrame][i].d];
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

		for (let i = 0; i < self.drawings.length; i++) {
			if (self.drawings[i] != "x"){
				for (let j = 0; j < self.drawings[i].l.length; j++) {
					if (self.drawings[i].l[j].e && self.drawings[i].l[j].s) {

						tolerance = Math.max( tolerance, self.drawings[i].r * 4 );

						minx = Math.min( minx, self.drawings[i].l[j].e.x );
						miny = Math.min( miny, self.drawings[i].l[j].e.y );
						minx = Math.min( minx, self.drawings[i].l[j].s.x );
						miny = Math.min( miny, self.drawings[i].l[j].s.y );

						maxx = Math.max( maxx, self.drawings[i].l[j].e.x );
						maxy = Math.max( maxy, self.drawings[i].l[j].e.y );
						maxx = Math.max( maxx, self.drawings[i].l[j].s.x );
						maxy = Math.max( maxy, self.drawings[i].l[j].s.y );

					}	
				}
			}
		}

		Lines.canvas.setWidth((maxx - minx) + tolerance * 2);
		Lines.canvas.setHeight((maxy - miny) + tolerance * 2);

		for (let i = 0; i < self.drawings.length; i++) {
			if (self.drawings[i] != "x"){
				for (var j = 0; j < self.drawings[i].l.length; j++) {
					if (self.drawings[i].l[j].e && self.drawings[i].l[j].s) {
						self.drawings[i].l[j].e.x -= minx - tolerance;
						self.drawings[i].l[j].e.y -= miny - tolerance;
						self.drawings[i].l[j].s.x -= minx - tolerance;
						self.drawings[i].l[j].s.y -= miny - tolerance;
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