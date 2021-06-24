/* play module - need to use params too many args */

function LinesPlayer(params) {
	const { canvas, src, checkRetina, dps, callback, isTexture, pixelSize, LinesClass } = params;
	let debug = false;
	if (debug) console.log(this);
	this.canvas = canvas;
	if (!this.canvas) this.canvas = document.getElementById('lines');
	if (!this.canvas) {
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
	}

	this.ctx = this.canvas.getContext('2d');
	this.dps = dps || 36; // default ?
	this.interval = 1000 / this.dps; /* needed in both places ?? */
	this.multiColor = false; // is this always false?
	this.drawBg = true; /* where? */
	this.isTexture = isTexture;
	this.dpr = checkRetina ? window.devicePixelRatio || 1 : 1;

	this.pixelSize = pixelSize || 1;
	
	window.drawCount = 0;

	this.animation = new LinesClass(this.ctx, this.dps, this.multiColor, this.pixelSize);

	this.ctx.miterLimit = 1;
	this.width;
	this.height;
	
	this.timer = performance.now();

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
		if (!this.isTexture && this.animation.isPlaying)
			requestAnimFrame(this.draw.bind(this));
		
		if (performance.now() > this.interval + this.timer) {
			this.timer = performance.now();
			this.animation.update();
			if (this.drawBg) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.animation.draw();
			window.drawCount++;
		}
	};

	this.setScale = function(scale) {
		this.canvas.width = this.width * scale;
		this.canvas.height = this.height * scale;
		this.animation.setPixelM(scale);
	};

	this.loadNew = function(src, callback) {
		// loading a new animation -- skip resizing and call new draw
		this.animation = new LinesClass(this.ctx, this.dps);
		this.animation.load(src, callback);
		this.animation.isPlaying = true;
		this.draw();
	};

	this.load = function(src, callback) {
		const self = this;
		this.animation.load(src, data => {
			if (debug) console.log('animation data', data);
			self.width = data.w;
			self.canvas.width = data.w * self.dpr;
			self.height = data.h;
			self.canvas.height = data.h * self.dpr;
			self.ctx.scale(self.dpr, self.dpr);
			self.canvas.style.zoom = 1 / self.dpr;

			self.ctx.miterLimit = 1;
			if (data.bg) self.canvas.style.backgroundColor = data.bg;
			if (callback) callback();
			if (!self.isTexture) requestAnimFrame(self.draw.bind(self)); /* three.js stuff */
			if (self.sizeCanvas) {
				self.sizeCanvas();
				window.addEventListener('resize', self.sizeCanvas.bind(self), false);
			}
			if (self.color) self.ctx.strokeStyle = self.color;
			self.animation.isPlaying = true;
		});
	};

	if (src) this.load(src, callback);
}

function loadAnimation(src, canvas, dps, callback) {
	const player = new LinesPlayer(canvas, src, dps, true, callback);
}