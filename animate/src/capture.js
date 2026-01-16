/*
	lines image and video capture
	prob needs to be lines/src -- use in player, game, sequencer etc.
	maybe not if sequence is part of animate
*/

import { saveAs } from 'file-saver';
import { padNumber } from "../../../cool/cool.js";
import { UIPanel, UILabel } from '../../../oi/src/oi.js';

export class CapturePanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'capture', ui });

		this.anim = anim;
		this.renderer = renderer;

		this.useSequential = false;
		this.perFrameCount = 0; // number of caps per frame of animation

		this.bitrate = 8000000; // youtube 1080p hd -- videoBitsPerSecond
		this.isReady = true; /* ready to start */
		this.prevCapture = { frameNumber: -1, capCount: 0 }; /* keeps track of image names */

		this.frameCount = 0; 
		this.isWithBg = true; /*  n key  default capture bg */
		this.loopCount = 1;

		this.isVideo = false;
		this.videoLoopCount = 0;
		this.recorder;
		this.captureLineWidth = renderer.lineWidth;
		this.captureScale = renderer.scale;
		this.isSaveFilesEnabled = window.File && window.FileReader && window.FileList && window.Blob;
		this.tempSettings = {};

		this.addRef({
			obj: this,
			ref: "isWithBg",
			key: "shift-b",
		});

		this.addBreak();

		this.addButton({  
			obj: this,
			ref: "captureFrame",
			key: 'k', 
		});

		this.captureFramesButton = this.addButton({  
			obj: this,
			ref: "captureFrames", 
			key: 'shift-k', 
			class: "progress",
		});

		this.captureLoopButton = this.addButton({  
			obj: this,
			ref: "captureLoop",
			key: 'ctrl-k',
			class: "progress",
		});

		this.addBreak();

		this.addButton({
			// key: "alt-k",
			onText: "stop video",
			offText: "record video",
			callback: value => {
				if (value) this.startVideo();
				else this.stopVideo();
			}
		});

		this.videoLoopButton = this.addButton({
			obj: this,
			ref: "videoLoop",
			key: "j",
			class: "progress"
		});

		this.addRef({
			obj: this,
			ref: "videoLoopCount",
		});

		this.capFrameButton = this.addButton({
			obj: this,
			ref: "captureVideoFrame",
			key: "alt-j",
			class: "progress"
		});

		this.addBreak();

		this.addBreak();
		this.addLabel("capture settings");

		this.addRefs({ obj: this }, [
			{ ref: "bitrate", },
			{ ref: "captureLineWidth", },
			{ ref: "captureScale", },
		]);
	}

	setCaptureSettings() {
		this.tempSettings.lineWidth = this.renderer.lineWidth;
		this.tempSettings.scale = this.renderer.scale;
		this.ui.faces.lineWidth.update(this.captureLineWidth);
		this.ui.faces.scale.update(this.captureScale);
		this.ui.panels.playback.update(); // reset
	}

	unsetCaptureSettings() {
		this.ui.faces.lineWidth.update(this.tempSettings.lineWidth);
		this.ui.faces.scale.update(this.tempSettings.scale);
	}
	
	captureFrame() {
		this.frameCount = 1;
		this.setCaptureSettings();
		this.start();
	} 

	captureFrames() {
		this.setCaptureSettings();
		this.frameCount = +prompt("capture how many frames?", 24);
		this.start(false, this.captureFramesButton);
	}

	start(advanceFrame, progressButton) {
		let isWaitFrame = true; // wait once so render isn't called twice ... debug?
		this.perFrameCount = 0;
		let totalCount = this.frameCount;

		this.anim.onDraw = () => {

			if (isWaitFrame) {
				this.renderer.isSuspended = true;
				isWaitFrame = false;
				if (progressButton) {
					progressButton.setStyle('--progress-percent', 0);
				}
				window.requestAnimFrame(() => {
					this.renderer.update('capture'); 
				});
				return;
			}
			if (this.frameCount > 0) {
				this.capture();
				this.frameCount--;
				if (progressButton) {
					progressButton.setStyle('--progress-percent', 
						Math.round(100 * (1 - (this.frameCount / totalCount)))
					);
				}
			} else {
				this.unsetCaptureSettings();
				this.anim.isPlaying = false;
				this.anim.onDraw = undefined;
				this.renderer.start();
				if (progressButton) {
					progressButton.setStyle('--progress-percent', 0);
				}
			}
		};
	}

	// make progress buttn
	captureLoop() {
		this.ui.panels.styles.reset();
		this.setCaptureSettings();
		/* set animation to last frame because it updates frames before draw */
		this.anim.currentFrame = this.anim.clips.current.start; // *** fix with states (?)
		this.anim.isPlaying = true;	
		// capture as many frames as necessary for lines ratio or 1 of every frame
		this.frameCount = this.anim.endFrame * Math.max(1, this.anim.dpf) * this.loopCount;
		this.start(true, this.captureLoopButton);
	}

	capture() {
		if (this.isSaveFilesEnabled) {
			this.renderer.canvas.toBlob(blob =>  {
				const title = this.ui.faces.fileName.value; // title?
				const frameNumber = padNumber(this.anim.currentFrame, 3);

				let fileName;
				if (this.useSequential) {
					fileName = `${title}-${padNumber(this.perFrameCount, 4)}.png`;
					this.perFrameCount++;
				} else {
					if (frameNumber === this.prevCapture.frameNumber) {
						this.prevCapture.capCount += 1;
					} else {
						this.prevCapture.capCount = 0;
					}
					fileName = `${title}-${frameNumber}-${this.prevCapture.capCount}.png`;
					this.prevCapture.frameNumber = frameNumber;
				}
				saveAs(blob, fileName);
				
				setTimeout(() => {
					window.requestAnimFrame(() => {
						this.renderer.update('capture'); 
					});
				}, 100); 
				// delay fixes bug where is stops after 10-12 frames 
				// onwriteend is deprecated?
				// *** rewrite some day
				// set a timer? have to his reset ... 
			});
		} else {
			// *** does this ever happen?
			console.log("does this ever happen?")
			const cap = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	}
	
	videoLoop() {

		this.anim.currentFrame = 0;
		let loopCount = this.videoLoopCount;

		this.anim.onPlayedState = () => {
			if (loopCount > 1) {
				loopCount--;
			} else if (this.isVideo) {
				this.stopVideo();
				this.isVideo = false;
				this.anim.isPlaying = false;
				this.anim.onPlayedState = undefined;
				this.videoLoopButton.setStyle('--progress-percent', 0);
				this.anim.onDraw = undefined;
			}
		};

		this.startVideo(false, () => {
			this.anim.isPlaying = true;
			this.videoLoopButton.setStyle('--progress-percent', 
				Math.round(100 * this.anim.currentFrame / this.anim.endFrame)
			);
		});
	}

	captureVideoFrame() {
		this.anim.isPlaying = false;
		let numFrames = +prompt('number of frames?', 48);
		let frameCount = numFrames;
		// let button = isLoop ? this.capFramesButton : this.capFrameButton;
		// if (isLoop) this.anim.currentFrame = 0;
		let button = this.capFrameButton;
		this.startVideo(true, () => {
			if (frameCount > 0) {
				frameCount--;
				button.setStyle('--progress-percent', 
					Math.round(100 * (1 - (frameCount / numFrames)))
				);
			} else if (this.isVideo) {
				this.stopVideo(); // stop recorder
				// this.anim.onDraw = undefined;
				button.setStyle('--progress-percent', 0);
			}
		});
	}

	stopVideo() {
		this.isVideo = false;
		this.isReady = true;
		this.recorder.stop();
		this.anim.onDraw = undefined;
	}

	startVideo(promptTitle, onDrawCallback) {
		if (!this.isReady) return;
			
		this.isReady = false;
		this.isVideo = true;
		this.setCaptureSettings();
		
		const stream = this.renderer.canvas.captureStream(this.renderer.dps);
		this.recorder = new MediaRecorder(stream, {
			videoBitsPerSecond: this.bitrate,
			mimeType: 'video/webm;codecs=vp8,vp9,opus'
		});

		let isFirstDraw = true;
		this.anim.onDraw = () => {
			if (isFirstDraw) {
				isFirstDraw = false;
				this.recorder.start(); // wait one draw to start recorder
			}
			if (onDrawCallback) onDrawCallback();
		};

		this.recorder.addEventListener('dataavailable', e => {
			const blob = new Blob([ e.data ], { 'type': 'video/webm' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			let t = this.ui.faces.fileName.value ?? 'lines';
			if (promptTitle) t = prompt('title?', t);
			if (!promptTitle) return; 
			a.download = `${t}.webm`;
			a.click();
			this.unsetCaptureSettings();
		});
	}

	isCapturing() { 
		return this.isVideo || this.frameCount > 0; 
	}
}