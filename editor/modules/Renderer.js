/*
	renderer module
	may eventually abstract this to use elsewhere
*/

function Renderer(app, dps, fps) {
	Object.assign(Renderer.prototype, ModuleMixin);
	const self = this;

	if (!dps) dps = 30; // default
	if (!fps) fps = dps;
	let interval = 1000 / dps;
	let timer = performance.now();
	let dpf = Math.round(dps / fps);
	let drawCount = 0;
	let isPlaying = false;
	let frame = 0; // frame part of timeline ??
	window.drawCount = 0; // needs to be available to lines/drawings

	this.isPlaying = false; // play pause toggle
	// set lns anims to dps

	this.addProp('dps', {
		get: () => { return dps; },
		set: (value) => {
			dps = +value;
			interval = 1000 / dps;
			dpf = Math.round(dps / fps);
			// set lns anims to dps
		}
	});

	this.addProp('fps', {
		get: () => { return fps; },
		set: (value) => {
			fps = +value;
			dpf = Math.round(dps / fps);
		}
	})

	this.addProp('frame', {
		get: () => { return frame; },
		set: (value) => {
			console.log('frame', value);
			let f = frame;
			if (value === "+1") f = frame + 1;
			else if (value === "-1") f = frame - 1;
			else if (value === 'end') f = app.timeline.endFrame;
			else f = +value;
			if (f <= app.timeline.endFrame && f >= 0) {
				frame = f; 
			}
			app.ui.faces.frameDisplay.value = frame;
			// update ui?
		}
	});

	this.addProp('isPlaying', {
		get: () => { return isPlaying; },
		set: (value) => {
			isPlaying = value;
		}
	})

	// fps -- each lns anim has it's own fps 

	// send capture params all together??
	this.update = function(time, isCapture) {
		if (performance.now() > interval + timer || isCapture) {
			timer = performance.now();
			app.canvas.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);

			// check bg color is something other than white?
			// app.canvas.ctx.fillStyle = app.canvas.bgColor;
			// app.canvas.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

			if (isPlaying) {
				if (drawCount === dpf) {
					frame++;
					drawCount = 0;
				} else {
					drawCount++;
				}
			}
			app.timeline.update(frame);
			app.timeline.draw();

			// update lines clips // if isPlaying
			// draw lines clips
			window.drawCount++;
		}
		if (!isCapture) window.requestAnimFrame(self.update);
	}

	this.start = function() {
		window.requestAnimFrame(self.update);
	};


}