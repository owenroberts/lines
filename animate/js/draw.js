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

function Draw(app) {
	const self = this;
	this.background = new Background();

	/* can this be a module?  timeline? */
	this.currentFrame = 0;
	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fpsElem = document.getElementById("fps");
	this.fps = Number(this.fpsElem.value); // 10 is default but maybe should be 15, how many frames play per second, will skip frames if higher than lps
	this.lpsElem = document.getElementById("lps"); // lines per second, how often is draws
	this.lps = Number(this.lpsElem.value); // 10 is default but maybe should be 15
	this.interval = 1000/this.lps;  // fps per one second, the line interval
	this.timer = performance.now(); 
	this.intervalRatio = this.interval / (1000/this.fps);  // this starts same as lineInterval, written out to show math

	this.setFps = function(fps) {
		self.fps = self.fpsElem.value = fps;
		self.intervalRatio = self.interval / (1000/fps);

	}

	this.fpsElem.addEventListener("change", function() {
		self.fps = Number(this.value);
		self.intervalRatio = self.interval / (1000/self.fps);
		this.blur();
	});

	/* don't use this for < v1 drawings... */
	this.lpsElem.addEventListener("change", function() {
		self.lps = Number(this.value);
		self.interval = 1000/self.lps;
		self.intervalRatio = self.interval / (1000/self.fps);
		this.blur();
	});

	this.onionSkinElem = document.getElementById("onion-skin");
	this.onionSkinNum = Number(this.onionSkinElem.value); // number of onion skin frames
	this.onionSkinElem.addEventListener("change", function() {
	//	console.log(self.onionSkinNum, )
		self.onionSkinNum = Number(this.value);
		this.blur();
	});

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		self.currentFrame = self.currentFrameCounter = 0;
		self.isPlaying = false;
		app.canvas.ctx.miterLimit = 1;
		app.interface.updateFramesPanel();
	}

	this.toggle = function() {
		if (!this.isPlaying) app.data.saveLines();
		this.isPlaying = !this.isPlaying;
		app.interface.updateFrameNum();
	}

	this.drawLines = function(lns, index, end, segNum, jiggle, color, onion) {
		app.canvas.ctx.beginPath();
		for (let h = index; h < end; h++) {
			const line = lns[h];
			if (line && line.e) {
				let v = new Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(segNum);
				app.canvas.ctx.moveTo( line.s.x + getRandom(-jiggle, jiggle), line.s.y + getRandom(-jiggle, jiggle) );
				for (var i = 0; i < segNum; i++) {
					const p = new Vector(line.s.x + v.x * i, line.s.y + v.y * i); /* midpoint of segment */
					app.canvas.ctx.lineTo( p.x + v.x + getRandom(-jiggle, jiggle), p.y + v.y + getRandom(-jiggle, jiggle) );
				}
				if (onion) app.canvas.ctx.strokeStyle = color;
				else {
					/* this doesnt work w onion, try to figure it out */
					if (app.canvas.ctx.strokeStyle != "#" + color) {
						app.canvas.ctx.strokeStyle = "#" + color;
						app.canvas.ctxStrokeColor = color;
					}
				}
			}
		}	
		app.canvas.ctx.stroke();			
	};

	this.draw = function() {
		if (performance.now() > self.interval + self.timer) {
			self.timer = performance.now();
			if (self.isPlaying && self.currentFrameCounter < app.data.frames.length) {
				self.currentFrameCounter += self.intervalRatio;
				self.currentFrame = Math.floor(self.currentFrameCounter);
			}
			if (self.isPlaying && self.currentFrameCounter >= app.data.frames.length) {
				self.currentFrame = self.currentFrameCounter = 0;
			}

			/* update the anim frame number */
			if (self.isPlaying) 
				app.interface.updateFrameNum();

			app.canvas.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
			if (self.background.img.src && self.background.show)
				app.canvas.ctx.drawImage(self.background.img, self.background.x, self.background.y, self.background.size, self.background.size/self.background.ratio);

			/* draws onionskin this is first so its under main lines */
			if (self.onionSkinNum > 0) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const frameNumber = self.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / self.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < app.data.frames[frameNumber].length; i++) {
							const fr = app.data.frames[frameNumber][i];
							const dr = app.data.drawings[fr.d];
							self.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, color, true);
						}
					}
				}
			}

			/* draws saved frames */
			if (app.data.frames[self.currentFrame]) {
				for (let i = 0; i < app.data.frames[self.currentFrame].length; i++) {
					const fr = app.data.frames[self.currentFrame][i];
					const dr = app.data.drawings[fr.d];
					self.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}

			/* draws current lines */
			if (app.data.frames[self.currentFrame] == undefined || app.mouse.addToFrame) {
				self.drawLines(app.data.lines, 0, app.data.lines.length, app.mouse.segNumRange, app.mouse.jiggleRange, app.color.color);
			}

			
		}
		window.requestAnimFrame(self.draw);
	}
	
	/* starts drawing, is this necessary ? */
	this.start = function() {
		window.requestAnimFrame(self.draw);
	}
}