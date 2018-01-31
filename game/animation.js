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
	this.currentFrameRounded = 0; 
	this.width = 0;
	this.height = 0;
	this.widthRatio = 1;
	this.heightRatio = 1;
	this.frameCount = -1;
	this.frameCountRounded = -1; 
	this.loop = true;
	this.playOnce = false;
	this.intervalRatio = 1;
	this.jiggle = 1;
	this.segNum = 2;
	this.mirror = false;

	this.load = function(animSize, callback) {
		$.getJSON(this.src, function(data) {
			self.loaded = true;
			self.frames = data.f;
			self.drawings = data.d;
			if (!self.drawings.every(item => item == "x")) {
				let found = false;
				let count = 0;
				while(!found) {
					if (self.drawings[count].r && self.drawings[count].n) {
						self.jiggle = self.drawings[count].r;
						self.segNum = self.drawings[count].n;
						found = true;
					}
					count++;
				}
			}
			if (animSize === true) {
				self.widthRatio = 1;
				self.heightRatio = 1;
				if (callback) callback(data.w, data.h);
			} else {
				self.width = animSize.x;
				self.height = animSize.y;
				self.widthRatio = animSize.x / data.w;
				self.heightRatio = animSize.y / data.h;
			}
			self.intervalRatio = Game.lineInterval / (1000/data.fps);

		});
	};

	this.draw = function(x, y) {
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
			//if (this.debug) console.log(this.currentFrame);
			if (this.mirror) {
				ctx.save();
				//ctx.translate(this.width, 0);
				//ctx.scale(-1,1);
			}
			if (this.frames[this.currentFrameRounded]) {
				if (!mixedColors) ctx.beginPath();

				for (let i = 0; i < this.frames[this.currentFrameRounded].length; i++) {
					const frm = this.frames[this.currentFrameRounded][i];
					const drw = this.drawings[frm.d];
					if (mixedColors) ctx.beginPath();
					for (let h = frm.i; h < frm.e; h++) {
						const line = drw.l[h]; // line data
						if (line && line.e) {
							const v = new Cool.Vector(line.e.x, line.e.y);
							v.subtract(line.s);
							v.divide(this.segNum); // line num
							ctx.moveTo(
								x + this.widthRatio * (line.s.x + Cool.random(-this.jiggle, this.jiggle)), 
								y + this.heightRatio * (line.s.y + Cool.random(-this.jiggle, this.jiggle)) 
							);
							for (let j = 0; j < this.segNum; j++) {
								const p = new Cool.Vector(line.s.x + v.x * j, line.s.y + v.y * j);
								ctx.lineTo( 
									x + this.widthRatio * (p.x + v.x + Cool.random(-this.jiggle, this.jiggle)), 
									y + this.heightRatio * ( p.y + v.y + Cool.random(-this.jiggle, this.jiggle)) 
								);
							}
							if (ctx.strokeStyle.replace("#","") != drw.c) {
								ctx.strokeStyle= "#" + drw.c;
							}
						}
					}
					if (mixedColors) ctx.stroke();
				}
				if (!mixedColors) ctx.stroke();
			}
			if (this.mirror) ctx.restore();
		}
	};

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
	
	let count = 0;
	this.drawTwo = function(other) {
		count++;
		if (this.loaded && this.play) {
			if (this.frames[this.currentFrameRounded]) {
				if (!mixedColors)
					ctx.beginPath();
				for (let i = 0; i < this.frames[0].length; i++) {
					const frm = this.frames[0][0];
					const drw = this.drawings[frm.d];
					const frm0 = other.frames[0][0];
					const drw0 = other.drawings[frm.d];
					//console.log(frm0, drw0);
					if (mixedColors)
						ctx.beginPath();
					const end = frm.e > frm0.e ? frm0.e : frm.e;
					for (let h = 0; h < end; h++) {
						const line = drw.l[h]; // line data
						const line0 = drw0.l[h];
						if (line && line.e && line0 && line0.e) {
							let v;
							if (h > count) {
								v = new Cool.Vector(line.e.x, line.e.y);
							} else {
								v = new Cool.Vector(line0.e.x, line0.e.y);
							}

							v.subtract(line.s);
							v.divide(drw.n); // line num
							ctx.moveTo(
								line.s.x + Cool.random(-drw.r, drw.r), 
								line.s.y + Cool.random(-drw.r, drw.r) 
							);
							for (let j = 0; j < drw.n; j++) {
								const p = new Cool.Vector(line.s.x + v.x * j, line.s.y + v.y * j);
								ctx.lineTo( 
									p.x + v.x + Cool.random(-drw.r, drw.r), 
									p.y + v.y + Cool.random(-drw.r, drw.r) 
								);
							}
							if (ctx.strokeStyle.replace("#","") != drw.c) {
								ctx.strokeStyle= "#" + drw.c;
							}
						}
					}
					if (mixedColors)
						ctx.stroke();
					
				}
				if (!mixedColors)
					ctx.stroke();
			}
		}
	}
}