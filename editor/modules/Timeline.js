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
	const frameWidthBases = [1, 5, 10, 20, 25, 50, 100];

	this.drawUI = function() {
		self.panel.timeline.clear();
		const composition = self.composition;
		const { tracks } = composition;
		tracks.forEach(t => t.resetClips());
		self.panel.timeline.setProp('--num-tracks', tracks.length);


		const numFrames = composition.calcEndFrame();
		

		const w = self.panel.timeline.el.clientWidth - 100;
		const minFrameWidth = 25;
		const maxDisplayWidth = w / minFrameWidth;
		// const frameWidthMin = numFrames / maxDisplayWidth;
		let fwbIndex = 0;
		while (w / (numFrames / frameWidthBases[fwbIndex]) < minFrameWidth) {
			// console.log(w, numFrames, frameWidthBases[fwbIndex], numFrames / frameWidthBases[fwbIndex], w / (numFrames / frameWidthBases[fwbIndex]));
			fwbIndex++;
			if (fwbIndex >= frameWidthBases.length - 1) {
				console.warn('fuck need more pwidths');
				break;
			}
		}
		let nFrames = Math.floor(numFrames / frameWidthBases[fwbIndex]);
		let fWidth = Math.floor(w / nFrames);
		console.log(numFrames, frameWidthBases[fwbIndex], nFrames, fWidth);

		self.panel.timeline.setProp('--num-frames', nFrames);

		// add frames 
		for (let i = 0; i <= numFrames; i += frameWidthBases[fwbIndex]) {
			// console.log(i);
			const id = 'frame-' + i;
			// console.log(i, i % fWidth);
			const frameBtn = new UIButton({
				type: "frame",
				text: i % frameWidthBases[fwbIndex] === 0 ? `${i}` : '',
				css: {
					gridColumnStart:  2 + (i * 2),
					gridColumnEnd:  4 + (i * 2),
					width: fWidth + 'px',
				},
				id: id,
				class: i == app.renderer.frame ? 'current-frame' : '',
				callback: () => {
					app.renderer.frame = i;
					self.updateUI();
				}
			});
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
						gridColumnStart: 2 + (track.startFrame + clip.startFrame) * 2,
						gridColumnEnd: 4 + (track.startFrame + clip.endFrame) * 2
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

	this.updateUI = function() {
		if (!uiReady) return;
		if (self.panel.timeline['frame-' + app.renderer.frame]) {
			const currentFrame = document.getElementsByClassName('current-frame');
			if (currentFrame[0]) {
				console.log(currentFrame);
				currentFrame[0].classList.remove('current-frame');
			}
			self.panel.timeline['frame-' + app.renderer.frame].addClass('current-frame');
		}
	};

}