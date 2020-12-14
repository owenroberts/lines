class LinesAnimation {
	constructor(ctx, dps, mixedColors) {
		this.ctx = ctx;
		this.loaded = false;
		this.isPlaying = false;
		this.drawings = [];
		this.layers = [];
		this.currentFrame = 0;
		this.currentFrameCounter = 0; // floats

		this.dps = dps || 30; // draw graphics 
		this.fps = dps || 12; // update frames

		this.drawInterval = 1000 / this.dps;
		this.intervalRatio = this.drawInterval / (1000 / this.fps); // ratio between draws and frame updates

		this.drawsPerFrame = Math.round(this.dps / this.fps);
		this.drawCount = 0;

		this.mixedColors = mixedColors || true;
		
		this.rndr = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 },
		};

		this._state = 'default'; // set state label
		this.states = { 'default': {start: 0, end: 0 } };

		this.over = {};
		this.override = true;
	}

	set fps(fps) {
		this._fps = +fps;
		this.intervalRatio = this.drawInterval / (1000 / +fps);
		this.drawsPerFrame = Math.round(this.dps / this.fps);
		this.drawCount = 0;
	}

	get fps() {
		return this._fps;
	}

	set dps(dps) {
		this._dps = +dps;
		this.drawInterval = 1000 / +dps;
		this.intervalRatio = this.drawInterval / (1000 / this.fps);
		this.drawsPerFrame = Math.round(this.dps / this.fps);
		this.drawCount = 0;
	}

	get dps() {
		return this._dps;
	}

	set frame(n) {
		this.currentFrame = this.currentFrameCounter = +n;
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

	set state(state) {
		if (this._state != state && this.states[state]) {
			this._state = state;
			if (this.state) this.frame = this.state.start;
		}
	}

	get state() {
		return this.states[this._state];
	}

	get stateName() {
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
		
		// frame update
		if (this.isPlaying) {
			// console.log(this.drawCount, this.drawsPerFrame);
			// console.log('updt', this.currentFrame)
			if (this.drawCount == this.drawsPerFrame) {
				
				if (this.currentFrame >= this.state.end) {
					this.currentFrame = this.state.start;
					if (this.onPlayedState) this.onPlayedState();
				} else {
					this.currentFrame++;
				}
				this.drawCount = 0;
			}
			this.drawCount++;



			// console.log('updt', this.currentFrame, this.currentFrameCounter, this.state.end);
			// if (this.currentFrame <= this.state.end) {
			// 	this.currentFrameCounter += this.intervalRatio;
			// 	if (this.currentFrameCounter >= this.state.end + 1) {
			// 		this.currentFrame = this.state.start;
			// 		this.currentFrameCounter = this.state.start + (this.currentFrameCounter % 1)/2;
			// 	} else {
			// 		this.currentFrame = Math.floor(this.currentFrameCounter);
			// 	}
				
			// 	if (this.onUpdate) this.onUpdate();
			// }

			// /* fuck me */
			// // if (this.frame4 >= this.state.end + 1) {
			// // 	this.frame = this.state.start;
			// // 	/* loop ? */
			// // 	if (this.onPlayedState) this.onPlayedState();
			// // }
			if (this.onUpdate) this.onUpdate();
		}
	}

	draw(x, y, suspendLinesUpdate) {
		// suspendLinesUpdate for text but could be useful ... for like textures!
		// if (this.debug) console.log(x, y);
		// console.log('draw', this.currentFrame);
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

				// "tweens"
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

				// over ride animation data from renderer (usually effects)
				if (this.override) {
					for (const key in this.over) {
						this.rndr[key] = this.over[key];
					}
				}

				if (layer.lc >= layer.l && drawing.needsUpdate) {
					drawing.update(this.rndr.n, this.rndr.r, this.rndr.w, this.rndr.v, this.rndr.ws);
					layer.lc = 0;
				} else if (drawing.needsUpdate) {
					layer.lc++;
				}

				if (this.mixedColors) this.ctx.beginPath();
				for (let j = this.rndr.s; j < this.rndr.e - 1; j++) {
					const s = drawing.get(j);
					const e = drawing.get(j + 1);
					if (s !== 'end' && e !== 'end') {
						const off = [...s.off, ...e.off];
						
						// catch for drawing - add flag?
						if (off.length < this.rndr.n + 1) {
							for (let k = off.length - 1; k < this.rndr.n + 1; k++) {
								off.push(new Cool.Vector());
							}
						}
						
						const v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(this.rndr.n);
						this.ctx.moveTo(
							this.rndr.x + s.x + off[0].x,
							this.rndr.y + s.y + off[0].y
						);
						for (let k = 0; k < this.rndr.n; k++) {
							const p = new Cool.Vector(s.x + v.x * k, s.y + v.y * k);
							this.ctx.lineTo( 
								// breaks ? k + 1 : k
								this.rndr.x + p.x + v.x + off[k + 1].x,
								this.rndr.y + p.y + v.y + off[k + 1].y
							);
						}

						if (this.ctx.strokeStyle != this.rndr.c && this.mixedColors)
							this.ctx.strokeStyle = this.rndr.c;
					} // else lineTo
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
			this.drawings[i] = json.d[i] ? 
				new Drawing(json.d[i]) : 
				null;
		}

		this.layers = json.l;

		// set first random values
		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			if (!layer.l) layer.l = 4; // new layer counter
			if (!layer.lc) layer.lc = 0;
			this.drawings[layer.d].update(layer.n, layer.r, layer.w, layer.v, layer.ws); 
		}

		for (const key in json.s) {
			this.states[key] = json.s[key];
		}
		if (this.states.default)
			this.states.default.end = this.endFrame;

		this.intervalRatio = this.lineInterval / (1000 / json.fps);
		this.fps = json.fps;

		if (json.mc) this.mixedColors = json.mc; /* hmm .. over ride? */

		// this.isPlaying = true; /* off for animate ? */

		/* need width and height for infinite hell ?? */
		this.width = json.w;
		this.height = json.h;

		if (callback) callback(json);
		// if (this.onLoad) this.onLoad();
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