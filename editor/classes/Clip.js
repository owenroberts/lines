class Clip {
	constructor(params, dps) {
		if (!dps) dps = 30;
		this.name = params.name;
		this.filePath = params.filePath;
		this.animation = params.animation;
		this.startFrame = params.startFrame;
		this.isVisible = params.isVisible !== undefined ? params.isVisible : true;
		this.repeatCount = params.repeatCount || 1;
		this.state = params.state || 'default';
		this.dpf = params.dpf || this.animation.dpf;

		this.setup();
		this.endFrame = this.calcEndFrame();
		this.animation.isPlaying = true;
	}

	setup() {
		const state = this.animation.states[this.state];
		this.duration = state.end - state.start + 1;
	}

	calcEndFrame() {
		let f = this.duration * this.dpf * this.repeatCount;
		this.endFrame = this.startFrame + f - 1; // starts counting at 1
		return this.endFrame;
	}

	update(frame) {
		let f = frame - this.startFrame; // app frame - the start frame of clip
		f = Math.floor(f / this.dpf);
		f = f % this.duration; // cycle state
		this.animation.currentFrame = this.animation.states[this.state].start + f;
	}

	draw() {
		this.animation.draw();
	}

	get data() {
		return {
			name: this.name,
			filePath: this.filePath,
			startFrame: this.startFrame,
			isVisible: this.isVisible,
			state: this.state,
			repeatCount: this.repeatCount,
			dpf: this.dpf,
		};
	}
}