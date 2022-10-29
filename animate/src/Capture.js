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

	let isVideo = false;
	let videoLoops = 0;
	let videoFrames = 0;
	let rec;
	let lineWidth = params.captureSettings.lineWidth || lns.canvas.getLineWidth();
	let canvasScale = params.captureSettings.canvasScale || lns.canvas.getScale();
	let saveFilesEnabled = window.File && window.FileReader && window.FileList && window.Blob;

	let videoFrameButton, videoFramesButton, videoLoopButton;

	/* better names */
	
	function one() {
		frames = 1;
		start();
	} /* k key */

	function multiple() {
		frames = +prompt("Capture how many frames?");
		start();
	} /* shift k */

	/* put capture code in callback */
	function start() {
		lns.renderer.suspend();
		frameNum = 0;
		lns.anim.onDraw = function() {
			if (frames > 0) {
				capture();
				frames--;
			} 
			else {
				lns.anim.isPlaying = false;
				lns.anim.onDraw = undefined;
				lns.renderer.start();
			}
		};
	}

	// make progress buttn
	function cycle() {
		lns.draw.reset();
		/* set animation to last frame because it updates frames before draw */
		lns.anim.frame = lns.anim.endFrame;
		lns.anim.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame
		frames = lns.anim.endFrame * Math.max(1, lns.renderer.getProps().dps / lns.anim.fps) + 1;
		start();
	} /* ctrl-k - start at beginning and capture one of every frame */

	function capture() {
		if (saveFilesEnabled) { // face or getter
			lns.canvas.canvas.toBlob(blob =>  {
				const title = lns.ui.faces.title.value; // this is a UI
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
				f.onwriteend = function() { 
					setTimeout(() => {
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

		lns.anim.isPlaying = false;
		lns.anim.frame = 0;
		videoLoops = +prompt("Number of loops?", 1);

		lns.anim.onDraw = function() {
			videoLoopButton.setProp('--progress-percent', 
				Math.round(100 * lns.anim.currentFrame / lns.anim.endFrame)
			);
		}

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
		isVideo = true;
		bg = true;
		startVideo();
		
		lns.anim.isPlaying = true;
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
		rec.stop();
	}

	function startVideo(promptTitle) {
		if (isReady) {
			let tempSettings = {};
			if (params.captureSettings) {
				tempSettings.lineWidth = lns.ui.faces.lineWidth.value;
				tempSettings.canvasScale = lns.ui.faces.canvasScale.value;

				lns.ui.faces.lineWidth.update(lineWidth);
				lns.ui.faces.canvasScale.update(canvasScale);
			}
			isReady = false;
			isVideo = true;
			const stream = lns.canvas.canvas.captureStream(lns.renderer.getProps().dps);
			rec = new MediaRecorder(stream, {
				videoBitsPerSecond : videoBitsPerSecond,
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
				lns.ui.faces.lineWidth.update(tempSettings.lineWidth);
				lns.ui.faces.canvasScale.update(tempSettings.canvasScale);
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
				callback: value => { lineWidth = value; }
			},
			'captureCanvasScale': {
				value: canvasScale,
				callback: value => { canvasScale = value; }
			},
		});
	}

	return { 
		connect,
		withBackground() { return bg; },
		isVideo() { return isVideo; },
		isCapturing() { return frames > 0; },
	};
}