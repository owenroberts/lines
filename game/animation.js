function Animation(src) {
	this.debug = false;
	this.loaded = false;
	this.play = true;
	this.src = src;
	this.frames = [];
	this.drawings = [];
	this.currentFrame = 0; 
	this.currentFrameRounded = 0; 
	this.widthRatioRatio = 0;
	this.heightRatioRatio = 0;
	this.frameCount = -1;
	this.frameCountRounded = -1; 
	this.loop = true;
	this.playOnce = false;
	this.intervalRatio = 1;

	this.load = function(size, callback) {
		var that = this;
		$.getJSON(this.src, function(data) {
			that.loaded = true;
			that.frames = data.f;
			that.drawings = data.d;
			if (size === true) {
				that.widthRatio = 1;
				that.heightRatio = 1;
				if (callback) callback(data.w, data.h);
			} else {
				that.widthRatio = size.x / data.w;
				that.heightRatio = size.y / data.h;
			}
			that.intervalRatio = lineInterval / (1000/data.fps);
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
							const v = new Vector(line.e.x, line.e.y);
							v.subtract(line.s);
							v.divide(drw.n); // line num
							ctx.moveTo(
								x + this.widthRatio * (line.s.x + getRandom(-drw.r, drw.r)), 
								y + this.heightRatio * (line.s.y + getRandom(-drw.r, drw.r)) 
							);
							for (let j = 0; j < drw.n; j++) {
								const p = new Vector(line.s.x + v.x * j, line.s.y + v.y * j);
								ctx.lineTo( 
									x + this.widthRatio * (p.x + v.x + getRandom(-drw.r, drw.r)), 
									y + this.heightRatio * ( p.y + v.y + getRandom(-drw.r, drw.r)) 
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
	};

	this.stop = function() {
		this.frameCount = this.frameCountRounded = 0;
	};

	this.start = function() {
		this.frameCount = this.frameCountRounded = -1;
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
								v = new Vector(line.e.x, line.e.y);
							} else {
								v = new Vector(line0.e.x, line0.e.y);
							}

							v.subtract(line.s);
							v.divide(drw.n); // line num
							ctx.moveTo(
								line.s.x + getRandom(-drw.r, drw.r), 
								line.s.y + getRandom(-drw.r, drw.r) 
							);
							for (let j = 0; j < drw.n; j++) {
								const p = new Vector(line.s.x + v.x * j, line.s.y + v.y * j);
								ctx.lineTo( 
									p.x + v.x + getRandom(-drw.r, drw.r), 
									p.y + v.y + getRandom(-drw.r, drw.r) 
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