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
	}

	get endFrame() {
		return this.startFrame + Math.max(...this.clips.map(c => c.endFrame));
	}

	addClip(clip) {
		this.clips.push(clip);
	}

	update(frame) {
		for (let i = 0; i < this.clips.length; i++) {
			const clip = this.clips[i];
			if (frame < clip.startFrame) continue;
			if (frame > clip.endFrame) continue;
			clip.update(frame);
			break; // only one clip per track can be played
		}
	}

	draw(frame) {
		for (let i = 0; i < this.clips.length; i++) {
			const clip = this.clips[i];
			if (frame < clip.startFrame) continue;
			if (frame > clip.endFrame) continue;
			clip.draw(frame);
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