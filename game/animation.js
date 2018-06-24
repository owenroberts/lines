/* animation is the lines playing module, child of sprite obj */
class Animation {
	constructor(src) {
		this.src = src;
		this.ctx = Game.ctx;
		this.mixedColors = Game.mixedColors;
		this.debug = false;
		this.loaded = false;
		this.drawBackground = false;

		this.isPlaying = true;

		this.frames = [];
		this.drawings = [];
		this.currentFrame = 0;
		this.currentFrameCounter = 0;  // floats
		this.widthRatio = 1;
		this.heightRatio = 1;

		this.loop = true;
		this.intervalRatio = 1;

		/* figure this out now, with states this is very different */
		this.frameCount = -1; // i guess this is set at beginning? set to 0 so it doesn't go through
		this.frameCountCounter = -1;  // floats

		this.state = 'default';
		this.states = { 'default': {start: 0, end: 0 } }

		// this.mirror = false; /* not implemented */
	}


	load(setAnimSize, callback) {
		fetch(this.src)
			.then(response => { return response.json() })
			.then(data => {
				this.loaded = true;
				this.frames = data.f;
				this.drawings = data.d;
				if (this.states.default)
					this.states.default.end = this.frames.length;
				if (!setAnimSize) {
					if (callback) 
						callback(data.w, data.h);
				} else {
					this.widthRatio = setAnimSize.w / data.w;
					this.heightRatio = setAnimSize.h / data.h;
				}
				this.intervalRatio = Game.lineInterval / (1000/data.fps);
			});
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
			this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		}
	}

	/* need to work on this
		in drummer game it plays and then disappears
		in other scenarios is should play and stick ...
		but that should be loop */
	playOnce(callback) {
		this.frameCount = this.states[this.state].start;
		this.frameCountCounter = this.states[this.state].start;
		this.playOnceCallback = callback;
	}

	/* playOnce should end itself */
	endPlayOnce() {
		this.frameCount = -1; /* this is stupid */
		this.frameCountCounter = -1;
	}

	draw(x, y) {
		if (this.frameCount == -1) { /* frameCount -1 is default, means it plays from beginning */
			if (this.debug) {
				// console.log(this.state, this.states[this.state])
				// console.log(this.currentFrame, this.currentFrameCounter);
			}
			if (this.currentFrame < this.states[this.state].end) {
				this.currentFrameCounter += this.intervalRatio;
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
			if (this.currentFrame >= this.states[this.state].end) {
				if (this.loop) 
					this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
				else 
					this.currentFrame = this.currentFrameCounter = this.states[this.state].end;
			}
			if (this.currentFrame < this.states[this.state].start)
				this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		} else {
			/* play once */
			if (this.frameCount < this.states[this.state].end) {
				this.frameCountCounter += this.intervalRatio;
				this.frameCount = Math.floor(this.frameCountCounter);
				// if (this.debug) console.log(this.intervalRatio, this.frameCountCounter, this.frameCount)
				this.currentFrame = this.currentFrameCounter = this.frameCount;
			}

			if (this.frameCount >= this.states[this.state].end) {
				this.frameCount = this.frameCountCounter = this.states[this.state].start;
				this.endPlayOnce();
				if (this.playOnceCallback)
					this.playOnceCallback();
			}
		}

		if (this.loaded && this.isPlaying) {
			if (this.mirror) {
				// this.ctx.save();
				// ctx.translate(this.width, 0);
				// ctx.scale(-1,1);
			}
			if (this.frames[this.currentFrame]) {
				if (!this.mixedColors) 
					this.ctx.beginPath();
				for (let i = 0; i < this.frames[this.currentFrame].length; i++) {
					const fr = this.frames[this.currentFrame][i];
					const jig = +fr.r;
					const seg = +fr.n;
					const dr = this.drawings[fr.d];
					if (this.mixedColors) 
						this.ctx.beginPath();
					for (let h = fr.s; h < fr.e - 1; h++) {
						const s = dr[h]; // line data
						const e = dr[h + 1];
						let v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(seg); // line num
						this.ctx.moveTo(
							x + this.widthRatio * (fr.x + s.x + Cool.random(-jig, jig)), 
							y + this.heightRatio * (fr.y + s.y + Cool.random(-jig, jig)) 
						);
						for (let j = 0; j < seg; j++) {
							const p = new Cool.Vector(s.x + v.x * j, s.y + v.y * j);
							this.ctx.lineTo( 
								x + this.widthRatio * (fr.x + p.x + v.x + Cool.random(-jig, jig)), 
								y + this.heightRatio * (fr.y +  p.y + v.y + Cool.random(-jig, jig)) 
							);
						}
						if (this.ctx.strokeStyle.replace("#","") != fr.c) {
							this.ctx.strokeStyle= "#" + fr.c;
						}
					}
					if (this.mixedColors) this.ctx.stroke();
				}
				if (!this.mixedColors) this.ctx.stroke();
				if (this.drawBackground)
					this.drawBkg(x, y);
			}
			// if (this.mirror) this.ctx.restore();
		}
	}

	drawBkg(x, y) {
		if (!this.mixedColors)
			this.ctx.beginPath();
		for (let i = 0; i < this.frames[this.currentFrameRounded].length; i++) {
			const frm = this.frames[this.currentFrameRounded][i];
			const drw = this.drawings[frm.d];
			if (mixedColors)
				this.ctx.beginPath();
			for (let h = frm.i; h < frm.e; h++) {
				const line = drw.l[h]; // line data
				if (line && line.e) {
					const v = new Cool.Vector(line.e.x, line.e.y);
					this.ctx.lineTo(
						x + this.widthRatio * (line.s.x + Cool.random(-this.jiggle, this.jiggle)), 
						y + this.heightRatio * (line.s.y + Cool.random(-this.jiggle, this.jiggle)) 
					);
					if (this.ctx.fillStyle.replace("#","") != drw.c) {
						this.ctx.fillStyle = "#" + drw.c;
					}
				}
			}
			if (this.mixedColors) {
				this.ctx.closePath();
				this.ctx.fill();
			}
		}
		if (!this.mixedColors)
			this.ctx.fill();
	}

	stop() {
		this.isPlaying = false;
	}

	start() {
		this.isPlaying = true;
	}
}