function Data(app) {
	const self = this;

	this.frames = [];
	this.framesCopy = []; // not sure? this probably doesn't need to be global ....
	this.framesToCopy = [];
	this.lines = []; // lines currently being drawn
	this.drawings = []; // saved drawings

	/* r key - save lines and add new lines 
	 also used a lot for other things */
	this.saveLines = function() {
		if (this.lines.length > 0) {
			
			if (this.frames[app.draw.currentFrame] == undefined) 
				this.frames[app.draw.currentFrame] = [];

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
				n: app.mouse.segNumRange,
				r: app.mouse.jiggleRange
			});

			/* add current color to color choices 
			 is color.current better than color.color? */
			app.color.addColorBtn(app.color.color);

			/* lines are saved, stop drawing? */
			this.lines = [];

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
				if (self.frames[app.draw.currentFrame] == undefined) self.frames[app.draw.currentFrame] = [];
				for (let h = 0; h < self.frames[self.framesToCopy[i]].length; h++) {
					self.frames[app.draw.currentFrame].push(self.frames[self.framesToCopy[i]][h]);
				}
				self.saveLines();
				app.interface.nextFrame();
			}
		} else {
			/* copy current frame */
			if (self.lines.length > 0) self.saveLines();
			if (self.frames[app.draw.currentFrame]) {
				self.framesCopy = [];
				/* clone all of the drawings in current frame */
				for (let i = 0; i < self.frames[app.draw.currentFrame].length; i++) {
					self.framesCopy.push(_.cloneDeep(self.frames[app.draw.currentFrame][i]));
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
		/* copy one frame onto multiple */
		if (self.framesToCopy.length > 0) {
			for (var h = 0; h < self.framesToCopy.length; h++) {
				for (var i = 0; i < self.framesCopy.length; i++) {
					self.frames[self.framesToCopy[h]].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
			self.clearFramesToCopy();
		} else {
			if (self.frames[app.draw.currentFrame] == undefined) {
				if (self.lines.length > 0) self.saveLines();
				else self.frames[app.draw.currentFrame] = [];
				for (let i = 0; i < self.framesCopy.length; i++) {
					self.frames[app.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			} else {
				/* took out addToFrame here, not really necessary? */
				for (var i = 0; i <  self.framesCopy.length; i++) {
					self.frames[app.draw.currentFrame].push( _.cloneDeep(self.framesCopy[i]) );
				}
			}
		}
	};

	/* x key */
	this.clearFrame = function() {
		if (self.frames[app.draw.currentFrame]) {
			for (let i = 0; i < self.frames[app.draw.currentFrame].length; i++) {
				/* can't splice drawings until we figure out indexing 
					actually don't want to do this in case drawing is on other frame
					delete drawings in file i/o already happening i think */
				// self.drawings[self.frames[app.draw.currentFrame][i].d] = "x"; // fuck this stupid x
			}
		}
		
		if (self.frames[app.draw.currentFrame])
			self.frames[app.draw.currentFrame] = undefined;
		self.lines = [];
	};

	/* d key */
	this.deleteFrame = function() {
		/* also here, should drawings (not used elsewhere) be deleted? */
		const ftemp = app.draw.currentFrame;
		if (app.draw.currentFrame > 0) app.interface.prevFrame();
		if (self.frames[ftemp] && self.frames.length > 0) self.frames.splice(ftemp, 1);
		else if (self.frame[ftemp]) self.clearFrame();
		else self.lines = [];
		app.interface.updateFramesPanel();
	};

	


	/* z key */
	this.cutLastSegment = function() {
		/* should text this for these functions */
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
		// updateFramesPanel();
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

	/* animate a drawing segment by segment (or multiple) 
		follow means they don't accumulate to form drawing at the end
		over means go over/add to subsequent frames
		no key command - t y u p j l n available */
	/* a: explode, shift a: follow */
	this.explode = function(follow, over) {
		console.log(follow, over);
		if (self.frames[app.draw.currentFrame] == undefined) self.saveLines();
		const segmentsPerFrame = Number(prompt("Enter number of segments per frame: "));
		if (segmentsPerFrame > 0) {
			const tempFrames = _.cloneDeep(self.frames[app.draw.currentFrame]);
			self.frames.splice(app.draw.currentFrame, 1);
			for (let h = tempFrames.length - 1; h >= 0; h--) {
				const tempLines = self.drawings[tempFrames[h].d];
				if (over) {
					for (let i = 0; i < tempLines.l.length - 1; i += segmentsPerFrame) {
						if (!self.frames[app.draw.currentFrame]) self.frames[app.draw.currentFrame] = [];
						else self.saveLines();
						self.frames[app.draw.currentFrame].push({
							d: tempFrames[h].d,
							i: follow ? i : 0,
							e: i + segmentsPerFrame
						});
						app.draw.currentFrame++;
					}
				} else {
					for (let i = tempLines.l.length - 1 - segmentsPerFrame; i >= 0; i -= segmentsPerFrame) {
						self.insertFrame();
						if (!self.frames[app.draw.currentFrame]) self.frames[app.draw.currentFrame] = [];
						if (!follow) {
							for (let j = 0; j < h; j++) {
								self.frames[app.draw.currentFrame].push(tempFrames[j]);
							}
						}
						self.frames[app.draw.currentFrame].push({
							d: tempFrames[h].d,
							i: follow ? i : 0,
							e: i + segmentsPerFrame
						});
					}
				}
			}
			app.interface.updateFramesPanel();
		}
	};

	/* q key */
	this.offsetDrawing = function(offset) {
		if (!self.frames[app.draw.currentFrame]) self.saveLines();
		if (!offset) {
			const x = Number(prompt("x"));
			const y = Number(prompt("y"));
			offset = new Vector(x,y);
		}
		if (offset) {
			for (let i = 0; i < self.frames[app.draw.currentFrame].length; i++) {
				const d = self.drawings[self.frames[app.draw.currentFrame][i].d];
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

		app.canvas.setWidth((maxx - minx) + tolerance * 2);
		app.canvas.setHeight((maxy - miny) + tolerance * 2);

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

	/* s key */
	this.saveFramesToFile = function(single) {
		self.saveLines();
		const json = {};
		/* this one second end is kind of specific, maybe to bc?? */
		const end = frames.length * ( 1000 / Number(fps) );
		if (end > 1000) Math.ceil( json.end = end + 1000 );
		else json.end = 1000;
		json.w = app.canvas.width;
		json.h = app.canvas.height;
		json.fps = Number( app.draw.fps );
		json.f = [];
		json.d = [];
		let drawingsIndexes = [];

		/* save current frame */  
		/* this didn't work start here next */
		if (single) {
			json.f.push( self.frames[app.draw.currentFrame] );
			for (let j = 0; j < self.frames[app.draw.currentFrame].length; j++) {
				if ( drawingsIndexes.indexOf(self.frames[app.draw.currentFrame][j].d) == -1 ) 
					drawingsIndexes.push( self.frames[app.draw.currentFrame][j].d );
			}
		} else {
			/* save fall frames */
			json.f = self.frames;
			for (let i = 0; i < self.frames.length; i++) {
				for (let j = 0; j < self.frames[i].length; j++) {
					if ( drawingsIndexes.indexOf(self.frames[i][j].d) == -1 ) 
						drawingsIndexes.push( self.frames[i][j].d );
				}
			}
		}
		for (let i = 0; i < self.drawings.length; i++) {
			if ( drawingsIndexes.indexOf(i) != -1 ) 
				json.d.push( self.drawings[i] );
			else json.d.push( 'x' ); // this shouldn't really be necessary if this is written right
		}
		const jsonfile = JSON.stringify(json);
		let filename = app.interface.title.value;

		if (!filename) {
			filename = prompt("Name this file:");
			app.interface.title.value =  filename;
		}
		if (filename) {
			const blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
	};

	/* o key */
	this.loadFramesFromFile = function() {
		
		const filename = prompt("Open file:");
		app.interface.setTitle(filename.split("/").pop());
		$.getJSON(filename + ".json", function(data) {
			self.frames =  data.f;
			self.drawings = data.d;
			for (let i = 0; i < self.drawings.length; i++) {
				if (self.drawings[i] != 'x') app.color.addColorBtn( self.drawings[i].c );
			}
			app.canvas.setWidth(data.w);
			app.canvas.setHeight(data.h);
			app.draw.setFps(data.fps);
			app.draw.reset();
		}).error(function(error) {
	        console.error("Loading error:", error.statusText, error);
	    });
	};


	if (window.File && window.FileReader && window.FileList && window.Blob) {
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
	}

	window.addEventListener("beforeunload", function(ev) {
		ev.returnValue = 'Did you save dumbhole?';
	});
}