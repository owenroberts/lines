/* play module */
function LinesPlayer(canvas, src, lps, callback) {
	this.canvas = canvas;
	if (!this.canvas) this.canvas = document.getElementById('lines');
	if (!this.canvas) {
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
	}
	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;
	this.width;
	this.height;
	this.scale = 1;
	
	this.currentFrame = 0; // always int, floor cfc
	this.currentFrameCounter = 0; // uses intervalRatio, so it's a float
	this.playing = true;
	
	if (lps) this.lps = lps; // lines per second
	else this.lps = 15;
	this.lineInterval = 1000/this.lps;
	this.timer = performance.now();
	this.intervalRatio = 1;
	// initialize to one but this is the math
	// this.lineInterval / (1000 / this.lps);  
	this.frames = [];
	this.drawings = [];
	this.ctxStrokeColor;
	this.mixedColors = false;

	this.draw = function() {
		requestAnimFrame(this.draw.bind(this));
		if (performance.now() > this.lineInterval + this.timer) {
			this.timer = performance.now();
			if (this.playing && this.currentFrameCounter < this.frames.length) {
				this.currentFrameCounter += this.intervalRatio;
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
			if (this.playing && this.currentFrame >= this.frames.length) {
				this.currentFrame = this.currentFrameCounter = 0;
			}
			this.ctx.clearRect(0, 0, this.width, this.height);
			if (this.frames[this.currentFrame]) {
				if (!this.mixedColors)
					this.ctx.beginPath();
				for (let i = 0; i < this.frames[this.currentFrame].length; i++) {
					const fr = this.frames[this.currentFrame][i];
					const dr = this.drawings[fr.d];
					if (this.mixedColors)
						this.ctx.beginPath();
					for (let h = fr.i; h < fr.e; h++) {
						let line = dr.l[h];
						if (line && line.e) {
							let v = new Cool.Vector(line.e.x, line.e.y);
							v.subtract(line.s);
							v.divide(dr.n);
							this.ctx.moveTo( line.s.x + Cool.random(-dr.r, dr.r), line.s.y + Cool.random(-dr.r, dr.r) );
							for (let j = 0; j < dr.n; j++) {
								let p = new Cool.Vector(line.s.x + v.x * j, line.s.y + v.y * j);
								this.ctx.lineTo( p.x + v.x + Cool.random(-dr.r, dr.r), p.y + v.y + Cool.random(-dr.r, dr.r) );
							}
							if (this.ctxStrokeColor != dr.c) {
								this.ctxStrokeColor = dr.c;
								this.ctx.strokeStyle= "#" + this.ctxStrokeColor;
							}
						}			
					}
					if (this.mixedColors)
						this.ctx.stroke();
				}
				if (!this.mixedColors)
					this.ctx.stroke();
			}
		}
	};

	this.sizeCanvas = function() {
		const padding = 8; 
		const top = canvas.getBoundingClientRect().top;

		if (window.innerWidth - padding * 2 < this.width)
			this.scale = (window.innerWidth - padding * 2) / this.width;
		else if ((window.innerHeight - top - padding * 2) < this.height)
			this.scale = (window.innerHeight - top - padding * 2) / this.height;
		else
			this.scale = 1;

		if (this.scale != 1) {

			if (this.scale * this.width / (window.innerHeight - top) > this.width/this.height) {
				this.canvas.height = window.innerHeight;
				this.canvas.width = this.canvas.height * (this.width / this.height);
				this.scale = this.canvas.height / this.height;
			} else {
				this.canvas.width = Math.min(this.width * this.scale, this.width);
				this.canvas.height = Math.min(this.height * this.scale, this.height);
			}
			this.ctx.scale(this.scale, this.scale);
		}

		this.ctxStrokeColor = undefined;
	};

	window.addEventListener('resize', this.sizeCanvas.bind(this), false);

	this.loadAnimation = function(src, callback) {
		const self = this;
		$.getJSON(src, function(data) {
			self.frames =  data.f;
			self.drawings = data.d;
			self.intervalRatio = self.lineInterval / (1000 / data.fps);
			self.currentFrame = self.currentFrameCounter = 0;
			self.width = self.canvas.width = data.w;
			self.height = self.canvas.height = data.h;
			self.ctxStrokeColor = undefined; // note setting canvas width resets the color
			self.ctx.miterLimit = 1;
			if (data.mix)
				self.mixedColors = data.mix;
			if (data.bg)
				self.canvas.style.backgroundColor = '#' + data.bg;
			requestAnimFrame(self.draw.bind(self));
			self.sizeCanvas();
			if (callback) callback(); // callback to do something after drawing loads

		});
	};

	if (src) this.loadAnimation(src, callback);
}

function loadAnimation(src, canvas, callback) {
	const player = new LinesPlayer(canvas, src, callback);
}