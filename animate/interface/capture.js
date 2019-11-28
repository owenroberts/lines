function Capture() {
	const self = this;

	this.ready = true; /* ready to start */
	this.prev = { n: '', f: 0 }; /* keeps track of image names */

	this.frames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.bg = true; /* default capture bg */
	this.isCapturing = false;

	this.isVideo = false;
	this.videoLoops = 0;

	/* k key */
	this.one = function() {
		self.frames = 1;
		self.start();
	};

	/* shift k */
	this.multiple = function() {
		self.frames = prompt("Capture how many frames?");
		self.start();
	};

	this.start = function() {
		lns.anim.onDraw = function() {
			if (self.frames > 0) {
				self.capture();
				self.frames--;
				self.isCapturing = true;
			} else if (self.isCapturing) {
				self.isCapturing = false;
				self.bg = false;
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
			}
		};
	};

	/* n key */
	this.toggleBG = function() {
		console.log(self.bg);
		self.bg = !self.bg;
		console.log(self.bg);

	};

	/* ctrl-k - start at beginning and capture one of every frame */
	this.cycle = function() {
		lns.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = 0;
		lns.anim.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		self.frames = lns.anim.endFrame * Math.max(1, lns.render.lps / lns.anim.fps);
		self.start();
	};

	this.capture = function() {
		if (lns.files.saveFilesEnabled) {
			lns.canvas.canvas.toBlob(function(blob) {
				const title = lns.ui.fio.title.value; // this is a UI
				const n = Cool.padNumber(lns.anim.currentFrame, 3);
				let frm = 0;
				let fileName = `${title}-${n}-${frm}.png`;
				if (n == self.prev.n) {
					frm = self.prev.f + 1;
					fileName = `${title}-${n}-${frm}.png`;
					self.prev.f = frm;
				}
				self.prev.n = n;

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
	this.startVideo = function() {
		lns.anim.isPlaying = false;
		lns.anim.frame = 0;

		self.videoLoops = +prompt("Number of loops?");
		lns.anim.onPlayedState = function() {
			if (self.videoLoops > 1) {
				self.videoLoops--;
			} else if (self.isVideo) {
				self.video();
				self.isVideo = false;
				lns.anim.isPlaying = false;
				lns.anim.onPlayedState = undefined;
			}
		};
		self.isVideo = true
		self.bg = true;
		self.video();
		
		lns.anim.isPlaying = true;
	};

	this.video = function() {
		if (self.ready) {
			self.ready = false;
			self.isVideo = true
			self.stream = lns.canvas.canvas.captureStream();
			self.rec = new MediaRecorder(self.stream);
			self.rec.start();
			self.rec.addEventListener('dataavailable', e => {
				const blob = new Blob([ e.data ], { 'type': 'video/webm' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				document.body.appendChild(a);
				a.href = url;
				a.download = `${lns.ui.fio.title.value}.webm` || 'lines.webm';
				a.click();
				// window.URL.revokeObjectURL(url);
			});
		} else {
			self.isVideo = false
			self.ready = true;
			self.rec.stop();
		}
	};
}