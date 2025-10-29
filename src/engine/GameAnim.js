import { Anim } from '../Lines.js';

/**
 * game implementation of Anim
 * uses frames isntead of layers for drawing lookup for better performance
 * update separated for random playback (do i still use this?)
 * slightly different state get/set -- prob wanna kill these anyway
 */
export class GameAnim extends Anim {
	constructor(gm, debug) {
		super(gm.renderer);

		this.debug = debug;
		// this.loop = true;
		this.randomFrames = false; /* play random frames */
		this.prevFrame = 0;
		this.frames = [];
	}

	update() { /* too many things to stick in onPlayedState etc */
		if (!this.isPlaying) return;

		if (this.drawCount >= this.dpf - 1) {
			this.nextFrame();
			this.drawCount = 0;
		}
		this.drawCount++;
		if (this.onUpdate) this.onUpdate();
	}

	nextFrame() {
		if (this.randomFrames) {
			while (this.prevFrame === this.currentFrame) {
				this.currentFrame = Cool.randomInt(this.state.start, this.state.end);
			}
			this.prevFrame = this.currentFrame;
		} else {
			if (this.sequenceIndex >= 0) {
				this.nextClip(false);
			}
			let playedState = false;
			if (this.state.dir === 1) {
				if (this.currentFrame >= this.state.end) {
					this.currentFrame = this.state.loop ? this.state.start : this.state.end;
					playedState = true;
				} else {
					this.currentFrame++;
				}
			} else {
				if (this.currentFrame <= this.state.start) {
					this.currentFrame = this.loop ? this.state.end : this.state.start;
					playedState = true;
				} else {
					this.currentFrame--;
				}
			}


			if (playedState) {
				// do not loop in callback dummy
				if (this.onPlayedOnce) {
					this.onPlayedOnce();
					this.onPlayedOnce = undefined;
				}
				if (this.onPlayedState) this.onPlayedState();
				if (this.sequenceIndex >= 0) {
					this.nextClip(true);
				}
			}
		}
	}

	createNewState(label, start, end, dir=1) {
		if (!this.states[label]) {
			this.states[label] = { start, end, dir };
		}
		this.state = label; /* ? */
		// sets anim to state on create, probably dont need this right?
	}

	playStateCheck() {
		if (this.state.start != this.state.end) this.isPlaying = true;
	}

	set state(stateName) {
		if (this.stateName !== stateName && this.states[stateName]) {
			this.stateName = stateName;
			this.stateData = structuredClone(this.states[this.stateName]); // so state dir can overwrite
			if (this.state) {
				if (this.state.dir === 1) this.currentFrame = this.state.start;
				if (this.state.dir === -1) this.currentFrame = this.state.end;
			}
			if (!this.isPlaying && stateName !== 'default') this.isPlaying = true; // what is this for? 
		}
	}

	get state() {
		return this.stateData;
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
		if (this.currentFrame < 0) {
			// current frame is -1 how?
			// console.log('current frame', this.currentFrame, this);
			return false;
		}
		const indexes = this.frames[this.currentFrame] ?? [];
		const layers = [];
		for (let i = 0; i < indexes.length; i++) {
			layers.push(this.layers[indexes[i]]);
		}
		return layers;
	}

	getCurrentDrawing() {
		return this.drawings[this.layers[this.frames[this.currentFrame][0]].drawingIndex];
	}
}