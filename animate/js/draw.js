/*

dr.l is an array of all the lines in the drawing
dr.l[0].s is vector for start of line
dr.l[0].e is vector for beinning of line
fr.d is drawing index
fr.i is start index for lines of drawing
fr.e is end index of lines of drawing
dr.n is segment n
dr.r is randomness of wiggle
dr.c is color of all lines in drawing

this.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
*/

function Draw() {
	const self = this;

	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fps = 10; // not coming from html because there is no HTML, where to set?
	this.lps = 10; // same, 10 is default but maybe should be 15
	
	this.interval = 1000/this.lps;  // fps per one second, the line interval
	this.timer = performance.now(); 
	this.intervalRatio = this.interval / (1000/this.fps);  // this starts same as lineInterval, written out to show math

	this.captureFrames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.captureWithBackground = false;

	this.setFps = function(fps) {
		self.fps = fps;
		self.intervalRatio = self.interval / (1000/fps);
		self.fpsSelect.setValue(fps);
	}

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		Lines.currentFrame = self.currentFrameCounter = 0;
		self.isPlaying = false;
		Lines.canvas.ctx.miterLimit = 1;
		Lines.interface.updateFramesPanel();
	}

	/* toggle play animation */
	this.toggle = function() {
		if (!self.isPlaying) Lines.data.saveLines();
		self.isPlaying = !self.isPlaying;
		Lines.interface.updateFrameNum();
	}

	this.drawLines = function(lns, index, end, segNum, jiggle, color, onion) {
		Lines.canvas.ctx.beginPath();
		for (let h = index; h < end; h++) {
			const line = lns[h];
			if (line && line.e) {
				let v = new Cool.Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(segNum);
				Lines.canvas.ctx.moveTo( line.s.x + Cool.random(-jiggle, jiggle), line.s.y + Cool.random(-jiggle, jiggle) );
				for (var i = 0; i < segNum; i++) {
					const p = new Cool.Vector(line.s.x + v.x * i, line.s.y + v.y * i); /* midpoint of segment */
					Lines.canvas.ctx.lineTo( p.x + v.x + Cool.random(-jiggle, jiggle), p.y + v.y + Cool.random(-jiggle, jiggle) );
				}
				if (onion) 
					Lines.canvas.ctx.strokeStyle = color;
				else if (Lines.canvas.ctx.strokeStyle != "#" + color)
					Lines.canvas.setStrokeColor(color);
			}
		}	
		Lines.canvas.ctx.stroke();			
	};

	this.draw = function() {
		if (performance.now() > self.interval + self.timer) {
			self.timer = performance.now();
			if (self.isPlaying && self.currentFrameCounter < Lines.frames.length) {
				self.currentFrameCounter += self.intervalRatio;
				Lines.currentFrame = Math.floor(self.currentFrameCounter);
			}
			if (self.isPlaying && self.currentFrameCounter >= Lines.frames.length) {
				Lines.currentFrame = self.currentFrameCounter = 0;
			}

			// console.log(Lines.currentFrame, self.currentFrameCounter);

			/* update the anim frame number */
			if (self.isPlaying) 
				Lines.interface.updateFrameNum();

			Lines.canvas.ctx.clearRect(0, 0, Lines.canvas.width, Lines.canvas.height);
			
			if (self.captureWithBackground && self.captureFrames > 0) {
				Lines.canvas.ctx.rect(0, 0, Lines.canvas.width, Lines.canvas.height);
				Lines.canvas.ctx.fillStyle = '#' + Lines.canvas.bgColor.color;
				Lines.canvas.ctx.fill();
			}

			if (self.background.img.src && self.background.show)
				Lines.canvas.ctx.drawImage(self.background.img, self.background.x, self.background.y, self.background.size, self.background.size/self.background.ratio);

			/* draws onionskin this is first so its under main lines */
			if (self.onionSkinNum > 0) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const frameNumber = Lines.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / self.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < Lines.frames[frameNumber].length; i++) {
							const fr = Lines.frames[frameNumber][i];
							const dr = Lines.drawings[fr.d];
							self.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, color, true);
						}
					}
				}
			}

			/* draws saved frames */
			if (Lines.frames[Lines.currentFrame]) {
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					const fr = Lines.frames[Lines.currentFrame][i];
					const dr = Lines.drawings[fr.d];
					self.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}

			/* draws current lines */
			if (Lines.lines.length > 0) {
				self.drawLines(Lines.lines, 0, Lines.lines.length, Lines.drawEvents.segNumRange, Lines.drawEvents.jiggleRange, Lines.lineColor.color);
			}

			/* capture frames */
			if (self.captureFrames > 0) {
				Lines.canvas.capture();
				self.captureFrames--;
			}
		}
		window.requestAnimFrame(self.draw);
	}

	this.captureMultiple = function() {
		self.captureFrames = prompt("Capture how many frames?");
	}

	this.captureCycle = function() {
		Lines.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		Lines.currentFrame = self.currentFrameCounter =  Lines.frames.length; 
		self.isPlaying = true;
		self.captureFrames = Lines.frames.length;
	}
	
	/* starts drawing, is this necessary ? */
	this.start = function() {
		window.requestAnimFrame(self.draw);
	}

	/* interfaces */
	const panel = new Panel("drawmenu", "Draw");

	panel.add( new UIToggleButton({
		id:"play", 
		callback: self.toggle, 
		key: "space", 
		on: "Play", 
		off: "Pause"
	}) );

	this.frameNumDisplay = new UIDisplay({id:"frame", label:"Frame: ", initial:"0"});
	panel.add(this.frameNumDisplay); 

	panel.add( new UIButton({
		title: "Prev Frame",
		callback: Lines.interface.prevFrame,
		key: "w"
	}) );
	panel.add( new UIButton({
		title: "Next Frame",
		callback: Lines.interface.nextFrame,
		key: "e"
	}) );

	this.onionSkinSelect = new UISelect({
		options: [0,1,2,3,4,5,6,7,8,9,10],
		selected: 0,
		label: "Onion Skin",
		callback: function(ev) {
			if (ev.type == "change") {
				self.onionSkinNum = Number(this.value);
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("How many onion skin frames?");
				self.onionSkinNum = Number(n);
				self.onionSkinSelect.setValue(self.onionSkinNum);
			}
		},
		key: "l"
	});
	panel.add(this.onionSkinSelect);

	this.fpsSelect = new UISelect({
		label: "FPS",
		options: [1,2,5,10,12,15,24,30,60],
		selected: 10,
		callback: function(ev) {
			if (ev.type == "change") {
				self.fps = Number(this.value);
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("FPS?");
				self.fps = Number(n);
				self.fpsSelect.setValue(self.fps);
			}
			self.intervalRatio = self.interval / (1000/self.fps);
		},
		key: ";"
	})
	panel.add(this.fpsSelect);

	/* don't use this for < v1 drawings... */
	this.lpsSelect = new UISelect({
		label: "Lines/Second",
		options: [1,2,5,10,12,15,24,30,60],
		selected: 10,
		callback: function(ev) {
			if (ev.type == "change") {
				self.lps = Number(this.value);
				this.blur();
			} else {
				const n = prompt("Lines per second?");
				self.lps = Number(n);
				self.lpsSelect.setValue(self.lps);
			}
			self.interval = 1000/self.lps;
			self.intervalRatio = self.interval / (1000/self.fps);
		},
		key: "'"
	});
	panel.add(this.lpsSelect);

	panel.add( new UIButton({
		title: "Capture Frame",
		callback: function() {
			self.captureFrames = 1;
		},
		key: "k"
	}) );

	panel.add( new UIToggleButton({
		on: "Click to Capture BG",
		off: "Click to Leave Transparent",
		callback: function() {
			self.captureWithBackground = !self.captureWithBackground
		},
		key: "n"
	}) );

	panel.add( new UIButton({
		title: "Capture Multiple Frames",
		callback: self.captureMultiple,
		key: "shift-k"
	}) );

	panel.add( new UIButton({
		title: "Capture Cycle",
		callback: self.captureCycle,
		key: "ctrl-k"
	}) );

	panel.add( new UIButton({
		title: "Go To Frame",
		callback: function() {
			const f = prompt("Frame:");
			Lines.currentFrame = f;
			Lines.interface.updateFramesPanel();
		},
		key: "f"
	}))

	this.background = new Background();
}