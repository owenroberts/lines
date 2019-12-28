class Animation {
	constructor(ctx, lps, mixedColors) {
		this.ctx = ctx;
		this.loaded = false;
		this.isPlaying = false;
		this.drawings = [];
		this.layers = [];
		this.currentFrame = 0;
		this.currentFrameCounter = 0; // floats
		
		this.lps = lps || 12;
		this.fps = lps || 12;
		this.lineInterval = 1000 / this.lps;
		this.intervalRatio = 1;

		this.mixedColors = mixedColors || true;

		this.rndr = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 }
		};

		this._state = 'default';
		this.states = { 'default': {start: 0, end: 0 } };

		this.over = {};
		this.override = true;
	}

	set fps(fps) {
		this._fps = +fps;
		this.intervalRatio = this.lineInterval / (1000 / +fps);
	}

	get fps() {
		return this._fps;
	}

	set lps(lps) {
		this._lps = +lps;
		this.lineInterval = 1000 / +lps;
		this.intervalRatio = this.lineInterval / (1000 / this.fps);
	}

	get lps() {
		return this._lps;
	}

	set frame(n) {
		this.currentFrame = this.currentFrameCounter = n;
		if (this.states.default) {
			if (this.states.default.end != this.endFrame)
				this.states.default.end = this.endFrame;
		}
	}

	get frame4() {
		return +this.currentFrameCounter.toFixed(4);
	}

	get endFrame() {
		return this.layers.length > 0 ?
			Math.max.apply(Math, this.layers.map(layer => { return layer.f.e; }))
			: 0;
	}

	get currentState() {
		return this.states[this.state];
	}

	set state(state) {
		if (this._state != state) {
			this._state = state;
			if (this.currentState) this.frame = this.currentState.start;
			if (!this.isPlaying) this.isPlaying = true; /* bad temp fix ... */
		}
	}

	get state() {
		return this._state;
	}

	overrideProperty(prop, value) {
		this.over[prop] = value;
		this.override = true;
	}

	cancelOverride() {
		this.over = {}
		this.override = false;
	}

	update() {
		if (this.isPlaying) {
			if (this.currentFrame <= this.currentState.end) {
				this.currentFrameCounter += this.intervalRatio;
				this.currentFrame = Math.floor(this.currentFrameCounter);
				if (this.onUpdate) this.onUpdate();
			}
			// console.log(this.frame4, this.currentState.end, this.currentState.end + 1 - this.intervalRatio, this.frame4 > this.currentState.end + 1 - this.intervalRatio);
			// console.log(this.frame4, this.currentState.end + 1);
			/* fuck me */
			if (this.frame4 >= this.currentState.end + 1) {
				this.frame = this.currentState.start;
				/* loop ? */
				if (this.onPlayedState) this.onPlayedState();
			}
			if (this.onUpdate) this.onUpdate();
		}
	}

	draw(x, y) {
		if (!this.mixedColors) this.ctx.beginPath();
		for (let i = 0, len = this.layers.length; i < len; i++) {
			const layer = this.layers[i];
			const drawing = this.drawings[layer.d];
			if (this.currentFrame >= layer.f.s && this.currentFrame <= layer.f.e) {
				this.rndr.s = 0;
				this.rndr.e = drawing.length;

				for (const key in layer) {
					this.rndr[key] = layer[key];
				}

				if (x) this.rndr.x += x;
				if (y) this.rndr.y += y;

				if (layer.t) {
					for (let j = 0; j < layer.t.length; j++) {
						const tween = layer.t[j];
						if (tween.sf <= this.currentFrame && tween.ef >= this.currentFrame) {
							this.rndr[tween.prop] = Cool.map(this.currentFrame, tween.sf, tween.ef, tween.sv, tween.ev);
							if (tween.prop == 's' || tween.prop == 'e')
								this.rndr[tween.prop] = Math.round(this.rndr[tween.prop]);
						}
					}
				}

				if (this.override) {
					for (const key in this.over) {
						this.rndr[key] = this.over[key];
					}
				}

				if (this.rndr.w > 0) {
					this.rndr.off.x = Cool.random(0, this.rndr.w);
					this.rndr.off.y = Cool.random(0, this.rndr.w);
					this.rndr.speed.x = Cool.random(-this.rndr.v, this.rndr.v);
					this.rndr.speed.y = Cool.random(-this.rndr.v, this.rndr.v);
				} else {
					this.rndr.off.x = 0;
					this.rndr.off.y = 0;
					this.rndr.speed.x = 0;
					this.rndr.speed.y = 0;
				}

				if (this.mixedColors) this.ctx.beginPath();
				for (let j = this.rndr.s; j < this.rndr.e - 1; j++) {
					const s = drawing[j];
					const e = drawing[j + 1];
					const v = new Cool.Vector(e.x, e.y);
					v.subtract(s);
					v.divide(this.rndr.n);

					const radius = 5;

					this.ctx.beginPath();
					this.ctx.arc(
						this.rndr.x + s.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x, 
						this.rndr.y + s.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y, 
						radius, 0, 2 * Math.PI, false);
					this.ctx.fillStyle = this.rndr.c;
					this.ctx.fill();
					
					// this.ctx.moveTo(
					// 	this.rndr.x + s.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x, 
					// 	this.rndr.y + s.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y
					// );
					
					for (let k = 0; k < this.rndr.n; k++) {
						const p = new Cool.Vector(s.x + v.x * k, s.y + v.y * k);
						// this.ctx.lineTo( 
						// 	this.rndr.x + p.x + v.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x,
						// 	this.rndr.y + p.y + v.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y
						// );

						this.ctx.beginPath();
						this.ctx.arc(
							this.rndr.x + p.x + v.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x,
							this.rndr.y + p.y + v.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y,
							radius, 0, 2 * Math.PI, false);
						this.ctx.fill();
					}

					if (this.ctx.strokeStyle != this.rndr.c && this.mixedColors)
						this.ctx.strokeStyle = this.rndr.c;

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
		}
		if (!this.mixedColors) this.ctx.stroke();
		if (this.onDraw) this.onDraw();
	}

	load(src, callback) {
		fetch(src)
			.then(response => { return response.json() })
			.then(data => {
				this.loadData(data, callback);
			})
			.catch(error => { console.error(error) });
	}

	loadJSON(json, callback) {
		this.loadData(json, callback);
	}

	loadData(json, callback) {
		this.loaded = true;
		for (let i = 0; i < json.d.length; i++) {
			const drawing = json.d[i];
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
		
		this.layers = json.l;

		for (const key in json.s) {
			this.states[key] = json.s[key];
		}
		if (this.states.default)
			this.states.default.end = this.endFrame;

		this.intervalRatio = this.lineInterval / (1000 / json.fps);

		if (json.mc) this.mixedColors = json.mc; /* hmm .. over ride? */

		// this.isPlaying = true; /* off for animate ? */

		if (callback) callback(json);
		if (this.onLoad) this.onLoad();
	}

	setOnLoad(callback) {
		if (this.loaded) callback();
		else this.onLoad = callback;
	}
}

/* questions 
	- use A/Anim to make Animation availabe in contexts?
		- only really in game
		- maybe Animation and GameAnimation
		- or Sprite Animation
		- Anim is not good ... 
	rndr	
		- wierd to rndr as only abbreivation?
		- yes used so often its okay to abbreviate
		- animate just rests every time ...
			- do i need rndr at all, just layer values and over ride?
			- yeah as is rndr is stupid because it never doesn't reset the values
				- what were issues with that?
				- 0 undefined at first but there was others ... 
				- using layers instead of frames makes this better
				- maybe keep track of layers chaning?
				- that happens with currentFrame between endFrame startFrame
				- think more on this
			- otherwise just use const
				const e = over.e !== undefined ? over.e : layer.e;
			- do some performance tests with garden


	anim/game
		- how to handle width, height ratios for resizing ...
		- loop is assumed for other anims ...
		- random frames prob only in game

	load -- issues 
		- game saves loaded sprites, not necessary for others
		- game setting sprite size
		- whole separate loader class?
	pre/post draw, needed but should be handled by sub classes?
	- onupdate - on draw

	update
		- comes at the end for game, beginning for anim and animate/play
		- does update call draw or the other way around ...

	layer class ?
		- more for interface stuff ...
		- only useful method isInFrame
		- mm ... start frame, end frame ... 
		- anim one is useful but probab not necessary for game

	range class
		- start and end
		- end can't be smaller than start
		- what about saving data???  method ... 
		- is this actually usedful? 
*/