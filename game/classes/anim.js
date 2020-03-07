class Anim extends Animation {
	constructor(src, callback, debug) {
		super(Game.ctx, Game.lps, Game.mixedColors);
		this.src = src;
		this.debug = debug;
		this.loaded = false;
		this.loop = true;
		this.randomFrames = false; /* play random frames */

		if (this.src) this.load(this.src, callback);
	}

	update() { /* too many things to stick in onPlayedState etc */
		if (this.isPlaying) {
			if (this.currentFrame <= this.currentState.end) {
				this.currentFrameCounter += this.intervalRatio;
				if (this.randomFrames && this.currentFrame != Math.floor(this.currentFrameCounter)) {
					const prevFrame = this.currentFrame;
					while (prevFrame == this.currentFrame) {
						this.frame = Cool.randomInt(this.currentState.start, this.currentState.end);
					}
				}
				this.currentFrame = Math.floor(this.currentFrameCounter);
				if (this.onUpdate) this.onUpdate();
			}
		}

		if (this.frame4 >= this.currentState.end + 1) { /* not DRY fuck me */
			if (this.loop) this.frame = this.currentState.start;
			else this.frame = this.currentState.end;
			if (this.onPlayedOnce) {
				this.onPlayedOnce();
				this.onPlayedOnce = undefined;
			}
			if (this.onPlayedState) this.onPlayedState();
		}
	}

	createNewState(label, start, end) {
		if (!this.states[label]) {
			this.states[label] = {
				start: start,
				end: end
			}
		}
		this.state = label; /* ? */
	}

	playOnce(callback) {
		if (!this.isPlaying) this.isPlaying = true;
		this.frame = this.currentState.start;
		this.onPlayedOnce = callback;
	}

	stop() {
		this.isPlaying = false;
	}

	start() {
		this.isPlaying = true;
	}
}