function Draw() {
	const self = this;

	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fps = 10; // frames per second when playing
	this.lps = 10; // lines per second all the time
	
	this.interval = 1000/this.lps;  // fps per one second, the line interval
	this.timer = performance.now(); 
	this.intervalRatio = this.interval / (1000 / this.fps);  // this starts same as lineInterval, written out to show math

	this.onionSkinIsVisible = true;

	this.captureFrames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.captureWithBackground = false;
	this.capturing = false;

	this.setFps = function(fps) {
		self.fps = fps;
		self.intervalRatio = self.interval / (1000 / self.fps);
	};

	this.setLps = function(lps) {
		self.lps = lps;
		self.interval = 1000 / self.lps;
		self.intervalRatio = self.interval / (1000 / self.fps);
	};

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

	this.draw = function(time) {
		if (performance.now() > self.interval + self.timer || time == 'cap') {
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
			if (self.onionSkinNum > 0 && self.onionSkinIsVisible) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const frameNumber = Lines.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / self.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < Lines.frames[frameNumber].length; i++) {
							const fr = Lines.frames[frameNumber][i];
							const dr = Lines.drawings[fr.d];
							self.drawLines({
								lines: dr, 
								start: fr.s, 
								end: fr.e, 
								segNum: fr.n, 
								jig: fr.r,
								wig: fr.w,
								wigSpeed: fr.v,
								x: fr.x, 
								y: fr.y, 
								color: color,
								onion: true
							});
						}
					}
				}
			}

			/* draws saved frames */
			if (Lines.frames[Lines.currentFrame]) {
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					const fr = Lines.frames[Lines.currentFrame][i];
					const dr = Lines.drawings[fr.d];
					self.drawLines({
						lines: dr, 
						start: fr.s, 
						end: fr.e, 
						segNum: fr.n, 
						jig: fr.r,
						wig: fr.w,
						wigSpeed: fr.v,
						x: fr.x, 
						y: fr.y, 
						color: fr.c,
						onion: false
					});
				}
			}

			/* draws current lines */
			if (Lines.lines.length > 0) {
				self.drawLines({
					lines: Lines.lines, 
					start: 0, 
					end: Lines.lines.length, 
					segNum: Lines.drawEvents.segNumRange, 
					jig: Lines.drawEvents.jiggleRange, 
					wig: Lines.drawEvents.wiggleRange, 
					wigSpeed: Lines.drawEvents.wiggleSpeed, 
					x: 0, 
					y: 0,
					onion: false, 
					color: Lines.lineColor.color
				});
			}

			/* capture frames */
			if (self.captureFrames > 0) {
				Lines.canvas.capture();
				self.captureFrames--;
				self.capturing = true;
			} else if (self.capturing) {
				self.capturing = false;
			}
		}
		if (!self.capturing)
			window.requestAnimFrame(self.draw);
	}

	/* jig = jiggle amount, seg = num segments */
	this.drawLines = function(params) {
		/* mixed color?  - assume always mixed? - care about performance? */
		Lines.canvas.ctx.beginPath();

		const off = {
			x: Cool.random(0, params.wig),
			xSpeed: Cool.random(-params.wigSpeed, params.wigSpeed),
			y: Cool.random(0, params.wig),
			ySpeed: Cool.random(-params.wigSpeed, params.wigSpeed)
		}; /* trying offsetting more of drawing */

		for (let h = params.start; h < params.end - 1; h++) {
			if (params.lines[h] != "end") {
				const s = params.lines[h];
				const e = params.lines[h + 1];
				if (!e)
					console.log(e, h + 1, params.end - 1, params.lines);
				let v = new Cool.Vector(e.x, e.y);
				v.subtract(s);
				v.divide(params.segNum);
				Lines.canvas.ctx.moveTo(
					params.x + s.x + Cool.random(-params.jig, params.jig) + off.x, 
					params.y + s.y + Cool.random(-params.jig, params.jig) + off.y
				);
				for (let i = 0; i < params.segNum; i++) {
					/* midpoint(s) of segment */
					const p = new Cool.Vector(s.x + v.x * i, s.y + v.y * i); 
					Lines.canvas.ctx.lineTo( 
						params.x + p.x + v.x + Cool.random(-params.jig, params.jig) + off.x, 
						params.y + p.y + v.y + Cool.random(-params.jig, params.jig) + off.y 
					);
				}
				if (params.onion)
					Lines.canvas.ctx.strokeStyle = params.color;
				else if (Lines.canvas.ctx.strokeStyle != "#" + params.color)
					Lines.canvas.setStrokeColor(params.color);
			}
			
			
			off.x += off.xSpeed;
			if (off.x >= params.wig || off.x <= -params.wig)
				off.xSpeed *= -1;

			off.y += off.ySpeed;
			if (off.y >= params.wig || off.y <= -params.wig)
				off.ySpeed *= -1;

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
}

/*
	json data key
	frame
	lines: drawing at frame index
	start: fr.s, 
	end: fr.e, 
	segNum: fr.n, 
	jig: fr.r,
	wig: fr.w,
	wigSpeed: fr.v
	x: fr.x, 
	y: fr.y, 
	color: fr.c
*/