/* play module - need to use params too many args */
function LinesPlayer(canvas, src, checkRetina, lps, callback, isTexture) {
	this.canvas = canvas;
	if (!this.canvas) this.canvas = document.getElementById('lines');
	if (!this.canvas) {
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
	}

	this.ctx = this.canvas.getContext('2d');
	this.lps = lps || 12; // 12  default ?
	this.lineInterval = 1000 / this.lps; /* needed in both places ?? */
	this.mixedColors = false; // is this always false?
	this.drawBg = true; /* where? */
	this.isTexture = isTexture;
	this.dpr = checkRetina ? window.devicePixelRatio || 1 : 1;

	this.animation = new Animation(this.ctx, this.lps);
	if (src) this.animation.load(src, data => {
		this.width = data.w;
		this.canvas.width = data.w * this.dpr;
		this.height = data.h;
		this.canvas.height = data.h * this.dpr;
		this.ctx.scale(this.dpr, this.dpr);
		this.canvas.style.zoom = 1 / this.dpr;

		this.ctx.miterLimit = 1;
		if (data.bg) this.canvas.style.backgroundColor = data.bg;
		if (callback) callback();
		if (!this.isTexture) requestAnimFrame(this.draw.bind(this)); /* three.js stuff */
		if (this.sizeCanvas) {
			this.sizeCanvas();
			window.addEventListener('resize', this.sizeCanvas.bind(this), false);
		}
		if (this.color) this.ctx.strokeStyle = this.color;
		this.animation.isPlaying = true;
	});

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
		
		if (performance.now() > this.lineInterval + this.timer) {
			this.timer = performance.now();
			this.animation.update();
			if (this.drawBg) this.ctx.clearRect(0, 0, this.width, this.height);
			this.animation.draw();
		}
	};
}

function loadAnimation(src, canvas, lps, callback) {
	const player = new LinesPlayer(canvas, src, lps, true, callback);
}