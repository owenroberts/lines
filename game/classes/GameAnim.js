class GameAnim extends LinesAnimation {
	constructor(debug) {
		super(GAME.ctx, GAME.lps, GAME.mixedColors);
		this.debug = debug;
		this.loop = true;
		this.randomFrames = false; /* play random frames */
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

	set state(state) {
		if (this._state != state && this.states[state]) {
			this._state = state;
			if (this.currentState) this.frame = this.currentState.start;
			if (!this.isPlaying && state != 'default') this.isPlaying = true; 
		}
	}

	get state() {
		return this._state;
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