function Render(fps) {
	const self = this;

	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fps = fps || 10; // frames per second when playing
	this.lps = 10; // lines per second all the time

	this.interval = 1000/this.lps;  // fps per one second, the line interval
	this.timer = performance.now();
	this.intervalRatio = +(self.interval / (1000 / self.fps)).toFixed(4);  // this starts same as lineInterval, written out to show math

	this.onionSkinNum = 0;
	this.onionSkinIsVisible = false;

	/* l key */
	this.setOnionSkin = function(n) {
		self.onionSkinNum = +n;
		self.onionSkinIsVisible = true;
	};

	/* shift l */
	this.toggleOnion = function() {
		self.onionSkinIsVisible = !self.onionSkinIsVisible;
		/* set onion back? */
	};

	/* ; key */
	this.setFps = function(fps) {
		self.fps = +fps;
		self.intervalRatio = self.interval / (1000 / self.fps);
	};

	/* ' key */
	this.setLps = function(lps) {
		self.lps = +lps;
		self.interval = 1000 / self.lps;
		self.intervalRatio = self.interval / (1000 / self.fps);
	};

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		lns.currentFrame = self.currentFrameCounter = 0;
		self.isPlaying = false;
		lns.canvas.ctx.miterLimit = 1;
		lns.ui.updateInterface();
	};

	/* toggle play animation */
	this.toggle = function() {
		if (!self.isPlaying) {
			lns.ui.beforeFrame();
			lns.ui.afterFrame();
		}
		self.isPlaying = !self.isPlaying;
	};

	/* f key */
	this.setFrame = function(f) {
		if (+f >= 0) lns.currentFrame = self.currentFrameCounter = +f;
	};

	this.draw = function(time) {
		if (performance.now() > self.interval + self.timer || time == 'cap') {
			self.timer = performance.now();

			if (self.isPlaying) {
				if (self.currentFrameCounter < lns.numFrames) {
					self.currentFrameCounter += self.intervalRatio;
					/* fix for js float imprecision ... effects anims with 1.999 etc */
					lns.currentFrame = Math.floor(self.currentFrameCounter.toFixed(4));
				} 
				if (self.currentFrameCounter.toFixed(4) >= lns.numFrames) {
					lns.currentFrame = self.currentFrameCounter = 0;
					if (self.videoLoops > 1) {
						self.videoLoops--;
					} else if (self.capturingVideo) {
						lns.canvas.videoCapture();
						self.isPlaying = false;
						self.capturingVideo = false;
					}
				}
				lns.ui.updateInterface(); /* ui thing */
			}

			lns.canvas.ctx.clearRect(0, 0, lns.canvas.width, lns.canvas.height);
			

			if (self.videoCapture || (self.captureWithBackground && self.captureFrames > 0)) {
				lns.canvas.ctx.rect(0, 0, lns.canvas.width, lns.canvas.height);
				lns.canvas.ctx.fillStyle = lns.bgColor.color;
				lns.canvas.ctx.fill();
			}

			lns.bgImage.display();

			/* draws onionskin this is first so its under main lines */
			if (self.onionSkinNum > 0 && self.onionSkinIsVisible) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const index = Math.max(0, lns.currentFrame - o);
					const color = `rgba(105,150,255,${ 1.5 - (o / self.onionSkinNum) })`;
					for (let i = 0; i < lns.layers.length; i++) {
						const layer = lns.layers[i];
						if (layer.isInFrame(index)) {
								self.drawLines({
								lines: lns.drawings[layer.d],
								...layer,
								...layer.getProps(lns.currentFrame),
								color: color,
								onion: true
							});
						}
					}
				}
			}

			/* draws saved frames */
			for (let i = 0; i < lns.layers.length; i++) {
				const layer = lns.layers[i];
				if (layer.isInFrame(lns.currentFrame)) {
					self.drawLines({
						lines: lns.drawings[layer.d],
						...layer,
						...layer.getProps(lns.currentFrame),
						onion: false
					});
				}
			}

			/* draws current lines */
			if (lns.lines.length > 0) {
				self.drawLines({
					lines: lns.lines,
					s: 0,
					e: lns.lines.length,
					n: lns.draw.n,
					r: lns.draw.r,
					w: lns.draw.w,
					v: lns.draw.v,
					x: 0,
					y: 0,
					onion: false,
					color: lns.lineColor.color
				});
			}

			/* capture frames */
			if (self.captureFrames > 0) {
				lns.canvas.capture();
				self.captureFrames--;
				self.capturing = true;
			} else if (self.capturing) {
				self.capturing = false;
				
			}
			
		}
		if (!self.capturing) window.requestAnimFrame(self.draw);
	};

	/* jig = jiggle amount, seg = num segments */
	this.drawLines = function(params) {
		// console.log('draw', lns.canvas.ctx.lineWidth);
		/* mixed color?  - assume always mixed? - care about performance? */
		lns.canvas.ctx.beginPath();

		const off = {
			x: Cool.random(0, params.w),
			xSpeed: Cool.random(-params.v, params.v),
			y: Cool.random(0, params.w),
			ySpeed: Cool.random(-params.v, params.v)
		}; /* trying offsetting more of drawing */
		for (let i = params.s; i < params.e - 1; i++) {
			if (params.lines[i] != "end") {
				const s = params.lines[i];
				const e = params.lines[i + 1];
				let v = new Cool.Vector(e.x, e.y);
				v.subtract(s);
				v.divide(params.n);
				lns.canvas.ctx.moveTo(
					params.x + s.x + Cool.random(-params.r, params.r) + off.x,
					params.y + s.y + Cool.random(-params.r, params.r) + off.y
				);
				for (let j = 0; j < params.n; j++) {
					const p = new Cool.Vector(s.x + v.x * j, s.y + v.y * j);  /* midpoint(s) of segment */
					lns.canvas.ctx.lineTo(
						params.x + p.x + v.x + Cool.random(-params.r, params.r) + off.x,
						params.y + p.y + v.y + Cool.random(-params.r, params.r) + off.y
					);
				}
				if (params.color) lns.canvas.ctx.strokeStyle = params.color;
				else if (lns.canvas.ctx.strokeStyle != params.c)
					lns.canvas.setStrokeColor(params.c);
			}

			off.x += off.xSpeed;
			if (off.x >= params.w || off.x <= -params.w) off.xSpeed *= -1;

			off.y += off.ySpeed;
			if (off.y >= params.w || off.y <= -params.w) off.ySpeed *= -1;
		}
		lns.canvas.ctx.stroke();
	};

	this.captureFrames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.captureWithBackground = true; /* default capture bg */
	this.capturing = false;

	/* k key */
	this.captureOne = function() {
		self.captureFrames = 1;
	};

	/* shift k */
	this.captureMultiple = function() {
		self.captureFrames = prompt("Capture how many frames?");
	};

	/* n key */
	this.toggleBGCapture = function() {
		self.captureWithBackground = !self.captureWithBackground;
	};

	/* ctrl-k - start at beginning and capture one of every frame */
	this.captureCycle = function() {
		lns.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		lns.currentFrame = self.currentFrameCounter =  lns.frames.length;
		self.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		self.captureFrames = lns.numFrames * Math.max(1, self.lps / self.fps);
	};

	/*  */
	this.capturingVideo = false;
	this.videoLoops = 0;
	this.captureVideo = function() {
		self.isPlaying = false;
		self.videoLoops = +prompt("Number of loops?");
		self.setFrame(0);
		
		self.capturingVideo = true;
		lns.canvas.videoCapture();
		self.isPlaying = true;
	};

	/* starts drawing  */
	this.start = function() {
		window.requestAnimFrame(self.draw);
	}
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
