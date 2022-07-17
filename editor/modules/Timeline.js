/*
	handles timeline and timeline data
*/

function Timeline(app) {
	Object.assign(Timeline.prototype, ModuleMixin);
	const self = this;
	
	const activeComposition = 'default';
	this.addProp('composition', {
		get: () => { return app.compositions.get(activeComposition) },
		set: (value) => {
			// some checks ??
			activeComposition = value;
			self.panel.timeline.clear();
		}
	});

	this.addClip = function(clip) {
		self.composition.track.addClip(clip);
	};

	this.update = function(frame) {
		self.composition.update(frame);
	};

	this.draw = function() {
		self.composition.draw();
	};

	// set up ui
	const frameWidth = 10;

	this.addUI = function() {
		const composition = app.compositions.get(activeComposition);
		const endFrame = composition.endFrame;
		console.log(self.panel);
		self.panel.timeline.setProp('--num-frames', endFrame);
		
		// add frames 
		for (let i = 0; i < endFrame; i++) {
			const id = 'frame-' + i;
			const frameBtn = new UIButton({
				type: "frame",
				text: `${i}`,
				css: {
					gridColumnStart:  1 + (i * 2),
					gridColumnEnd:  3 + (i * 2)
				},
				class: i == app.renderer.frame ? 'current' : '',
				callback: () => {
					self.panel.timeline['frame-' + app.renderer.frame].removeClass('current');	
					app.renderer.frame = i;
					self.panel.timeline[id].addClass('current');
				}
			});
			self.panel.timeline.append(frameBtn, 'frame-' + i);
		}

	};


}