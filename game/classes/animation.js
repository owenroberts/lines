/* animation is the lines playing module, child of sprite class */
class Animation {
	constructor(src, debug) {
		// if (debug) console.log(src);
		this.src = src;
		this.debug = debug;
		this.loaded = false;
		this.drawBackground = false;

		this.isPlaying = true;

		this.frames = [];
		this.drawings = [];
		this.layers = [];
		this.currentFrame = 0;
		this.currentFrameCounter = 0;  // floats
		this.widthRatio = 1;
		this.heightRatio = 1;

		this.loop = true;
		this.intervalRatio = 1;

		this.state = 'default';
		this.states = { 'default': {start: 0, end: 0 } };

		this.randomFrames = false; /* play random frames */

		// this.mirror = false; /* not implemented */
		this.rndr = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 }
		};

		/* override drawing props */
		this.over = {
			n: undefined, // seg num
			r: undefined, // random "jiggle"
			w: undefined, // random "wiggle"
			v: undefined, // "wiggle speed"
			c: undefined  // color
		}
		this.overRide = false;
	}

	load(setAnimSize, callback) {
		if (Game.loaded[this.src]) {
			this.loadJSON(Game.loaded[this.src], setAnimSize, callback);
		} else {
			fetch(this.src)
				.then(response => { return response.json() })
				.then(json => { 
					this.loadJSON(json, setAnimSize, callback);
					Game.loaded[this.src] = json;
				})
				.catch(error => { console.error(error) });
		}
	}

	loadJSON(json, setAnimSize, callback) {
		this.loaded = true;
		this.frames = json.f;
		this.drawings = json.d;
		this.layers = json.l;
		
		if (this.states.default)
			this.states.default.end = this.frames.length;
		if (!setAnimSize) {
			if (callback) callback(json.w, json.h);
		} else {
			this.widthRatio = setAnimSize.w / json.w;
			this.heightRatio = setAnimSize.h / json.h;
		}
		this.intervalRatio = Game.lineInterval / (1000 / json.fps);

		if (this.onLoad) this.onLoad();
	}

	setOnLoad(callback) {
		if (this.loaded) callback();
		else this.onLoad = callback;
	}

	createNewState(label, start, end) {
		if (!this.states[label]) {
			this.states[label] = {
				start: start,
				end: end
			}
		}
		this.setState(label);
	}

	setState(state) {
		if (this.state != state) {
			this.state = state;
			if (this.states[this.state]) // catch for laoding error for now
				this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
			
			/* bad temp fix for play once call back triggering
				after state changed, means have to call playOnce after 
				setState if intending to play once */
			if (!this.isPlaying) this.isPlaying = true;
		}
	}

	setFrame(frame) {
		this.currentFrame = this.currentFrameCounter = frame;
	}

	playOnce(callback) {
		if (!this.isPlaying) this.isPlaying = true;
		this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		this.onPlayedOnce = callback;
		// this.randomFrames = false;  /* need this? */
		// doesn't turn itself off?
	}

	overrideProperty(prop, value) {
		this.over[prop] = value;
		this.overRide = true;
	}

	draw(x, y) {
		// console.log(this.state, this.states[this.state]);
		if (this.loaded && this.isPlaying) {
			if (this.mirror) {
				// Game.ctx.save();
				// Game.ctx.translate(this.width, 0);
				// Game.ctx.scale(-1,1);
			}
			if (this.frames[this.currentFrame]) {
				if (!Game.mixedColors) Game.ctx.beginPath();
				for (let i = 0, len = this.frames[this.currentFrame].length; i < len; i++) {
					const frame = this.frames[this.currentFrame][i];
					const layer = this.layers[frame.l];
					const drawing = this.drawings[layer.d];

					if (this.rndr.l != frame.l) {
						for (const key in layer) {
							this.rndr[key] = layer[key];
						}
					}

					/* 
						s is not saved in frames because its the same as layer 
						temp fix
					*/
					if (this.rndr.s != layer.s) this.rndr.s = layer.s;
					if (this.rndr.e != layer.e) this.rndr.e = layer.e;

					for (const key in frame) {
						this.rndr[key] = frame[key];
					}

					if (this.overRide) {
						for (const key in this.over) {
							if (this.over[key] != undefined) 
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

					if (Game.mixedColors) Game.ctx.beginPath();
					
					for (let j = this.rndr.s; j < this.rndr.e - 1; j++) {
						const s = drawing[j];
						const e = drawing[j + 1];
						const v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(this.rndr.n);
						Game.ctx.moveTo(
							x + this.widthRatio * (this.rndr.x + s.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x), 
							y + this.heightRatio * (this.rndr.y + s.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y)
						);
						for (let k = 0; k < this.rndr.n; k++) {
							const p = new Cool.Vector(s.x + v.x * k, s.y + v.y * k);
							Game.ctx.lineTo( 
								x + this.widthRatio * (this.rndr.x + p.x + v.x + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.x),
								y + this.heightRatio * (this.rndr.y + p.y + v.y + Cool.random(-this.rndr.r, this.rndr.r) + this.rndr.off.y)
							);
						}

						if (Game.mixedColors) {
							if (Game.ctx.strokeStyle != this.rndr.c)
								Game.ctx.strokeStyle = this.rndr.c;
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
					if (Game.mixedColors) Game.ctx.stroke();
				}
				if (!Game.mixedColors) Game.ctx.stroke();
				if (this.drawBackground) this.drawBkg(x, y);
			}
			// if (this.mirror) Game.ctx.restore();
		}
		this.updateFrame();
	}

	updateFrame() {
		if (this.debug) {
			// console.log(this.currentFrame, this.currentFrameCounter);
			// console.log(this.state, this.states[this.state])
			// console.log(this.currentFrame, this.currentFrameCounter, this.states[this.state].end);
		}
		if (this.currentFrame <= this.states[this.state].end) {
			this.currentFrameCounter += this.intervalRatio;
			if (this.randomFrames && this.currentFrame != Math.floor(this.currentFrameCounter)) {
				if (this.prevFrameCheck) {
					const prevFrame = this.currentFrame;
					while (prevFrame == this.currentFrame) {
						this.currentFrame = this.currentFrameCounter =  Cool.randomInt(this.states[this.state].start, this.states[this.state].end - 1);
					}
				} else {
					this.currentFrame = this.currentFrameCounter =  Cool.randomInt(this.states[this.state].start, this.states[this.state].end - 1);
				}
			} else {
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
			if (this.onUpdate) this.onUpdate();
		}

		if (this.currentFrameCounter >= this.states[this.state].end) {
			if (this.loop) this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
			else this.currentFrame = this.currentFrameCounter = this.states[this.state].end;
			if (this.onPlayedOnce) {
				this.onPlayedOnce();
				this.onPlayedOnce = undefined;
			}
			if (this.onPlayedState) this.onPlayedState();
		}
	}

	drawBkg(x, y) {
		if (!this.mixedColors)
			Game.ctx.beginPath();
		for (let i = 0, len = this.frames[this.currentFrameRounded].length; i < len; i++) {
			const frm = this.frames[this.currentFrameRounded][i];
			const drw = this.drawings[frm.d];
			if (mixedColors)
				Game.ctx.beginPath();
			for (let h = frm.i; h < frm.e; h++) {
				const line = drw.l[h]; // line data
				if (line && line.e) {
					const v = new Cool.Vector(line.e.x, line.e.y);
					Game.ctx.lineTo(
						x + this.widthRatio * (line.s.x + Cool.random(-this.jiggle, this.jiggle)), 
						y + this.heightRatio * (line.s.y + Cool.random(-this.jiggle, this.jiggle)) 
					);
					if (Game.ctx.fillStyle.replace("#","") != drw.c) {
						Game.ctx.fillStyle = "#" + drw.c;
					}
				}
			}
			if (this.mixedColors) {
				Game.ctx.closePath();
				Game.ctx.fill();
			}
		}
		if (!this.mixedColors)
			Game.ctx.fill();
	}

	stop() {
		this.isPlaying = false;
	}

	start() {
		this.isPlaying = true;
	}
}