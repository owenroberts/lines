function Capture() {
	const self = this;

	this.startCapture = true;
	this.prevCap = { n: '', f: 0 }; /* keeps track of image names */

	this.captureFrames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.captureWithBackground = true; /* default capture bg */
	this.capturing = false;

	this.capturingVideo = false;
	this.videoLoops = 0;

	/* k key */
	this.captureOne = function() {
		self.captureFrames = 1;
		self.setCapture();
	};

	/* shift k */
	this.captureMultiple = function() {
		self.captureFrames = prompt("Capture how many frames?");
		self.setCapture();
	};

	this.setCapture = function() {
		lns.anim.onDraw = function() {
			if (self.captureFrames > 0) {
				self.capture();
				self.captureFrames--;
				self.capturing = true;
			} else if (self.capturing) {
				self.capturing = false;
				self.captureWithBackground = false;
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
			}
		};
	};

	/* n key */
	this.toggleBGCapture = function() {
		self.captureWithBackground = !self.captureWithBackground;
	};

	/* ctrl-k - start at beginning and capture one of every frame */
	this.captureCycle = function() {
		lns.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = lns.anim.numFrames;
		lns.anim.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		self.captureFrames = lns.anim.numFrames * Math.max(1, lns.render.lps / lns.anim.fps);
		self.setCapture();
	};

	this.capture = function() {
		if (lns.files.saveFilesEnabled) {
			lns.canvas.canvas.toBlob(function(blob) {
				const title = lns.ui.fio.title.getValue(); // this is a UI
				const n = Cool.padNumber(lns.anim.currentFrame, 3);
				let frm = 0;
				let fileName = `${title}-${n}-${frm}.png`;
				if (n == self.prevCap.n) {
					frm = self.prevCap.f + 1;
					fileName = `${title}-${n}-${frm}.png`;
					self.prevCap.f = frm;
				}
				self.prevCap.n = n;

				const f = saveAs(blob, fileName);
				f.onwriteend = function() { 
					window.requestAnimFrame(() => {
						lns.render.update('cap'); 
					});
				};
					
			});
		} else {
			const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	};

	/* key? */
	this.startVideoCapture = function() {
		lns.anim.isPlaying = false;
		lns.anim.frame = 0;

		self.videoLoops = +prompt("Number of loops?");
		lns.anim.onPlayedState = function() {
			if (self.videoLoops > 1) {
				self.videoLoops--;
			} else if (self.capturingVideo) {
				self.videoCapture();
				self.capturingVideo = false;
				lns.anim.isPlaying = false;
				lns.anim.onPlayedState = undefined;
			}
		};
		self.capturingVideo = true
		self.captureWithBackground = true;
		self.videoCapture();
		
		lns.anim.isPlaying = true;
	};

	this.videoCapture = function() {
		if (self.startCapture) {
			self.startCapture = false;
			lns.render.videoCapture = true;
			self.stream = lns.canvas.canvas.captureStream();
			self.rec = new MediaRecorder(self.stream);
			self.rec.start();
			self.rec.addEventListener('dataavailable', e => {
				const blob = new Blob([ e.data ], { 'type': 'video/webm' });
				const url = URL.createObjectURL(blob);

				const a = document.createElement('a');
				document.body.appendChild(a);
				a.href = url;
				a.download = `${lns.ui.fio.title.getValue()}.webm` || 'lines.webm';
				a.click();
				// window.URL.revokeObjectURL(url);
			});
		} else {
			lns.render.videoCapture = false;
			self.startCapture = true;
			self.rec.stop();
		}
	};
}