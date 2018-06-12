/* animation is the lines playing module, child of sprite obj */
function Animation(src) {
	const self = this;
	const ctx = Game.ctx;
	const mixedColors = Game.mixedColors;
	this.debug = false;
	this.loaded = false;
	this.play = true;
	this.src = src;
	this.frames = [];
	this.drawings = [];
	this.currentFrame = 0; 
	this.currentFrameCounter = 0;  // floats
	this.width = 0;
	this.height = 0;
	this.widthRatio = 1;
	this.heightRatio = 1;
	this.frameCount = -1;
	this.frameCountCounter = -1;  // floats
	this.loop = true;
	this.playOnce = false;
	this.intervalRatio = 1;
	this.mirror = false;
	this.states = {
		'default': {start: 0, end: 0 }
	}
	this.state = 'default';

	this.load = function(animSize, callback) {
		fetch(this.src)
			.then(response => { return response.json() })
			.then(data => {
				self.loaded = true;
				self.frames = data.f;
				self.drawings = data.d;
				if (self.states.default)
					self.states.default.end = self.frames.length;
				if (animSize === true) {
					self.widthRatio = 1;
					self.heightRatio = 1;
					if (callback) 
						callback(data.w, data.h);
				} else {
					self.width = animSize.w;
					self.height = animSize.h;
					self.widthRatio = animSize.w / data.w;
					self.heightRatio = animSize.h / data.h;
				}
				self.intervalRatio = Game.lineInterval / (1000/data.fps);
			});
	};

	this.setNewState = function(label, start, end) {
		if (!this.states[label]) {
			this.states[label] = {
				start: start,
				end: end
			}
		}
		this.state = label;
	}

	this.draw = function(x, y) {
		if (this.frameCount == -1) { /* frameCount -1 is default, means its looping */
			if (this.debug) {
				console.log(this.state, this.states[this.state])
				// console.log(this.currentFrame, this.currentFrameCounter);
			}
			if (this.currentFrame < this.states[this.state].end) {
				this.currentFrameCounter += this.intervalRatio;
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
			if (this.currentFrame >= this.states[this.state].end) {
				if (this.loop) 
					this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
				else 
					this.currentFrame = this.currentFrameCounter = this.states[this.state].end;
			}
			if (this.currentFrame < this.states[this.state].start)
				this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		} else {
			/* play once */
			if (this.playOnce && this.frameCount < this.states[this.state].end) {
				this.frameCountCounter += this.intervalRatio;
				this.frameCount = Math.floor(this.frameCountCounter);
			}
			if (this.frameCount >= this.states[this.state].end) {
				this.playOnce = false;
				this.frameCount = this.frameCountCounter = this.states[this.state].start;
			}
			this.currentFrame = this.currentFrameCounter = this.frameCount;
		}
		

		if (this.loaded && this.play) {
			if (this.mirror) {
				ctx.save();
				//ctx.translate(this.width, 0);
				//ctx.scale(-1,1);
			}
			if (this.frames[this.currentFrame]) {
				if (!mixedColors) 
					ctx.beginPath();
				for (let i = 0; i < this.frames[this.currentFrame].length; i++) {
					const fr = this.frames[this.currentFrame][i];
					const jig = +fr.r;
					const seg = +fr.n;
					const dr = this.drawings[fr.d];
					if (mixedColors) 
						ctx.beginPath();
					for (let h = fr.s; h < fr.e - 1; h++) {
						const s = dr[h]; // line data
						const e = dr[h + 1];
						let v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(seg); // line num
						ctx.moveTo(
							x + this.widthRatio * (fr.x + s.x + Cool.random(-jig, jig)), 
							y + this.heightRatio * (fr.y + s.y + Cool.random(-jig, jig)) 
						);
						for (let j = 0; j < seg; j++) {
							const p = new Cool.Vector(s.x + v.x * j, s.y + v.y * j);
							ctx.lineTo( 
								x + this.widthRatio * (fr.x + p.x + v.x + Cool.random(-jig, jig)), 
								y + this.heightRatio * (fr.y +  p.y + v.y + Cool.random(-jig, jig)) 
							);
						}
						if (ctx.strokeStyle.replace("#","") != fr.c) {
							ctx.strokeStyle= "#" + fr.c;
						}
					}
					if (mixedColors) ctx.stroke();
				}
				if (!mixedColors) ctx.stroke();
			}
			if (this.mirror) ctx.restore();
		}
	};

	this.changeState = function(state) {
		if (this.state != state) {
			this.state = state;
			this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		}
	}

	this.drawBkg = function(x, y) {
		if (this.frameCount > -1) {
			if (this.playOnce && this.frameCountRounded < this.frames.length) {
				this.frameCount += this.intervalRatio;
				this.frameCountRounded = Math.floor(this.frameCount);
			}
			if (this.frameCountRounded >= this.frames.length) {
				this.playOnce = false;
				this.frameCount = this.frameCountRounded = 0;
			}
			this.currentFrame = this.currentFrameRounded = this.frameCountRounded;
		} else {
			if (this.currentFrameRounded < this.frames.length) {
				this.currentFrame  += this.intervalRatio;
				this.currentFrameRounded = Math.floor(this.currentFrame);
			}
			if (this.currentFrameRounded >= this.frames.length) {
				if (this.loop) this.currentFrame = this.currentFrameRounded = 0;
				else this.currentFrame = this.currentFrameRounded = this.frames.length - 1;
			}
		}

		if (this.loaded && this.play) {
			if (this.frames[this.currentFrameRounded]) {
				if (!mixedColors)
					ctx.beginPath();
				for (let i = 0; i < this.frames[this.currentFrameRounded].length; i++) {
					const frm = this.frames[this.currentFrameRounded][i];
					const drw = this.drawings[frm.d];
					if (mixedColors)
						ctx.beginPath();
					for (let h = frm.i; h < frm.e; h++) {
						const line = drw.l[h]; // line data
						if (line && line.e) {
							const v = new Cool.Vector(line.e.x, line.e.y);
							ctx.lineTo(
								x + this.widthRatio * (line.s.x + Cool.random(-this.jiggle, this.jiggle)), 
								y + this.heightRatio * (line.s.y + Cool.random(-this.jiggle, this.jiggle)) 
							);
							
							if (ctx.fillStyle.replace("#","") != drw.c) {
								ctx.fillStyle = "#" + drw.c;
							}
						}
					}
					if (mixedColors) {
						ctx.closePath();
						ctx.fill();

					}
				}
				if (!mixedColors)
					ctx.fill();
			}
		}
	};

	this.stop = function() {
		self.play = false;
	};

	this.start = function() {
		self.play = true;
	};

}