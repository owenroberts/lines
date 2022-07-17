class Track {
	constructor(params) {
		this.clips = [];
		if (params.clips) {
			params.clips.forEach(clip => {
				this.addClip(clip);
			});
		}
	}

	get endFrame() {
		// end frame of everyhing
	}

	addClip(clip) {
		this.clips.push(new Clip(clip));
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
		return {
			clips: this.clips.map(c => c.data),
		};
	}
}