/* play module - need to use params too many args */
function LinesPlayer(canvas, src, checkRetina, dps, callback, isTexture) {
	this.canvas = canvas;
	if (!this.canvas) this.canvas = document.getElementById('lines');
	if (!this.canvas) {
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
	}

	this.ctx = this.canvas.getContext('2d');
	this.dps = dps || 36; // default ?
	this.drawInterval = 1000 / this.dps; /* needed in both places ?? */
	window.drawCount = 0;
	this.mixedColors = false; // is this always false?
	this.drawBg = true; /* where? */
	this.isTexture = isTexture;
	this.dpr = checkRetina ? window.devicePixelRatio || 1 : 1;

	this.animation = new LinesAnimation(this.ctx, this.lps);

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
		
		if (performance.now() > this.drawInterval + this.timer) {

			this.timer = performance.now();
			this.animation.update();
			if (this.drawBg) this.ctx.clearRect(0, 0, this.width, this.height);
			this.animation.draw();
			drawCount++;
		}
	};

	this.load = function(src, callback) {
		const self = this;
		this.animation.load(src, data => {
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

	if (src) this.load(src);
}

function loadAnimation(src, canvas, dps, callback) {
	const player = new LinesPlayer(canvas, src, dps, true, callback);
}