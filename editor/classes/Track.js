class Track {
	constructor(params) {
		this.clips = [];
		if (params.clips) {
			params.clips.forEach(clip => {
				this.addClip(new Clip(clip));
			});
		}
		this.startFrame = params.startFrame || 0;
		this.label = params.label;
		this.isVisible = params.isVisible !== undefined ? params.isVisible : true;
		this.endFrame = this.calcEndFrame();
	}

	calcEndFrame() {
		if (this.clips.length === 0) return 0;
		this.endFrame = this.startFrame + Math.max(...this.clips.map(c => c.calcEndFrame()));
		return this.endFrame;
	}

	addClip(clip) {
		this.clips.push(clip);
		this.resetClips();
	}

	removeClip(clip) {
		const index = this.clips.indexOf(clip);
		this.clips.splice(index, 1);
		this.resetClips();
	}

	getClipIndex(currentFrame) {
		for (let i = 0; i < this.clips.length; i++) {
			if (currentFrame >= this.clips[i].startFrame && currentFrame <= this.clips[i].endFrame) {
				return i;
			} 
		}
	}

	resetClips() {
		for (let i = 1; i < this.clips.length; i++) {
			this.clips[i - 1].calcEndFrame();
			this.clips[i].startFrame = this.clips[i - 1].endFrame + 1;
		}
	}

	update(frame) {
		for (let i = 0; i < this.clips.length; i++) {
			const clip = this.clips[i];
			if (frame < clip.startFrame) continue;
			if (frame > clip.endFrame) continue;
			clip.update(frame - this.startFrame);
			break; // only one clip per track can be played
		}
	}

	draw(frame) {
		for (let i = 0; i < this.clips.length; i++) {
			if (!this.isVisible) continue;
			const clip = this.clips[i];
			if (!clip.isVisible) continue;
			if (frame < this.startFrame + clip.startFrame) continue;
			if (frame > this.startFrame + clip.endFrame) continue;
			clip.draw();
			break; // only one clip per track can be played
		}
	}

	get data() {
		const data = { 
			clips: this.clips.map(c => c.data),
			startFrame: this.startFrame,
			isVisible: this.isVisible,
		}
		if (this.label) data.label = this.label
		return data;
	}
}