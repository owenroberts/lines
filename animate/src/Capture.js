/*
	lines image and video capture
	prob needs to be lines/src -- use in player, game, sequencer etc.
	maybe not if sequence is part of animate
*/

function Capture(lns, params) {

	let useSequential = params.useSequentialNumbering || false;
	let frameNum = 0;

	let videoBitsPerSecond = params.videoBitsPerSecond || 8000000; // youtube 1080p hd
	let isReady = true; /* ready to start */
	let prev = { f: undefined, n: 0 }; /* keeps track of image names */

	// frameCount or something
	let frames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	let bg = true; /*  n key  default capture bg */
	let isCapturing = false;

	let isVideo = false;
	let videoLoops = 0;
	let rec;
	let lineWidth = params.captureSettings.lineWidth || lns.canvas.lineWidth;
	let canvasScale = params.captureSettings.canvasScale || lns.canvas.scale;

	/* better names */
	
	function one() {
		frames = 1;
		start();
	} /* k key */

	function multiple() {
		self.frames = +prompt("Capture how many frames?");
		self.start();
	} /* shift k */

	/* put capture code in callback */
	function start() {
		frameNum = 0;
		lns.anim.onDraw = function() {
			if (frames > 0) {
				capture();
				frames--;
				isCapturing = true;
			} else if (self.isCapturing) {
				isCapturing = false;
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
			}
		};
	}

	function cycle() {
		lns.draw.reset();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = lns.anim.endFrame;
		lns.anim.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		frames = lns.anim.endFrame * Math.max(1, lns.render.dps / lns.anim.fps) + 1;
		start();
	} /* ctrl-k - start at beginning and capture one of every frame */

	function capture() {
		if (lns.files.saveFilesEnabled) { // face or getter
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
			// does this ever happen?
			const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	}
	
	function videoLoop() {

		lns.anim.isPlaying = false;
		lns.anim.frame = 0;

		lns.ui.faces['videoLoop'].addClass('progress'); // create progress btn

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
		isVideo = true;
		bg = true;
		video();
		
		lns.anim.isPlaying = true;
	} /* key? */

	function videoFrames(recordEachFrame) {
		let numFrames = +prompt('Number of frames?', 48);

		frames = numFrames;
		lns.anim.isPlaying = false;
		if (recordEachFrame) lns.anim.frame = 0;
		video(true); // start recording

		const faceProp = 'videoFrame' + (recordEachFrame ? 's' : '');
		lns.ui.faces[faceProp].addClass('progress');

		lns.anim.onDraw = function() {
			if (frames > 0) {
				frames--;
				lns.ui.faces[faceProp].setProp('--progress-percent', 
					Math.round(100 * (1 - (frames / numFrames)))
				);
			} else if (isVideo) {
				video(); // stop recording
				if (recordEachFrame && lns.anim.currentFrame < lns.anim.endFrame) {
					frames = numFrames;
					lns.ui.play.next(1); // next frame
					video(true); // start recording
				} else {
					lns.anim.onDraw = undefined;
					lns.ui.faces[faceProp].removeClass('progress');
				}
			}
		};
	}

	// start video or something 
	function video(promptTitle) {
		// start video 		
		if (isReady) {
			if (params.captureSettings) {
				for (const k in params.captureSettings) {
					lns.ui.faces[k].update(self[k]);
				}
			}
			lns.ui.faces.onionSkinIsVisible.update(false);
			isReady = false;
			isVideo = true;
			const stream = lns.canvas.canvas.captureStream(lns.render.dps);
			rec = new MediaRecorder(stream, {
				videoBitsPerSecond : self.videoBitsPerSecond,
				mimeType: 'video/webm;codecs=vp8,opus'
			});
			rec.start();
			rec.addEventListener('dataavailable', e => {
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
			isVideo = false;
			isReady = true;
			rec.stop();
		}
	}

	function connect() {
		const panel = lns.ui.getPanel('capture');
		lns.ui.addCallbacks([
			{ callback: one, key: 'k', text: 'Frame', },
			{ callback: multiple, key: 'shift-k', text: 'Frames', },
			{ callback: cycle, key: 'ctrl-k', text: 'Cycle', },
			{ callback: videoFrames, key: 'alt-j', text: 'Video Frames', args: [true], row: true },
			{ callback: videoLoop, key: 'j', text: 'Video Loops', class: 'progress' },
		]);

		lns.ui.addUIs([
			{
				value: false,
				key: 'alt-k',
				onText: 'Start Video',
				offText: 'Stop Video',
				callback: () => { video(); }
			},
			{ 
				value: bg, 
				row: true,
				key: 'shift-b', 
				onText: 'With BG', // turn toggle text into array
				offText: 'No BG', 
				callback: value => { bg = value; }
			},
		]);

		panel.addRow();
		panel.add(new UILabel({ text: 'Capture Settings' }));

		lns.ui.addProps({
			'videoBitsPerSecond': {
				value: videoBitsPerSecond,
				label: 'Bitrate',
				callback: value => { videoBitsPerSecond = value; },
			},
			'captureLineWidth': {
				value: lineWidth,
				callback: value => { lineWidth = value; }
			},
			'captureCanvasScale': {
				value: canvasScale,
				callback: value => { canvasScale = value; }
			},
		});
	}

	return { connect };
}