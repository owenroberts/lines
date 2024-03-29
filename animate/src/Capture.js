/*
	lines image and video capture
	prob needs to be lines/src -- use in player, game, sequencer etc.
	maybe not if sequence is part of animate
*/

function Capture(lns, params) {

	let useSequential = params.useSequentialNumbering || false;
	let frameNum = 0; // number of caps per frame of animation

	let videoBitsPerSecond = params.videoBitsPerSecond || 8000000; // youtube 1080p hd
	let isReady = true; /* ready to start */
	let prev = { f: undefined, n: 0 }; /* keeps track of image names */

	// frameCount or something
	let frames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	let bg = true; /*  n key  default capture bg */
	// let isCapturing = false;
	let cycleCount = params.cycleCount || 1;

	let isVideo = false;
	let videoLoops = 0;
	let videoFrames = 0;
	let recording;
	let lineWidth = params.captureSettings.lineWidth || lns.canvas.getLineWidth();
	let canvasScale = params.captureSettings.canvasScale || lns.canvas.getScale();
	let saveFilesEnabled = window.File && window.FileReader && window.FileList && window.Blob;

	let videoFrameButton, videoFramesButton, videoLoopButton;

	/* better names */

	let tempSettings = {};
	function setCaptureSettings() {
		if (params.captureSettings) {
			tempSettings.lineWidth = lns.ui.faces.lineWidth.value;
			tempSettings.canvasScale = lns.ui.faces.canvasScale.value;
			lns.ui.faces.canvasScale.update(canvasScale);
			lns.ui.faces.lineWidth.update(lineWidth);
			lns.playback.update(); // reset
		}
	}

	function unsetCaptureSettings() {
		console.log(tempSettings);
		lns.ui.faces.lineWidth.update(tempSettings.lineWidth);
		lns.ui.faces.canvasScale.update(tempSettings.canvasScale);
	}
	
	function one() {
		frames = 1;
		setCaptureSettings();
		start();
	} /* k key */

	function multiple() {
		setCaptureSettings();
		frames = +prompt("Capture how many frames?", 24);
		start(false);
	} /* shift k */

	/* put capture code in callback */
	function start(advanceFrame) {
		lns.renderer.suspend();
		let waitFrame = true; // wait once so render isn't called twice
		frameNum = 0;

		lns.anim.onDraw = function() {
			if (waitFrame) {
				waitFrame = false;
				window.requestAnimFrame(() => {
					lns.renderer.update('capture'); 
				});
				// console.log('wait');  // seems to work
				return;
			}
			if (frames > 0) {
				capture();
				frames--;
			} 
			else {
				unsetCaptureSettings();
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
				lns.renderer.start();
			}
		};
	}

	// make progress buttn
	function cycle() {
		lns.draw.reset();
		setCaptureSettings();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = lns.anim.state.start;
		lns.anim.isPlaying = true;	
		// capture as many frames as necessary for lines ratio or 1 of every frame
		frames = lns.anim.endFrame * Math.max(1, lns.anim.dpf) * cycleCount;
		start(true);
	} /* ctrl-k - start at beginning and capture one of every frame */

	function capture() {
		if (saveFilesEnabled) { // face or getter
			// console.log('start cap');
			lns.canvas.canvas.toBlob(blob =>  {
				const title = lns.fio.getTitle(); // this is a UI
				const frm = Cool.padNumber(lns.anim.currentFrame, 3);

				let fileName;
				if (useSequential) {
					fileName = `${title}-${Cool.padNumber(frameNum, 4)}.png`;
					frameNum++;
				} else {
					if (frm === prev.f) prev.n += 1;
					else prev.n = 0;

					fileName = `${title}-${frm}-${prev.n}.png`;
					prev.f = frm;
				}

				const f = saveAs(blob, fileName);
				// console.log('save as');
				f.onwriteend = function() { 
					// console.log('on write end');
					setTimeout(() => {
						// console.log('blob timeout');
						window.requestAnimFrame(() => {
							lns.renderer.update('capture'); 
						});
					}, 100); // delay fixes bug where is stops after 10-12 frames
				};
			});
		} else {
			// does this ever happen?
			const cap = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	}
	
	function videoLoop() {

		// lns.anim.isPlaying = false;
		lns.anim.frame = 0;
		videoLoops = +prompt("Number of loops?", 1);

		lns.anim.onDraw = function() {
			videoLoopButton.setProp('--progress-percent', 
				Math.round(100 * lns.anim.currentFrame / lns.anim.endFrame)
			);
		};

		lns.anim.onPlayedState = function() {
			if (videoLoops > 1) {
				videoLoops--;
			} else if (isVideo) {
				stopVideo();
				isVideo = false;
				lns.anim.isPlaying = false;
				lns.anim.onPlayedState = undefined;
				videoLoopButton.setProp('--progress-percent', 0);
				lns.anim.onDraw = undefined;
			}
		};

		startVideo(false, () => {
			lns.anim.isPlaying = true;
		});
	} /* key? */

	function startVideoFrames(recordEachFrame) {
		let numFrames = +prompt('Number of frames?', 48);

		videoFrames = numFrames;
		lns.anim.isPlaying = false;
		if (recordEachFrame) lns.anim.frame = 0;
		startVideo(true); // start recording

		let btn = recordEachFrame ? videoFramesButton : videoFrameButton;

		lns.anim.onDraw = function() {
			if (videoFrames > 0) {
				videoFrames--;
				btn.setProp('--progress-percent', 
					Math.round(100 * (1 - (videoFrames / numFrames)))
				);
			} else if (isVideo) {
				stopVideo(); // stop recording
				if (recordEachFrame && lns.anim.currentFrame < lns.anim.endFrame) {
					videoFrames = numFrames;
					lns.playback.next(1); // next frame
					startVideo(true); // start recording
				} else {
					lns.anim.onDraw = undefined;
					btn.setProp('--progress-percent', 0);
				}
			}
		};
	}

	function stopVideo() {
		isVideo = false;
		isReady = true;
		recording.stop();
	}

	function startVideo(promptTitle, onDrawCallback) {
		if (isReady) {
			
			isReady = false;
			isVideo = true;
			setCaptureSettings();
			
			const stream = lns.canvas.canvas.captureStream(lns.renderer.getProps().dps);
			recording = new MediaRecorder(stream, {
				videoBitsPerSecond: videoBitsPerSecond,
				mimeType: 'video/webm;codecs=vp8,vp9,opus'
			});

			lns.anim.onDraw = function() {
				recording.start(); // wait one draw to start recording
				if (onDrawCallback) onDrawCallback();
				lns.anim.onDraw = undefined;
			};
			
			recording.addEventListener('dataavailable', e => {
				const blob = new Blob([ e.data ], { 'type': 'video/webm' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				document.body.appendChild(a);
				a.href = url;
				let t = `${lns.fio.getTitle()}` || 'lines';
				if (promptTitle) t = prompt('Title?', lns.fio.getTitle());
				a.download = `${t}.webm`;
				a.click();
				unsetCaptureSettings();
			});
		} 
	}

	function connect() {
		const panel = lns.ui.getPanel('capture');
		lns.ui.addCallbacks([
			{ callback: one, key: 'k', text: 'Frame', },
			{ callback: multiple, key: 'shift-k', text: 'Frames', },
			{ callback: cycle, key: 'ctrl-k', text: 'Cycle', },
		]);

		lns.ui.addProp('cycleCount', {
			type: 'UINumberStep',
			label: 'Cycle Count',
			value: cycleCount,
			callback: value => {
				cycleCount = value;
			}
		})
		
		videoFrameButton = lns.ui.addUI({ 
			row: true,
			type: 'UIButton',
			callback: startVideoFrames, 
			key: 'alt-j', 
			text: 'Video Frame', 
			args: [false], 
			class: 'progress',
		});
		
		videoFramesButton = lns.ui.addUI({
			type: 'UIButton',
			callback: startVideoFrames,
			key: 'alt-j', 
			text: 'Video Frames', 
			args: [true],
			class: 'progress',
		});

		videoLoopButton = lns.ui.addUI({ 
			type: 'UIButton',
			callback: videoLoop, 
			key: 'j', 
			text: 'Video Loops', 
			class: 'progress' 
		});

		lns.ui.addUIs([
			{
				value: false,
				key: 'alt-k',
				onText: 'Stop Video',
				offText: 'Start Video',
				callback: value => { 
					if (value) startVideo(); 
					else stopVideo();
				}
			},
		]);

		lns.ui.addProps({
			'withBackground': {
				type: 'UIToggleCheck', 
				value: bg, 
				row: true,
				key: 'shift-b', 
				label: 'With BG', // turn toggle text into array
				callback: value => { bg = value; }
			},
		});

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
				label: 'Line Width',
				callback: value => { lineWidth = value; }
			},
			'captureCanvasScale': {
				value: canvasScale,
				label: 'Canvas Scale',
				callback: value => { canvasScale = value; }
			},
		});
	}

	return { 
		connect, startVideo, stopVideo,
		withBackground() { return bg; },
		isVideo() { return isVideo; },
		isCapturing() { return frames > 0; },
		isActive() { return isVideo || frames > 0; },
	};
}