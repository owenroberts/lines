function Canvas(width, height, color) {
	const self = this;

	this.width = width;
	this.height = height;
	this.canvas = document.getElementById("canvas"); // Lines.canvas.canvas is html elem

	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;

	Lines.bgColor = new Color(function(_color) {
		self.canvas.style.backgroundColor = _color;
	});

	this.setLineWidth = function(n) {
		self.canvas.ctx.lineWidth = +n;
	};

	/* canvas bg color */
	if (color) Lines.bgColor.set(color);

	/* set line color */
	this.setStrokeColor = function(color) {
		this.ctx.strokeStyle = color;
	};

	/* update canvas width */
	this.setWidth = function(width) {
		self.width = self.canvas.width = +width;
		self.ctx.miterLimit = 1;
	};

	/* update canvas height */
	this.setHeight = function(height) {
		self.height = self.canvas.height = +height;
		self.ctx.miterLimit = 1;
	};
	
	/* set initial width and height */
	this.setWidth(this.width);
	this.setHeight(this.height);

	this.startCapture = true;

	this.videoCapture = function() {
		if (self.startCapture) {
			self.startCapture = false;
			Lines.draw.videoCapture = true;
			self.stream = self.canvas.captureStream();
			self.rec = new MediaRecorder(self.stream);
			self.rec.start();
			self.rec.addEventListener('dataavailable', e => {
   				const blob = new Blob([ e.data ], { 'type': 'video/webm' });
   				self.vid = document.createElement('video');
   				self.vid.src = URL.createObjectURL(blob);
   				self.vid.controls = true;
   				document.body.appendChild(self.vid);
   				const deleteVid = document.createElement('button');
   				document.body.appendChild(deleteVid);
   				deleteVid.textContent = 'Delete';
   				deleteVid.onclick = function() {
   					Lines.canvas.vid.remove();
   					this.remove();
   				};
			});
		} else {
			Lines.draw.videoCapture = false;
			self.startCapture = false;
			self.rec.stop();
		}
	};

	this.prevCap = { n: '', f: 0 };

	this.capture = function() {
		if (Lines.fio.saveFilesEnabled) {
			canvas.toBlob(function(blob) {
				const title = Lines.fio.title.getValue(); // this is a UI
				const n = Cool.padNumber(Lines.currentFrame, 3);
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
						Lines.draw.draw('cap'); 
					});
				};
					
			});
		} else {
			const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	};

	/* shift-f key */
	this.fitCanvasToDrawing = function() {
		Lines.data.saveLines();
		
		let tolerance = 0;
		// min max size of canvas
		let min = { x: 10000, y: 10000 };
		let max = { x: 0, y: 0 };

		for (let i = 0; i < Lines.frames.length; i++) {
			const frame = Lines.frames[i];
			for (let j = 0; j < frame.length; j++) {
				const layer = Lines.layers[frame[j].l];
				for (let k = 0; k < Lines.drawings[layer.d].length; k++) {
					const dr = Lines.drawings[layer.d][k];
					if (dr != "end") { /* v2.0 segments divided w end*/
						tolerance = Math.max( tolerance, layer.r * 4 );
						min.x = Math.min( min.x, dr.x + layer.x);
						min.y = Math.min( min.y, dr.y + layer.y);
						max.x = Math.max( max.x, dr.x + layer.x);
						max.y = Math.max( max.y, dr.y + layer.y);
					}	
				}
			}
		}

		self.setWidth((max.x - min.x) + tolerance * 2);
		self.setHeight((max.y - min.y) + tolerance * 2);

		for (let i = 0; i < Lines.frames.length; i++) {
			const frame = Lines.frames[i];
			for (let j = 0; j < frame.length; j++) {
				const layer = Lines.layers[frame[j].l];
				const diff = {
					x: layer.x + (min.x - tolerance),
					y: layer.y + (min.y - tolerance)
				};
				if (diff.x > 0) layer.x -= diff.x;
				if (diff.y > 0) layer.y -= diff.y;
			}
		}
	};
}