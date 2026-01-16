import { Anim } from '../lines.js';

/**
 * game implementation of Anim
 * uses frames isntead of layers for drawing lookup for better performance
 * update separated for random playback (do i still use this?)
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

	update() { /* too many things to stick in onPlayedClip etc */
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
				this.currentFrame = Cool.randomInt(this.clips.current.start, this.clips.current.end);
			}
			this.prevFrame = this.currentFrame;
		} else {
			if (this.sequenceIndex >= 0) {
				this.nextClip(false);
			}
			let isClipDone = false;
			if (this.clips.current.dir === 1) {
				if (this.currentFrame >= this.clips.current.end) {
					this.currentFrame = this.clips.current.loop ? this.clips.current.start : this.clips.current.end;
					isClipDone = true;
				} else {
					this.currentFrame++;
				}
			} else {
				if (this.currentFrame <= this.clips.current.start) {
					this.currentFrame = this.loop ? this.clips.current.end : this.clips.current.start;
					isClipDone = true;
				} else {
					this.currentFrame--;
				}
			}


			if (isClipDone) {
				// do not loop in callback dummy
				if (this.onPlayedOnce) {
					this.onPlayedOnce();
					this.onPlayedOnce = undefined;
				}
				if (this.onPlayedClip) this.onPlayedClip();
				if (this.sequenceIndex >= 0) {
					this.nextClip(true);
				}
			}
		}
	}

	createNewClip(name, start, end, dir=1, loop=true) {
		if (!this.clips[name]) {
			this.clips.add(name, { start, end, dir, loop });
		}
	}

	playClipCheck() {
		if (this.clips.current.start != this.clips.current.end) {
			this.isPlaying = true;
		}
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
		this.currentFrame = this.clips.current.start;
		this.onPlayedOnce = callback;
	}

	onLoad() {
		// super.loadData(json, callback);
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