class Timeline {
	constructor(params) {
		this.tracks = []; // track of animations
		this.tracks.push(new Track()); // default first track
		this.activeTrackIndex = 0;
		this.isVisible = true;
	}

	addTrack() {
		this.tracks.push(new Track());
	}

	get track() {
		return this.tracks[this.activeTrackIndex];
	}

	set track(value) {
		this.activeTrackIndex = +value;
	}

	get endFrame() {
		// get last frame of everyting ....
	}

	update(frame) {
		for (let i = 0; i < this.tracks.length; i++) {
			this.tracks[i].update(frame);
		}
	}

	draw(frame) {
		for (let i = 0; i < this.tracks.length; i++) {
			this.tracks[i].draw(frame);
		}
	}
}