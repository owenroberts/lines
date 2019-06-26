/* play module */
function LinesPlayer(canvas, src, lps, callback, isTexture) {
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
	
	this.numFrames = 0;
	this.currentFrame = 0; // always int, floor cfc
	this.currentFrameCounter = 0; // uses intervalRatio, so it's a float
	this.isPlaying = true;
	
	this.lps = lps || 12; // default
	this.lineInterval = 1000 / this.lps;
	this.timer = performance.now();
	this.intervalRatio = 1;
	/* 	initialize to one but this is the math
	 this.lineInterval / (1000 / this.lps);    */

	this.drawings = [];
	this.layers = [];
	this.ctxStrokeColor;
	this.mixedColors = false;
	this.isTexture = isTexture || false; /* if used for 3d texture it doesnt animate or resize */
	this.drawBg = true;
	this.rndr = {};
	this.over = {}; /* override drawing props */

	this.override = function(prop, value) {
		this.over[prop] = value;
	};

	this.reset = function() {
		this.rndr = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 }
		};
		this.over = {
			n: undefined, // seg num
			r: undefined, // random "jiggle"
			w: undefined, // random "wiggle"
			v: undefined, // "wiggle speed"
			c: undefined  // color
		};
		this.update = undefined;
	};

	this.draw = function() {
		if (!this.isTexture && this.isPlaying)
			requestAnimFrame(this.draw.bind(this));
		if (performance.now() > this.lineInterval + this.timer) {
			this.timer = performance.now();
			
			if (this.isPlaying) {
				if (this.currentFrameCounter <= this.numFrames) {
					this.currentFrameCounter += this.intervalRatio;
					this.currentFrame = Math.floor(this.currentFrameCounter);
				}
				if (this.currentFrame > this.numFrames) {
					this.currentFrame = this.currentFrameCounter = 0;
					if (this.onPlayedOnce) {
						this.onPlayedOnce();
						this.onPlayedOnce = undefined;
					}
				}
			}
			
			if (this.drawBg) this.ctx.clearRect(0, 0, this.width, this.height);
			
			if (!this.mixedColors) this.ctx.beginPath();
			for (let i = 0; i < this.layers.length; i++) {
				const layer = this.layers[i];
				const drawing = this.drawings[layer.d];
				if (this.currentFrame >= layer.f.s && this.currentFrame <= layer.f.e) {
					
					this.rndr.s = 0;
					this.rndr.e = drawing.length;
					const frameCount = layer.f.e - layer.f.s + 1;
					
					if (layer.draw == 'Explode') {
						const segments = drawing.length / frameCount;
						this.rndr.e = Math.round(segments * (this.currentFrame - layer.f.s + 1));
					}
					else if (layer.draw == 'Reverse') {
						const segments = drawing.length / frameCount;
						this.rndr.s = Math.round(segments * (this.currentFrame - layer.f.s));
					}
					else if (layer.draw == 'ExRev') {
						const mid = layer.f.s + frameCount / 2;
						if (this.currentFrame < mid) {
							const segments = drawing.length / (mid - layer.f.s + 1);
							this.rndr.e = Math.round(segments * (this.currentFrame - layer.f.s));
						} else {
							const segments = drawing.length / (layer.f.e - mid + 1);
							this.rndr.s = Math.round(segments * (this.currentFrame - mid));
						}
					}

					for (const key in layer) {
						this.rndr[key] = layer[key];
					}

					for (const key in this.over) {
						if (this.over[key] != undefined) 
							this.rndr[key] = this.over[key];
					}

					// apply wiggle and speed if it exists 
					if (this.rndr.w > 0) {
						this.rndr.off.x = Cool.random(0, this.rndr.w);
						this.rndr.off.y = Cool.random(0, this.rndr.w);
						this.rndr.speed.x = Cool.random(-this.rndr.v, this.rndr.v);
						this.rndr.speed.y = Cool.random(-this.rndr.v, this.rndr.v);
					}

					if (this.mixedColors) this.ctx.beginPath();
					
					for (let j = this.rndr.s; j < this.rndr.e - 1; j++) {
						const s = drawing[j];
						const e = drawing[j + 1];
						const v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(this.rndr.n);
						this.ctx.moveTo( 
							this.rndr.x + s.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x, 
							this.rndr.y + s.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y
						);
						for (let k = 0; k < this.rndr.n; k++) {
							const p = new Cool.Vector(s.x + v.x * k, s.y + v.y * k);
							this.ctx.lineTo( 
								this.rndr.x + p.x + v.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x, 
								this.rndr.y + p.y + v.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y
							);	
						}

						if (this.ctxStrokeColor != this.rndr.c && !this.color) {
							this.ctxStrokeColor = this.rndr.c;
							this.ctx.strokeStyle = this.ctxStrokeColor;
						}

						// update wiggle and speed (if exists)
						if (this.rndr.w > 0) {
							this.rndr.off.x += this.rndr.speed.x;
							if (this.rndr.off.x >= this.rndr.w || this.rndr.off.x <= -this.rndr.w)
								this.rndr.speed.x *= -1;

							this.rndr.off.y += this.rndr.speed.y;
							if (this.rndr.off.y >= this.rndr.w || this.rndr.off.y <= -this.rndr.w)
								this.rndr.speed.y *= -1;
						}
					}
					if (this.mixedColors) this.ctx.stroke();
				}
				if (!this.mixedColors) this.ctx.stroke();
				if (this.update) this.update();
			}
		}
	};

	this.loadData = function(data, callback) {
		this.drawings = [];
		for (let i = 0; i < data.d.length; i++) {
			const drawing = data.d[i];
			const d = [];
			if (drawing) {
				for (let j = 0; j < drawing.length; j++) {
					const point = drawing[j];
					if (point) d.push({ x: point[0], y: point[1] });
					else d.push('end');
				}
			}
			this.drawings[i] = d;
		}
		this.layers = data.l;
		for (let i = 0; i < this.layers.length; i++) {
			if (this.numFrames < this.layers[i].f.e)
				this.numFrames = this.layers[i].f.e;
		}
		this.intervalRatio = this.lineInterval / (1000 / data.fps);
		this.currentFrame = this.currentFrameCounter = 0;
		this.width = this.canvas.width = data.w;
		this.height = this.canvas.height = data.h;
		this.ctxStrokeColor = undefined; // note setting canvas width resets the color
		this.ctx.miterLimit = 1;
		if (data.mc) this.mixedColors = data.mc;
		if (data.bg) this.canvas.style.backgroundColor = data.bg;
		if (callback) callback(); // callback to do something after drawing loads
		if (!this.isTexture) requestAnimFrame(this.draw.bind(this));

		/* defined by instance */
		if (this.sizeCanvas) {
			this.sizeCanvas();
			window.addEventListener('resize', this.sizeCanvas.bind(this), false);
		}
		if (this.color) this.ctx.strokeStyle = this.color;
	};

	// original generic name, now is closer to "load file"
	this.loadAnimation = function(src, callback) {
		this.reset(); /* reset rndr */
		fetch(src)
			.then(response => { return response.json() })
			.then(json => { this.loadData(json, callback) })
			.catch(error => {console.log('error', error)});
	};

	this.loadJSON = function(json, callback) {
		this.loadData(JSON.parse(json), callback);
	};

	if (src) this.loadAnimation(src, callback);
}

function loadAnimation(src, canvas, lps, callback) {
	const player = new LinesPlayer(canvas, src, lps, true, callback);
}