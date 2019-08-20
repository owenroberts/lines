class Animation {
	constructor(ctx, lps, mixedColors) {
		this.ctx = ctx;
		this.isPlaying = false;
		this.numFrames = 0;
		this.drawings = [];
		this.layers = [];
		this.currentFrame = 0;
		this.currentFrameCounter = 0;
		
		this.lps = lps || 12;
		this.fps = lps || 12;
		this.lineInterval = 1000 / this.lps;
		this.intervalRatio = 1;

		this.mixedColors = mixedColors || false;

		this.rndr = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 }
		};

		this.state = 'default';
		this.states = { 'default': {start: 0, end: 0 } };

		this.over = {};
		this.override = true;
	}

	set frame(n) {
		this.currentFrame = this.currentFrameCounter = n;
	}

	get frame4() {
		return +this.currentFrameCounter.toFixed(4);
	}

	get endFrame() {
		return this.layers.length > 0 ?
			Math.max.apply(Math, this.layers.map(layer => { return layer.f.e; }))
			:
			-1;
	}

	get currentState() {
		return this.states[this.state];
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
				this.currentFrame = Math.floor(this.frame4);
				if (this.onUpdate) this.onUpdate();
			}
			if (this.frame4 > this.states[this.state].end) {
				this.frame = this.states[this.state].start;
				if (this.onPlayedState) this.onPlayedState();
			}
			if (this.onUpdate) this.onUpdate();
		}
	}

	draw() {
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

				if (layer.a) {
					for (let j = 0; j < layer.a.length; j++) {
						const a = layer.a[j];
						if (a.sf <= this.currentFrame && a.ef >= this.currentFrame) {
							this.rndr[a.prop] = Cool.map(this.currentFrame, a.sf, a.ef, a.sv, a.ev);
							if (a.prop == 's' || a.prop == 'e')
								this.rndr[a.prop] = Math.round(this.rndr[a.prop]);
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

					if (this.ctx.strokeStyle != this.rndr.c)
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

				if (this.mixedColors) {
					if (this.ctx.strokeStyle != this.rndr.c)
						this.ctx.strokeStyle = this.rndr.c;
				}

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
		this.loadData(JSON.parse(json), callback);
	}

	loadData(json, callback) {
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

		this.intervalRatio = this.lineInterval / (1000 / json.fps);

		if (this.states.default) this.states.default.end = this.endFrame;

		if (json.mc) this.mixedColors = json.mc; /* hmm .. over ride? */

		this.isPlaying = true;

		if (callback) callback(json);
		if (this.onLoad) this.onLoad();
	}
}

/* questions 
	- use A/Anim to make Animation availabe in contexts?
	- do i need canvas reference?
		- for lines player ...
	- do i need ctx reference?
		- yes for each probably

	- xy, width height
		- set get in each class extension ??
		- remove for now

	rndr	
		- wierd to rndr as only abbreivation?
		- animate just rests every time ...


	anim/game
		- how to handle width, height ratios for resizing ...
		- loop is assumed for other anims ...
		- random frames prob only in game

	states 
		- states are separate info unless used in play.js
		- pre update?

	override - 
		- play/game only, add to animate anyway?
		- middle func ... 

	load -- issues 
		- game saves loaded sprites, not necessary for others
		- game setting sprite size
		- whole separate loader class?

	draw 
		- xy arguments? only needed for game ...

	pre/post draw, needed but should be handled by sub classes?

	update
		- comes at the end for game, beginning for anim and animate/play
		- does update call draw or the other way around ...

	layer class ?
		- more for interface stuff ...
		- only useful method isInFrame
		- mm ... start frame, end frame ... 

	range class
		- start and end
		- end can't be smaller than start
		- what about saving data???  method ... 

	performance
		- currently always resetting ...

	animation 
		- use sub class?

	play
		- is texture just make a sub class for that ...

*/