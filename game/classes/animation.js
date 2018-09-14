/* animation is the lines playing module, child of sprite obj */
class Animation {
	constructor(src, debug) {
		this.src = src;
		this.debug = debug;
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
		this.onePlay = false;
		this.frameCount = -1; // i guess this is set at beginning? set to 0 so it doesn't go through
		this.frameCountCounter = -1;  // floats

		this.state = 'default';
		this.states = { 'default': {start: 0, end: 0 } }

		this.randomFrames = false; /* play random frames */

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
			})
			.catch(error => { console.error(error) });
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
			this.frameCount = -1;  
		}
	}

	playOnce(callback) {
		if (!this.isPlaying)
			this.isPlaying = true;
		this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
		this.onPlayedOnce = callback;
		this.onePlay = true;
		// this.randomFrames = false;  /* need this? */
	}

	overrideProperty(prop, value) {
		this[prop] = value;
	}

	draw(x, y) {
		if (this.loaded && this.isPlaying) {
			if (this.mirror) {
				// Game.ctx.save();
				// Game.ctx.translate(this.width, 0);
				// Game.ctx.scale(-1,1);
			}
			if (this.frames[this.currentFrame]) {
				if (!Game.mixedColors) 
					Game.ctx.beginPath();
				for (let i = 0; i < this.frames[this.currentFrame].length; i++) {
					const fr = this.frames[this.currentFrame][i];
					const dr = this.drawings[fr.d];
					const jig = this.jig || +fr.r;
					const seg = this.seg || +fr.n;
					const wig = this.wig || +fr.w || 0; // or zero for older drawings for now 
					const wigSpeed = this.wigSpeed || +fr.v || 0;
					const off = {
						x: Cool.random(0, wig),
						xSpeed: Cool.random(-wigSpeed, wigSpeed),
						y: Cool.random(0, wig),
						ySpeed: Cool.random(-wigSpeed, wigSpeed)
					};
					if (Game.mixedColors || Game.debug || this.debug) 
						Game.ctx.beginPath();
					for (let h = fr.s; h < fr.e - 1; h++) {
						const s = dr[h]; // line data
						const e = dr[h + 1];
						let v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(seg); // line num
						Game.ctx.moveTo(
							x + this.widthRatio * (fr.x + s.x + Cool.random(-jig, jig)) + off.x, 
							y + this.heightRatio * (fr.y + s.y + Cool.random(-jig, jig)) + off.y 
						);
						for (let j = 0; j < seg; j++) {
							const p = new Cool.Vector(s.x + v.x * j, s.y + v.y * j);
							Game.ctx.lineTo( 
								x + this.widthRatio * (fr.x + p.x + v.x + Cool.random(-jig, jig)) + off.x, 
								y + this.heightRatio * (fr.y +  p.y + v.y + Cool.random(-jig, jig)) + off.y
							);
						}

						if (Game.mixedColors || Game.debug) {
							if (Game.ctx.strokeStyle.replace("#","") != fr.c)
								Game.ctx.strokeStyle = "#" + fr.c;
						}
						
					}
					if (Game.mixedColors || Game.debug || this.debug)
						Game.ctx.stroke();

					off.x += off.xSpeed;
					if (off.x >= wig || off.x <= -wig)
						off.xSpeed *= -1;

					off.y += off.ySpeed;
					if (off.y >= wig || off.y <= -wig)
						off.ySpeed *= -1;
				}
				if (!this.mixedColors) 
					Game.ctx.stroke();
				if (this.drawBackground)
					this.drawBkg(x, y);
			}
			// if (this.mirror) Game.ctx.restore();
		}
		this.updateFrame();
	}

	updateFrame() {
		if (this.debug) {
			// console.log(this.state, this.states[this.state])
			// console.log(this.currentFrame, this.currentFrameCounter, this.states[this.state].end);
		}

		if (this.currentFrame < this.states[this.state].end) {
			this.currentFrameCounter += this.intervalRatio;
			if (this.randomFrames && this.currentFrame != Math.floor(this.currentFrameCounter)) {
				this.currentFrame = this.currentFrameCounter =  Cool.randomInt(this.states[this.state].start, this.states[this.state].end - 1);
			} else {
				this.currentFrame = Math.floor(this.currentFrameCounter);
			}
		}

		if (this.currentFrameCounter >= this.states[this.state].end) {
			if (this.loop) {
				this.currentFrame = this.currentFrameCounter = this.states[this.state].start;
			} else {
				this.currentFrame = this.currentFrameCounter = this.states[this.state].end;
			}
			if (this.onePlay) {
				this.onePlay = false;
				if (this.isPlaying) {
					this.isPlaying = false;
				}
				if (this.onPlayedOnce) {
					this.onPlayedOnce();
				}
			} else {
				if (this.onPlayedState) {
					this.onPlayedState();
				}
			}
		}
	}

	drawBkg(x, y) {
		if (!this.mixedColors)
			Game.ctx.beginPath();
		for (let i = 0; i < this.frames[this.currentFrameRounded].length; i++) {
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