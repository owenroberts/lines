function Capture() {
	const self = this;

	this.ready = true; /* ready to start */
	this.prev = { f: undefined, n: 0 }; /* keeps track of image names */

	this.frames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.bg = true; /*  n key  default capture bg */
	this.isCapturing = false;

	this.isVideo = false;
	this.videoLoops = 0;
	
	this.one = function() {
		self.frames = 1;
		self.start();
	}; /* k key */

	this.multiple = function() {
		self.frames = +prompt("Capture how many frames?");
		self.start();
	}; /* shift k */

	this.start = function() {
		lns.anim.onDraw = function() {
			if (self.frames > 0) {
				self.capture();
				self.frames--;
				self.isCapturing = true;
			} else if (self.isCapturing) {
				self.isCapturing = false;
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
			}
		};
	};

	this.cycle = function() {
		lns.draw.reset();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = lns.anim.endFrame;
		lns.anim.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		self.frames = lns.anim.endFrame * Math.max(1, lns.render.dps / lns.anim.fps) + 1;
		self.start();
	}; /* ctrl-k - start at beginning and capture one of every frame */

	this.capture = function() {
		if (lns.files.saveFilesEnabled) {
			lns.canvas.canvas.toBlob(blob =>  {
				const title = lns.ui.faces.title.value; // this is a UI
				const frm = Cool.padNumber(lns.anim.currentFrame, 3);

				
				if (frm == self.prev.f) self.prev.n += 1;
				else self.prev.n = 0;

				let fileName = `${title}-${frm}-${self.prev.n}.png`;
				self.prev.f = frm;

				const f = saveAs(blob, fileName);
				f.onwriteend = function() { 
					setTimeout(() => {
						window.requestAnimFrame(() => {
							lns.render.update('cap'); 
						});
					}, 100); // delay fixes bug where is stops after 10-12 frames
				};
					
			});
		} else {
			const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	};
	
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
	}; /* key? */

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
				a.download = `${lns.ui.faces.title.value}.webm` || 'lines.webm';
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