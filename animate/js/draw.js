function Draw() {
	const self = this;

	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fps = 10; // frames per second when playing
	this.lps = 10; // lines per second all the time
	
	this.interval = 1000/this.lps;  // fps per one second, the line interval
	this.timer = performance.now(); 
	this.intervalRatio = this.interval / (1000/this.fps);  // this starts same as lineInterval, written out to show math

	this.captureFrames = 0; // set by canvas, makes the draw loop capture canvas for a number of frames
	this.captureWithBackground = false;

	this.setFps = function(fps) {
		self.fps = fps;
		self.intervalRatio = self.interval / (1000/fps);
		self.fpsSelect.setValue(fps);
	}

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		Lines.currentFrame = self.currentFrameCounter = 0;
		self.isPlaying = false;
		Lines.canvas.ctx.miterLimit = 1;
		Lines.interface.updateFramesPanel();
	}

	/* toggle play animation */
	this.toggle = function() {
		if (!self.isPlaying) Lines.data.saveLines();
		self.isPlaying = !self.isPlaying;
		Lines.interface.updateFrameNum();
	}

	this.draw = function() {
		if (performance.now() > self.interval + self.timer) {
			self.timer = performance.now();
			/* calc current frame to draw */
			if (self.isPlaying && self.currentFrameCounter < Lines.frames.length) {
				self.currentFrameCounter += self.intervalRatio;
				Lines.currentFrame = Math.floor(self.currentFrameCounter);
			}
			if (self.isPlaying && self.currentFrameCounter >= Lines.frames.length) {
				Lines.currentFrame = self.currentFrameCounter = 0;
			}

			/* update the anim frame number */
			if (self.isPlaying) 
				Lines.interface.updateFrameNum();

			Lines.canvas.ctx.clearRect(0, 0, Lines.canvas.width, Lines.canvas.height);
			
			if (self.captureWithBackground && self.captureFrames > 0) {
				Lines.canvas.ctx.rect(0, 0, Lines.canvas.width, Lines.canvas.height);
				Lines.canvas.ctx.fillStyle = '#' + Lines.canvas.bgColor.color;
				Lines.canvas.ctx.fill();
			}

			if (self.background.img.src && self.background.show)
				Lines.canvas.ctx.drawImage(self.background.img, self.background.x, self.background.y, self.background.size, self.background.size/self.background.ratio);

			/* draws onionskin this is first so its under main lines */
			if (self.onionSkinNum > 0 && self.onionSkinOn) {
				for (let o = 1; o <= self.onionSkinNum; o++){
					const frameNumber = Lines.currentFrame - o;
					if (frameNumber >= 0) {
						const onionColor = 1.1 - (o / self.onionSkinNum); // number for color
						const color = "rgba(105,150,255," + onionColor + ")";
						for (var i = 0; i < Lines.frames[frameNumber].length; i++) {
							const fr = Lines.frames[frameNumber][i];
							const dr = Lines.drawings[fr.d];
							self.drawLines({
								lines: dr, 
								start: fr.s, 
								end: fr.e, 
								segNum: fr.n, 
								jig: fr.r,
								wig: fr.w,
								wigSpeed: fr.v,
								x: fr.x, 
								y: fr.y, 
								color: color,
								onion: true
							});
						}
					}
				}
			}

			/* draws saved frames */
			if (Lines.frames[Lines.currentFrame]) {
				for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
					const fr = Lines.frames[Lines.currentFrame][i];
					const dr = Lines.drawings[fr.d];
					self.drawLines({
						lines: dr, 
						start: fr.s, 
						end: fr.e, 
						segNum: fr.n, 
						jig: fr.r,
						wig: fr.w,
						wigSpeed: fr.v,
						x: fr.x, 
						y: fr.y, 
						color: fr.c,
						onion: false
					});
				}
			}

			/* draws current lines */
			if (Lines.lines.length > 0) {
				self.drawLines({
					lines: Lines.lines, 
					start: 0, 
					end: Lines.lines.length, 
					segNum: Lines.drawEvents.segNumRange, 
					jig: Lines.drawEvents.jiggleRange, 
					wig: Lines.drawEvents.wiggleRange, 
					wigSpeed: Lines.drawEvents.wiggleSpeed, 
					x: 0, 
					y: 0,
					onion: false, 
					color: Lines.lineColor.color
				});
			}

			/* capture frames */
			if (self.captureFrames > 0) {
				Lines.canvas.capture();
				self.captureFrames--;
			}
		}
		window.requestAnimFrame(self.draw);
	}

	/* jig = jiggle amount, seg = num segments */
	this.drawLines = function(params) {
		/* mixed color?  - assume always mixed? - care about performance? */
		Lines.canvas.ctx.beginPath();

		const off = {
			x: Cool.random(0, params.wig),
			xSpeed: Cool.random(-params.wigSpeed, params.wigSpeed),
			y: Cool.random(0, params.wig),
			ySpeed: Cool.random(-params.wigSpeed, params.wigSpeed)
		}; /* trying offsetting more of drawing */

		for (let h = params.start; h < params.end - 1; h++) {
			if (params.lines[h] != "end") {
				const s = params.lines[h];
				const e = params.lines[h + 1];
				if (!e)
					console.log(e, h + 1, params.end - 1, params.lines);
				let v = new Cool.Vector(e.x, e.y);
				v.subtract(s);
				v.divide(params.segNum);
				Lines.canvas.ctx.moveTo(
					params.x + s.x + Cool.random(-params.jig, params.jig) + off.x, 
					params.y + s.y + Cool.random(-params.jig, params.jig) + off.y
				);
				for (let i = 0; i < params.segNum; i++) {
					/* midpoint(s) of segment */
					const p = new Cool.Vector(s.x + v.x * i, s.y + v.y * i); 
					Lines.canvas.ctx.lineTo( 
						params.x + p.x + v.x + Cool.random(-params.jig, params.jig) + off.x, 
						params.y + p.y + v.y + Cool.random(-params.jig, params.jig) + off.y 
					);
				}
				if (params.onion)
					Lines.canvas.ctx.strokeStyle = params.color;
				else if (Lines.canvas.ctx.strokeStyle != "#" + params.color)
					Lines.canvas.setStrokeColor(params.color);
			}
			
			
			off.x += off.xSpeed;
			if (off.x >= params.wig || off.x <= -params.wig)
				off.xSpeed *= -1;

			off.y += off.ySpeed;
			if (off.y >= params.wig || off.y <= -params.wig)
				off.ySpeed *= -1;

		}
		Lines.canvas.ctx.stroke();
	};

	/* ctrl-k - start at beginning and capture one of every frame */
	this.captureCycle = function() {
		Lines.data.saveLines();
		/* set animation to last frame because it updates frames before draw */
		Lines.currentFrame = self.currentFrameCounter =  Lines.frames.length; 
		self.isPlaying = true;
		// capture as many frames as necessary for lines ratio or 1 of every frame 
		self.captureFrames = Lines.frames.length * Math.max(1, self.lps / self.fps);
	}
	
	/* starts drawing  */
	this.start = function() {
		window.requestAnimFrame(self.draw);
	}

	/* add background image module */
	this.background = new Background();

	/* interfaces */
	const panel = new Panel("draw-menu", "Draw");
	const capturePanel = new Panel("capture-menu", "Capture");

	/* play */
	panel.add(new UIToggleButton({
		id:"play", 
		callback: self.toggle, 
		key: "space", 
		on: "Play", 
		off: "Pause"
	}));

	this.frameNumDisplay = new UIDisplay({
		id:"frame", 
		label:"Frame: ", 
		initial:"0"
	});
	panel.add(this.frameNumDisplay); 

	/* prev frame */
	panel.add(new UIButton({
		title: "Prev Frame",
		callback: Lines.interface.prevFrame,
		key: "w"
	}));

	/* next frame */
	panel.add(new UIButton({
		title: "Next Frame",
		callback: Lines.interface.nextFrame,
		key: "e"
	}));

	/* l key - onion skin num */
	panel.add(new UISelect({
		options: [0,1,2,3,4,5,6,7,8,9,10],
		selected: 0,
		label: "Onion Skin",
		callback: function(ev) {
			if (ev.type == "change") {
				self.onionSkinNum = Number(this.value);
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("How many onion skin frames?");
				self.onionSkinNum = Number(n);
				this.setValue(self.onionSkinNum);
			}
		},
		key: "l"
	}));

	this.onionSkinOn = true;
	panel.add(new UIToggleButton({
		on: "Hide Onion",
		off: "Show Onion",
		callback: function() {
			self.onionSkinOn = !self.onionSkinOn;
		},
		key: "shift-l"
	}));

	this.fpsSelect = new UISelect({
		label: "FPS",
		options: [1,2,5,10,12,15,24,30,60],
		selected: 10,
		callback: function(ev) {
			if (ev.type == "change") {
				self.fps = Number(this.value);
				this.blur();
			} else if (ev.type == "keydown") {
				const n = prompt("FPS?");
				self.fps = Number(n);
				self.fpsSelect.setValue(self.fps);
			}
			self.intervalRatio = self.interval / (1000/self.fps);
		},
		key: ";"
	});
	panel.add(this.fpsSelect);

	/* lines per second */
	panel.add(new UISelect({
		label: "Lines/Second",
		options: [1,2,5,10,12,15,24,30,60],
		selected: 10,
		callback: function(ev) {
			if (ev.type == "change") {
				self.lps = Number(this.value);
				this.blur();
			} else {
				const n = prompt("Lines per second?");
				self.lps = Number(n);
				this.setValue(self.lps);
			}
			self.interval = 1000/self.lps;
			self.intervalRatio = self.interval / (1000/self.fps);
		},
		key: "'"
	}));

	/* capture cycle */
	capturePanel.add(new UIButton({
		title: "Capture Cycle",
		callback: self.captureCycle,
		key: "ctrl-k"
	}));

	/* f - go to frame */
	panel.add(new UIButton({
		title: "Go To Frame",
		callback: function() {
			const f = prompt("Frame:");
			Lines.currentFrame = f;
			Lines.interface.updateFramesPanel();
		},
		key: "f"
	}));

	/* capture frames with no functions */
	capturePanel.add(new UIButton({
		title: "Capture Frame",
		callback: function() {
			self.captureFrames = 1;
		},
		key: "k"
	}));

	/* capture bg */
	capturePanel.add(new UIToggleButton({
		title: "Capture BG Color",
		on: "Capture BG",
		off: "Capture BG",
		callback: function() {
			self.captureWithBackground = !self.captureWithBackground
		},
		key: "n"
	}));

	/* capture multiple frames */
	capturePanel.add(new UIButton({
		title: "Capture Multiple Frames",
		callback: function() {
			self.captureFrames = prompt("Capture how many frames?");
		},
		key: "shift-k"
	}));

	/* layer editor */
	// layer module ? 
	this.layerPanel = new Panel("layer-menu", "Layer");
	this.frameRow = this.layerPanel.addRow();
	this.layers = [];

	this.resetLayers = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled)
				self.layers[i].toggle();
		}
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
	}

	this.layerToggle = function(layer) {
		if (!layer.toggled) {
			layer.prevColor = layer.c;
			layer.c = "00CC96";
		} else {
			layer.c = layer.prevColor;
			const index = self.layers.indexOf(layer);
			if (index != -1)
				self.layers.splice(index, 1);
		}
		layer.toggled = !layer.toggled;
	};

	this.displayLayers = function() {
		self.layerPanel.clearComponents(self.frameRow);
		self.layers = [];
		if (Lines.frames[Lines.currentFrame]) {
			for (let i = 0; i < Lines.frames[Lines.currentFrame].length; i++) {
				const layer = Lines.frames[Lines.currentFrame][i];
				self.layers.push(layer);
				layer.toggled = false;
				const toggleLayer = new UIToggleButton({
					on: layer.d,
					off: layer.d,
					callback: function() {
						self.layerToggle(layer);
					}
				});
				self.layerPanel.add(toggleLayer, self.frameRow);
			}
		}
	};

	this.layerPanel.add(new UIButton({
		title: "Update Layers",
		callback: self.displayLayers
	}));

	this.segNum = new UIRange({
		label: "Segments",
		value: 2,
		display: "layer-num-range",
		min: 1,
		max: 20,
		callback: function() {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].n = +this.value;
			}
		}
	});
	this.layerPanel.add(this.segNum);

	this.jigNum = new UIRange({
		label: "Jiggle",
		value: this.jiggleRange,
		min: 0,
		max: 10,
		value: 1,
		display: "layer-jiggle-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].r = +this.value;
			}
		}
	});
	this.layerPanel.add(this.jigNum);

	this.wigNum = new UIRange({
		label: "Wiggle",
		value: this.wiggleRange,
		value: 0,
		min: 0,
		max: 15,
		display: "layer-wiggle-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].w = +this.value;
			}
		}
	});
	this.layerPanel.add(this.wigNum);

	this.wigSpeed = new UIRange({
		label: "Wiggle Speed",
		value: this.wiggleSpeed,
		value: 0,
		min: 0,
		max: 10,
		step: 0.005,
		display: "layer-wiggle-speed-range",
		callback: function(ev) {
			for (let i = 0; i < self.layers.length; i++) {
				if (self.layers[i].toggled)
					self.layers[i].v = +this.value;
			}
		}
	});
	this.layerPanel.add(this.wigSpeed);

	this.layerPanel.add(new UIButton({
		"title": "Cut Selected Segment",
		key: "alt-z",
		callback: function() {
			for (let i = 0; i < self.layers.length; i++) {
				const layer = self.layers[i];
				const drawing = Lines.drawings[layer.d];
				drawing.pop(); /* remove "end" */
				drawing.pop(); /* remove segment */
				drawing.push('end'); /* new end */
				layer.e = drawing.length; /* update layer end num */
			}
		}
	}));

	/* drawing panel */
	this.drawingPanel = new Panel("drawing-menu", "Drawings");

	this.drawingPanel.add(new UIButton({
		title: "Update Drawings",
		callback: function() {
			for (let i = 1; i < self.drawingPanel.rows.length; i++) {
				self.drawingPanel.clearComponents( self.drawingPanel.rows[i] );
				self.drawingPanel.removeRow( self.drawingPanel.rows[i] );
			}
			for (let i = 0; i < Lines.drawings.length; i++) {
				let layer;
				/* check if layer is in frame already */
				for (let j = 0; j < Lines.frames.length; j++) {
					const frame = Lines.frames[j];
					for (let k = 0; k < frame.length; k++) {
						if (i == frame[k].d)
							layer = frame[k];
					}
				}
				if (!layer) {
					const drawing = Lines.drawings[i];
					if (drawing != null) {
						layer = {
							d: i,
							s: 0,
							e: drawing.length,
							c: '000000',
							n: 2,
							r: 1,
							w: 0,
							v: 0,
							x: 0,
							y: 0
						}; /* defaults, maybe grab from existing layer? */
					}
				}
				const row = self.drawingPanel.addRow();
					
				self.drawingPanel.add(new UIToggleButton({
					title: i,
					on: i,
					off: i,
					callback: function() {
						self.layerToggle(layer);
					}
				}), row);

				self.drawingPanel.add(new UIButton({
					title: "+",
					callback: function() {
						Lines.data.saveLines();
						if (Lines.frames[Lines.currentFrame] == undefined) 
							Lines.frames[Lines.currentFrame] = [];
						Lines.frames[Lines.currentFrame].push(layer);
					}
				}), row);

				self.drawingPanel.add(new UIButton({
					title: "-",
					callback: function() {
						Lines.data.saveLines();
						if (Lines.frames[Lines.currentFrame]) {
							const index = Lines.frames[Lines.currentFrame].indexOf(layer);
							if (index != -1)
								Lines.frames[Lines.currentFrame].splice(index, 1);
						}
					}
				}), row);
				
			}
		}
	}));
}

/*
	json data key
	frame
	lines: drawing at frame index
	start: fr.s, 
	end: fr.e, 
	segNum: fr.n, 
	jig: fr.r,
	wig: fr.w,
	wigSpeed: fr.v
	x: fr.x, 
	y: fr.y, 
	color: fr.c

*/