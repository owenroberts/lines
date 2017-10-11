function Data(app) {
	const self = this;

	this.frames = [];
	this.frameCopy = []; // not sure? this probably doesn't need to be global ....
	this.framesToCopy = [];
	this.lines = []; // lines currently being drawn
	this.drawings = []; // saved drawings

	this.saveLines = function() {
		if ((this.frames[app.draw.currentFrame] == undefined || app.drawingEvents.addToFrame) && this.lines.length > 0) {
			if (this.frames[app.draw.currentFrame] == undefined) this.frames[app.draw.currentFrame] = [];

			/* add drawing ref to frames data */
			this.frames[app.draw.currentFrame].push({
				d:this.drawings.length, 
				i:0, 
				e:this.lines.length
			});
			
			/* add current lines to drawing data */
			this.drawings.push({
				l: this.lines,
				c: app.color.color,
				n: app.drawingEvents.segNumRange,
				r: app.drawingEvents.jiggleRange
			});
			app.color.addColorBtn(app.color.color);

			if (app.drawingEvents.addToFrame) {
				app.drawingEvents.addToFrame = false;
			}
			this.lines = [];

			/* ignoring save states 
			or maybe figuring it out.... 
			should be module anyway */

		}
	};
	
	/* c key  */
	this.copyFrames = function() {
		/* if copy frames selected ... */
		if (self.framesToCopy.length > 0) {
			for (let i = 0; i < self.framesToCopy.length; i++) {
				if (self.frames[app.draw.currentFrame] == undefined) self.frames[app.draw.currentFrame] = [];
				for (let h = 0; h < self.frames[self.copyFrames[i]].length; h++) {
					self.frames[app.draw.currentFrame].push(self.frames[self.framesToCopy[i]][h]);
				}
				self.saveLines();
				app.interface.nextFrame();
			}
		} else {
			/* copy current frame */
			if (self.lines.length > 0) saveLines();
			if (self.frames[app.draw.currentFrame]) {
				self.frameCopy = [];
				for (let i = 0; i < self.frames[app.draw.currentFrame].length; i++) {
					self.frameCopy.push(_.cloneDeep(frames[currentFrame][i]));
				}
			}
		}
	};

	/* g key - duplicate drawing to change offset, color, etc. */
	this.duplicate = function() {
		if (self.lines.length > 0) self.saveLines();
		if (self.frames[app.draw.currentFrame]) {
			self.framesCopy = [];
			const drawingIndexOffset = self.drawings.length - 1;
			for (let i = 0; i < self.frames[app.draw.currentFrame].length; i++) {
				self.drawings.push( _.cloneDeep(self.drawings[self.frames[app.draw.currentFrame][i].d]) );
				self.framesCopy.push({
					d: self.drawings.length - 1,
					i: self.frames[app.draw.currentFrame][i].i,
					e: self.frames[app.draw.currentFrame][i].e
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
		if (self.framesToCopy.length > 0) {
			for (var h = 0; h < self.framesToCopy.length; h++) {
				for (var i = 0; i < self.framesCopy.length; i++) {
					self.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (self.frames[app.draw.currentFrame] == undefined) {
				if (self.lines.length > 0) saveLines();
				else self.frames[app.draw.currentFrame] = [];
				for (let i = 0; i < self.framesCopy.length; i++) {
					self.frames[app.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			} else if (app.drawingEvents.addToFrame) {
				for (var i = 0; i < copy.length; i++) {
					self.frames[app.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
				app.drawingEvents.addToFrame = false;
			}
		}
	};

	/* x key */
	this.clearFrame = function() {
		if (self.frames[app.draw.currentFrame])
			self.frames[app.draw.currentFrame] = undefined;
		self.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		const ftemp = app.draw.currentFrame;
		if (app.draw.currentFrame > 0) app.interface.prevFrame();
		if (self.frames[ftemp] && self.frames.length > 0) self.frames.splice(ftemp, 1);
		else if (self.frame[ftemp]) self.clearFrame();
		else self.lines = [];
		app.interface.updateFramesPanel();
	};

	/* r key */
	this.addToFrame = function() {
		self.saveLines();
		if (self.frames[app.draw.currentFrame]) 
			app.drawingEvents.addToFrame = true;
	};

	/* z key */
	this.cutLastSegment = function() {
		if (self.lines.length > 0) self.lines.pop();
	};

	/* shift z (does this make more sense as x... ) */
	this.cutLastDrawing = function() {
		if (self.frames[app.draw.currentFrame]) {
			self.saveLines();
			self.frames[app.draw.currentFrame].pop(); // pop last drawing
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
		// updateFrames();
		//cutting already drawn line?? maybe later
		//else if (frames[currentFrame].length > 0) frames[currentFrame].pop();
	};

	/* i key */
	this.insertFrame = function() {
		self.saveLines();
		self.frames.insert(app.draw.currentFrame, []);
		app.interface.updateFramesPanel();
	};

	/* m key - should work with one copy, can imagine issues */
	this.addMultipleCopies = function() {
		self.framesCopy = [];
		self.clearFramesToCopy();
		let n = prompt("Number of copies: ");
		if (Number(n)) {
			for (let i = 0; i < n; i++) {
				self.copyFrames();
				app.interface.nextFrame();
				self.pasteFrames();
			}
		}
	};

	
}