function Capture(params) {
	const self = this;

	let useSequential = params.useSequentialNumbering || false;
	let frameNum = 0;

	this.videoBitsPerSecond = 8000000; // youtube 1080p hd
	this.isReady = true; /* ready to start */
	this.prev = { f: undefined, n: 0 }; /* keeps track of image names */

	this.frames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.bg = true; /*  n key  default capture bg */
	this.isCapturing = false;

	this.isVideo = false;
	let videoLoops = 0;
	this.lineWidth = params.captureSettings.lineWidth || lns.canvas.lineWidth;
	this.canvasScale = params.captureSettings.canvasScale || lns.canvas.scale;
	
	this.one = function() {
		self.frames = 1;
		self.start();
	}; /* k key */

	this.multiple = function() {
		self.frames = +prompt("Capture how many frames?");
		self.start();
	}; /* shift k */

	this.start = function() {
		frameNum = 0;
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

				let fileName;
				if (useSequential) {
					fileName = `${title}-${Cool.padNumber(frameNum, 4)}.png`;
					frameNum++;
				} else {
					if (frm === self.prev.f) self.prev.n += 1;
					else self.prev.n = 0;

					fileName = `${title}-${frm}-${self.prev.n}.png`;
					self.prev.f = frm;
				}

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
	
	this.videoLoop = function() {

		lns.anim.isPlaying = false;
		lns.anim.frame = 0;

		lns.ui.faces['videoLoop'].addClass('progress');

		videoLoops = +prompt("Number of loops?", 1);

		lns.anim.onDraw = function() {
			lns.ui.faces['videoLoop'].setProp('--progress-percent', 
				Math.round(100 * lns.anim.currentFrame / lns.anim.endFrame)
			);
		}

		lns.anim.onPlayedState = function() {
			if (videoLoops > 1) {
				videoLoops--;
				
			} else if (self.isVideo) {
				self.video();
				self.isVideo = false;
				lns.anim.isPlaying = false;
				lns.anim.onPlayedState = undefined;
				lns.ui.faces['videoLoop'].removeClass('progress');
				lns.anim.onDraw = undefined;
			}
		};
		self.isVideo = true;
		self.bg = true;
		self.video();
		
		lns.anim.isPlaying = true;
	}; /* key? */

	this.videoFrames = function(recordEachFrame) {
		let numFrames = +prompt('Number of frames?', 48);

		self.frames = numFrames;
		lns.anim.isPlaying = false;
		if (recordEachFrame) lns.anim.frame = 0;
		self.video(true); // start recording

		const faceProp = 'videoFrame' + recordEachFrame ? 's' : '';
		lns.ui.faces[faceProp].addClass('progress');

		lns.anim.onDraw = function() {
			if (self.frames > 0) {
				self.frames--;
				lns.ui.faces[faceProp].setProp('--progress-percent', 
					Math.round(100 * (1 - (self.frames / numFrames)))
				);
			} else if (self.isVideo) {
				self.video(); // stop recording
				if (recordEachFrame && lns.anim.currentFrame < lns.anim.endFrame) {
					self.frames = numFrames;
					lns.ui.play.next(1); // next frame
					self.video(true); // start recording
				} else {
					lns.anim.onDraw = undefined;
					lns.ui.faces[faceProp].removeClass('progress');
				}
			}
		};
	};

	this.video = function(promptTitle) {
		// start video 		
		if (self.isReady) {
			if (params.captureSettings) {
				for (const k in params.captureSettings) {
					lns.ui.faces[k].update(self[k])
				}
			}
			lns.ui.faces.onionSkinIsVisible.update(false);
			self.isReady = false;
			self.isVideo = true;
			const stream = lns.canvas.canvas.captureStream(lns.render.dps);
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
				let t = `${lns.ui.faces.title.value}` || 'lines';
				if (promptTitle) t = prompt('Title?', lns.ui.faces.title.value);
				a.download = `${t}.webm`;
				a.click();
			});
		// end video	
		} else {
			self.isVideo = false;
			self.isReady = true;
			self.rec.stop();
		}
	};
}