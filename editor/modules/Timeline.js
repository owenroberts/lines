/*
	handles timeline and timeline data
*/

function Timeline(app) {
	Object.assign(Timeline.prototype, ModuleMixin);
	const self = this;
	
	this.activeComposition = 'default';
	this.addProp('composition', {
		get: () => { return app.compositions.get(self.activeComposition) },
		set: (value) => {
			// some checks ??
			self.activeComposition = value;
			self.drawUI();
		}
	});

	this.addClip = function(clip) {
		self.composition.track.addClip(clip);
		self.drawUI();
	};

	this.update = function(frame) {
		self.composition.update(frame);
	};

	this.draw = function(frame) {
		self.composition.draw(frame);
	};

	// set up ui
	let uiReady = false;
	let scale = 1;
	const frameWidthBases = [1, 5, 10, 20, 25, 50, 100, 200];
	let fBase = 1;

	this.addProp('scale', {
		get: () => { return scale; },
		set: value => {
			scale = +value;
			self.drawUI();
		}
	});

	this.drawUI = function() {
		self.panel.timeline.clear();
		const composition = self.composition;
		const { tracks } = composition;
		tracks.forEach(t => t.resetClips());
		self.panel.timeline.setProp('--num-tracks', tracks.length);

		const numFrames = composition.calcEndFrame();
		let w = self.panel.timeline.el.clientWidth - 136;
		w = Math.floor(w * scale);
		// console.log(w, )
		const minFrameWidth = 25;
		let fwbIndex = 0;
		while (w / (numFrames / frameWidthBases[fwbIndex]) < minFrameWidth) {
			fwbIndex++;
			if (fwbIndex >= frameWidthBases.length - 1) {
				console.warn('fuck need more pwidths');
				break;
			}
		}

		fBase = frameWidthBases[fwbIndex];
		let nFrames = Math.floor(numFrames / fBase);
		// let fWidth = Math.floor(Math.floor(w / nFrames) * scale);
		let fWidth = Math.floor(w / nFrames);

		self.panel.timeline.setProp('--num-frames', numFrames);

		// add frames 
		for (let i = 0; i <= numFrames; i += fBase) {
			// console.log(i);
			const id = 'frame-' + i;
			// console.log(i, i % fWidth);
			const frameBtn = new UIButton({
				type: "frame",
				text: i % frameWidthBases[fwbIndex] === 0 ? `${i}` : '',
				css: {
					gridColumnStart:  2 + (i),
					gridColumnEnd:  2 + (i + fBase),
					width: scale > 1 ? fWidth + 'px' : 'unset'
				},
				id: id,
				class: i == app.renderer.frame ? 'current-frame' : '',
				callback: () => {
					app.renderer.frame = i;
					self.updateUI();
				}
			});
			frameBtn.el.dataset.frameNumber = i;
			self.panel.timeline.append(frameBtn, id);
		}

		// add tracks
		for (let i = 0; i < tracks.length; i++) {
			const id = 'track-' + i;
			const track = tracks[i];
			const trackHead = new UITrack(track, { 
				index: i,
				class: 'track',
				css: {
					gridRowStart: 2,
					gridRowEnd: 2,
				}
			});
			self.panel.timeline.append(trackHead, id);

			// and clips
			const { clips } = track;
			for (let j = 0; j < clips.length; j++) {
				const clip = clips[j];
				const id = 'clip-' + clip.name;
				const clipUI = new UIClip(clip, {
					class: 'clip',
					css: {
						gridColumnStart: 2 + (track.startFrame + clip.startFrame),
						gridColumnEnd: 3 + (track.startFrame + clip.endFrame)
					},
					remove: () => {
						track.removeClip(clip);
						self.drawUI();
					},
					addClip: () => {
						let data = clip.data;
						data.animation = app.footage.get(data.name);
						self.addClip(new Clip(data));
						self.drawUI();
					},
					swap: () => {
						if (j === 0) return;
						let thisIdx = j;
						let swapIdx = j - 1;
						[track.clips[thisIdx], track.clips[swapIdx]] = [track.clips[swapIdx], track.clips[thisIdx]];
						track.clips[swapIdx].startFrame = 0;
						self.drawUI();
					},
					drawUI: self.drawUI
				});
				// console.log('clip endframe', clip.endFrame);
				self.panel.timeline.append(clipUI, id);
			}
		}

		uiReady = true;
	};

	this.updateUI = function(frame) {
		if (!uiReady) return;
		if (!frame) frame = app.renderer.frame;
		if (self.panel.timeline['frame-' + frame]) {
			const currentFrame = document.getElementsByClassName('current-frame');
			if (currentFrame[0]) currentFrame[0].classList.remove('current-frame');
			self.panel.timeline['frame-' + frame].addClass('current-frame');
		}
	};

	this.nextFrame = function(dir) {
		const currentFrame = document.getElementsByClassName('current-frame');
		if (currentFrame[0]) {
			let nf = +currentFrame[0].dataset.frameNumber + fBase * (dir);
			app.renderer.frame = nf;
			currentFrame[0].classList.remove('current-frame');
			self.panel.timeline['frame-' + app.renderer.frame].addClass('current-frame');
		}
	};

	this.nextClip = function(dir) {
		const clipIndex = app.timeline.composition.track.getClipIndex(app.renderer.frame);
		if (clipIndex + dir >= 0 && clipIndex + dir < app.timeline.composition.track.clips.length) {
			app.renderer.frame = app.timeline.composition.track.clips[clipIndex + dir].startFrame;
		}
		self.updateUI(Math.floor(app.renderer.frame / fBase) * fBase);
	};

}