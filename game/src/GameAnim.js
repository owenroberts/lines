const { Animation } = window.Lines;

class GameAnim extends Animation {
	constructor(debug) {
		const { dps, multiColor } = GAME.renderer.getProps();
		super(GAME.renderer.ctx, dps, multiColor);
		this.debug = debug;
		this.loop = true;
		this.randomFrames = false; /* play random frames */
		this.prevFrame = 0;
		this.frames = [];
	}

	update() { /* too many things to stick in onPlayedState etc */
		if (this.isPlaying) {
			if (this.drawCount == this.drawsPerFrame) {
				if (this.randomFrames) {
					while (this.prevFrame === this.currentFrame) {
						this.currentFrame = Cool.randomInt(this.state.start, this.state.end);
					}
					this.prevFrame = this.currentFrame;
				} else if (this.currentFrame >= this.state.end) {
					this.currentFrame = this.loop ? this.state.start : this.state.end;
					if (this.onPlayedOnce) {
						this.onPlayedOnce();
						this.onPlayedOnce = undefined;
					}
					if (this.onPlayedState) this.onPlayedState();
				} else {
					this.currentFrame++;
				}
				this.drawCount = 0;
			}
			this.drawCount++;
			if (this.onUpdate) this.onUpdate();
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

	playStateCheck() {
		if (this.state.start != this.state.end) this.isPlaying = true;
	}

	set state(state) {
		if (this._state !== state && this.states[state]) {
			this._state = state;
			if (this.state) this.frame = this.state.start;
			if (!this.isPlaying && state !== 'default') this.isPlaying = true; 
		}
	}

	get state() {
		return this.states[this._state];
	}

	playOnce(callback) {
		if (!this.isPlaying) this.isPlaying = true;
		this.frame = this.state.start;
		this.onPlayedOnce = callback;
	}

	loadData(json, callback) {
		super.loadData(json, callback);
		this.setFrames();
	}

	setFrames() {
		for (let i = 0, len = this.layers.length; i < len; i++) {
			const layer = this.layers[i];
			for (let j = layer.startFrame; j <= layer.endFrame; j++) {
				if (!this.frames[j]) this.frames[j] = [];
				this.frames[j].push(i);
			}
		}
	}

	getLayers() {
		// current frame is -1 how?
		if (this.currentFrame < 0) {
			console.log('current frame', this.currentFrame, this);
			return false;
		}
		const indexes = this.frames[this.currentFrame];
		if (!indexes) console.log(this);
		const layers = [];
		for (let i = 0; i < indexes.length; i++) {
			layers.push(this.layers[indexes[i]]);
		}
		return layers;
	}
}

window.LinesEngine.GameAnim = GameAnim;