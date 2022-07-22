function Capture(app, params) {
	Object.assign(Timeline.prototype, ModuleMixin);
	const self = this;

	this.videoBitsPerSecond = 8000000 * 2; // youtube 1080p hd
	this.isCapturing = false;
	const tempSettings = {}; // return to pre-capture settings

	this.start = function() {
		// app.renderer.isPlaying = false; -- need this? 
		app.renderer.frame = 0;
		app.ui.faces['videoCapture'].addClass('progress'); // replace with progress type
		app.renderer.updateFunc = function() {
			app.ui.faces['videoCapture'].setProp('--progress-percent', 
				Math.round(100 * app.renderer.frame / app.timeline.composition.endFrame)
			);
		};
		self.capture(true);
		app.renderer.isPlaying = true;
	};

	this.end = function() {
		self.rec.stop();
		app.ui.faces['videoCapture'].removeClass('progress');
		self.isCapturing = false;
		app.renderer.isPlaying = false;

		if (params.captureSettings) {
			for (const k in params.captureSettings) {
				app.ui.faces[k].update(tempSettings[k]);
			}
		}
	};

	this.capture = function(promptTitle) {
		if (!self.isCapturing) {

			// how does this connect to interface??
			if (params.captureSettings) {
				for (const k in params.captureSettings) {
					tempSettings[k] = app.ui.faces[k].value;
					app.ui.faces[k].update(self[k]);
				}
			}
			
			self.isCapturing = true;
			
			const stream = app.canvas.canvas.captureStream(app.renderer.dps);
			self.rec = new MediaRecorder(stream, {
				videoBitsPerSecond : self.videoBitsPerSecond,
				mimeType: 'video/webm;codecs=vp8,opus'
			});
			self.rec.start();
			self.rec.addEventListener('dataavailable', e => {
				const blob = new Blob([ e.data ], { 'type': 'video/webm' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				document.body.appendChild(a);
				a.href = url;
				// comp name
				if (promptTitle) t = prompt('Title?', 'comp name');
				a.download = `${t}.webm`;
				a.click();
			});
		}
	};

}