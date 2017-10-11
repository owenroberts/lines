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

function Draw(lines) {
	const self = this;

	/* can this be a module?  timeline? */
	this.currentFrame = 0;
	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fpsElem = document.getElementById("fps");
	this.fps = Number(this.fpsElem.value); // 10 is default but maybe should be 15
	this.interval = 1000/this.fps;  // fps per one second, the line interval
	this.timer = performance.now(); 
	this.intervalRatio = this.interval / (1000/this.fps);  // this starts same as lineInterval, written out to show math

	this.fpsElem.addEventListener("change", function() {
		self.fps = Number(this.value);
		self.intervalRatio = self.interval / (1000/self.fps);
		this.blur();
	});

	this.onionSkinElem = document.getElementById("onion-skin");
	this.onionSkinNum = Number(this.onionSkinElem.value); // number of onion skin frames
	this.onionSkinElem.addEventListener("change", function() {
		self.onionSkinNum = Number(this.onionSkinElem.value);
		this.blur();
	});

	this.toggle = function() {
		if (!this.isPlaying) app.data.saveLines();
		this.isPlaying = !this.isPlaying;
		app.interface.updateFrameNum();
	}

	this.drawLines = function(lns, index, end, segNum, jiggle, color, onion) {
		lines.canvas.ctx.beginPath();
		for (let h = index; h < end; h++) {
			const line = lns[h];
			if (line && line.e) {
				let v = new Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(segNum);
				ctx.moveTo( line.s.x + getRandom(-jiggle, jiggle), line.s.y + getRandom(-jiggle, jiggle) );
				for (var i = 0; i < segNum; i++) {
					const p = new Vector(line.s.x + v.x * i, line.s.y + v.y * i); /* midpoint of segment */
					ctx.lineTo( p.x + v.x + getRandom(-jiggle, jiggle), p.y + v.y + getRandom(-jiggle, jiggle) );
				}
				if (onion) ctx.strokeStyle = color;
				else {
					if (lines.canvas.ctxStrokeColor != color) {
						lines.canvas.ctx.strokeStyle = "#" + color;
						lines.canvas.ctxStrokeColor = color;
					}
				}
			}
		}	
		lines.canvas.ctx.stroke();			
	};

	this.draw = function() {
		if (performance.now() > this.interval + this.timer) {
			this.timer = performance.now();
			if (this.isPlaying && this.currentFrameCounter < lines.data.frames.length) {
				this.currentFrameCounter += this.intervalRatio;
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
			if (this.isPlaying && this.currentFrameCounter >= lines.data.frames.length) {
				this.currentFrame = this.currentFrameCounter = 0;
			}

			/* update the anim frame number */
			if (this.isPlaying) 
				lines.interface.updateFrameNum();

			lines.canvas.ctx.clearRect(0, 0, w, h);
			
			if (lines.background.img.src && lines.background.show)
				lines.canvas.ctx.drawImage(lines.background.img, lines.background.x, lines.background.y, lines.background.size, lines.background.size/lines.background.ratio);

			/* draws saved frame */
			const fr = frames[currentFrame][i];
			const dr = drawings[fr.d];
			if (lines.data.frames[this.currentFrame]) {
				for (let i = 0; i < lines.data.frames[this.currentFrame].length; i++) {
					this.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}

			/* draws current lines */
			if (lines.data.frames[this.currentFrame] == undefined || lines.drawingEvents.addToFrame) {
				drawLines(lines.lines, 0, lines.lines.length, lines.drawingEvents.segNumRange, lines.drawingEvents.jiggleRange, color);
			}

			/* draws onionskin */
			if (this.onionSkinNum > 0) {
				for (let o = 1; o <= this.onionSkinNum; o++){
					const frameNumber = this.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / this.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < frames[framenumber].length; i++) {
							drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, color, true);
						}
					}
				}
			}
		}
		window.requestAnimFrame(draw);
	}
	
	this.start = function() {
		window.requestAnimFrame(draw);
	}
}