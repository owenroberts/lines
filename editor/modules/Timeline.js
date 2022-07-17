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
		}
	});

	this.addClip = function(clip) {
		console.log(self.composition);
		self.composition.track.addClip(clip);
	};

	this.update = function(frame) {
		self.composition.update(frame);
	};

	this.draw = function() {
		self.composition.draw();
	};

}