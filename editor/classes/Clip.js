class Clip {
	constructor(params) {
		this.name = params.name;
		this.filePath = params.filePath;
		this.animation = params.animation;
		this.startFrame = params.startFrame;
		this.endFrame = params.startFrame + params.animation.endFrame;
		this.isVisible = true;
		this.state = 'default';
		this.animation.isPlaying = true;
	}

	update(frame) {
		// 
		// this.animation.update();
		// how to update frame??
		this.animation.frame = frame - this.startFrame;
	}

	draw() {
		this.animation.update();
		this.animation.draw();
	}

	get data() {
		return {
			name: this.name,
			filePath: this.filePath,
			startFrame: this.startFrame,
			isVisible: this.isVisible,
			state: this.state,
		};
	}
}