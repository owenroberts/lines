class UISequence extends UICollection {
	constructor(params) {
		super(params);
		this.name = params.name;
		this.clips = [];
	}

	addClip(clip) {
		this.clips.push(clip);
		this.add(clip);
	}

	removeClip(clip) {
		const index = this.clips.indexOf(clip);
		this.clips.splice(index, 1);
		this.remove(clip);
	}

	show() {
		this.setProp('display', 'flex');
	}

	hide() {
		this.setProp('display', 'none');
	}

	getEndFrame() {
		if (this.clips.length === 0) return 0;
		let endFrame = 0;
		this.clips.forEach(clip => { endFrame += clip.duration; });
		return endFrame;
	}

	getFrame(currentFrame) {
		let frame = currentFrame;
		for (let i = 0; i < this.clips.length; i++) {
			if (frame < this.clips[i].duration) {
				return this.clips[i].getFrame(frame);
				break;
			} else {
				frame -= this.clips[i].duration;
			}
		}
	}

	getData() {
		return this.clips.map(clip => clip.getData());
	}
}