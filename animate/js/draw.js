/*

dr.l is an array of all the lines in the drawing
dr.l[0].s is vector for start of line
dr.l[0].e is vector for beinning of line
fr.d is drawing index
fr.i is start index for lines of drawing
fr.e is end index of lines of drawing
dr.n is segment number
dr.r is randomness of wiggle
dr.c is color of all lines in drawing

this.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
*/

function Draw() {
	const self = this;

	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fps = 10; // frames per second when playing
	this.lps = 10; // lines per second all the time
	
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

	this.draw = function() {
		if (performance.now() > self.interval + self.timer) {
			self.timer = performance.now();
			/* calc current frame to draw */
			if (self.isPlaying && self.currentFrameCounter < Lines.frames.length) {
				self.currentFrameCounter += self.intervalRatio;
				Lines.currentFrame = Math.floor(self.currentFrameCounter);
			}
			if (self.isPlaying && self.currentFrameCounter >= Lines.frames.length) {
				Lines.currentFrame = self.currentFrameCounter = 0;
			}

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
			if (self.onionSkinNum > 0 && self.onionSkinOn) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const frameNumber = Lines.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / self.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < Lines.frames[frameNumber].length; i++) {
							const fr = Lines.frames[frameNumber][i];
							const dr = Lines.drawings[fr.d];
							self.drawLines(dr, fr.s, fr.e, fr.n, fr.r, fr.x, fr.y, color, true);
						}
					}
				}
			}

			/* draws saved frames */
			if (Lines.frames[Lines.currentFrame]) {
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					const fr = Lines.frames[Lines.currentFrame][i];
					const dr = Lines.drawings[fr.d];
					self.drawLines(dr, fr.s, fr.e, fr.n, fr.r, fr.x, fr.y, fr.c);
				}
			}

			/* draws current lines */
			if (Lines.lines.length > 0) {
				self.drawLines(Lines.lines, 0, Lines.lines.length, Lines.drawEvents.segNumRange, Lines.drawEvents.jiggleRange, 0, 0, Lines.lineColor.color);
			}

			/* capture frames */
			if (self.captureFrames > 0) {
				Lines.canvas.capture();
				self.captureFrames--;
			}
		}
		window.requestAnimFrame(self.draw);
	}

	/* jig = jiggle amount, seg = num segments */
	this.drawLines = function(lines, start, end, seg, jig, x, y, color, onion) {
		/* mixed color?  - assume always mixed? - care about performance? */
		Lines.canvas.ctx.beginPath();
		for (let h = start; h < end - 1; h++) {
			if (lines[h] != "end") {
				const s = lines[h];
				const e = lines[h + 1];
				let v = new Cool.Vector(e.x, e.y);
				v.subtract(s);
				v.divide(seg);
				Lines.canvas.ctx.moveTo(
					x + s.x + Cool.random(-jig, jig), 
					y + s.y + Cool.random(-jig, jig)
				);
				for (let i = 0; i < seg; i++) {
					/* midpoint(s) of segment */
					const p = new Cool.Vector(s.x + v.x * i, s.y + v.y * i); 
					Lines.canvas.ctx.lineTo( 
						x + p.x + v.x + Cool.random(-jig, jig), 
						y + p.y + v.y + Cool.random(-jig, jig) 
					);
				}
				if (onion) 
					Lines.canvas.ctx.strokeStyle = color;
				else if (Lines.canvas.ctx.strokeStyle != "#" + color)
					Lines.canvas.setStrokeColor(color);
			}
		}
		Lines.canvas.ctx.stroke();
	};

	/* ctrl-k - start at beginning and capture one of every frame */
	this.captureCycle = function() {
		Lines.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		Lines.currentFrame = self.currentFrameCounter =  Lines.frames.length; 
		self.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame 
		self.captureFrames = Lines.frames.length * Math.max(1, self.lps / self.fps);
	}
	
	/* starts drawing  */
	this.start = function() {
		window.requestAnimFrame(self.draw);
	}

	/* add background image module */
	this.background = new Background();

	/* interfaces */
	const panel = new Panel("drawmenu", "Draw");

	panel.add(new UIToggleButton({
		id:"play", 
		callback: self.toggle, 
		key: "space", 
		on: "Play", 
		off: "Pause"
	}));

	this.frameNumDisplay = new UIDisplay({
		id:"frame", 
		label:"Frame: ", 
		initial:"0"
	});
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

	/* l key - onion skin num */
	panel.add( new UISelect({
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
				this.setValue(self.onionSkinNum);
			}
		},
		key: "l"
	}));

	this.onionSkinOn = true;
	panel.add( new UIToggleButton({
		on: "Hide Onion",
		off: "Show Onion",
		callback: function() {
			self.onionSkinOn = !self.onionSkinOn;
		},
		key: "shift-l"
	}));

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
	panel.add( new UISelect({
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
				this.setValue(self.lps);
			}
			self.interval = 1000/self.lps;
			self.intervalRatio = self.interval / (1000/self.fps);
		},
		key: "'"
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

	/* capture frames with no functions */
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
		callback: function() {
			self.captureFrames = prompt("Capture how many frames?");
		},
		key: "shift-k"
	}) );
}