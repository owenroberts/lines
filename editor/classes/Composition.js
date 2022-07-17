class Composition {
	constructor(params) {
		this.tracks = []; // track of animations
		if (params.tracks) {
			params.tracks.forEach(track => {
				this.tracks.push(new Track(track));
			});
		} else {
			this.tracks.push(new Track({})); // default first track
		}
		this.activeTrackIndex = params.activeTrackIndex || 0;
		this.isVisible = params.isVisible !== undefined ? params.isVisible : true;
	}

	addTrack() {
		this.tracks.push(new Track());
	}

	addComposition(composition) {
		this.track.addComposition(composition);
	}

	get track() {
		return this.tracks[this.activeTrackIndex];
	}

	set track(value) {
		this.activeTrackIndex = +value;
	}

	get endFrame() {
		return Math.max(...this.tracks.map(t => t.endFrame));
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

	get data() {
		return { 
			tracks: this.tracks.map(t => t.data),
			activeTrackIndex: this.activeTrackIndex,
			isVisible: this.isVisible,
		};
	}
}