function Canvas(width, height, color) {
	const self = this;

	this.width = width;
	this.height = height;
	this.canvas = document.getElementById("canvas"); // Lines.canvas.canvas is html elem
	
	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;

	this.bgColor = new Color("canvas-color", "Canvas Color", function(color) {
		self.canvas.style.backgroundColor = "#" + color;
	});

	/* canvas bg color */
	if (color) {
		self.bgColor.color = color;
		self.canvas.style.backgroundColor = "#" + color;
	}

	/* set line color */
	this.setStrokeColor = function(color) {
		this.ctx.strokeStyle = "#" + color;
	};

	/* update canvas width */
	this.setWidth = function(width) {
		if (Number(width)) {
			self.width = self.canvas.width = width;
		} else {
			if (self.widthInput.getValue()) 
				self.width = self.canvas.width = self.widthInput.getValue();
			else if (!self.width)
				console.error("No width value set?");
		}
		self.ctx.miterLimit = 1;
	};

	/* update canvas height */
	this.setHeight = function(height) {
		if (Number(height)) {
			self.height = self.canvas.height = height;
		} else {
			if (self.heightInput.getValue()) 
				self.height = self.canvas.height = self.heightInput.getValue();
			else if (!self.height)
				console.error("No height value set?");
		}
		self.ctx.miterLimit = 1;
	};
	
	/* set initial width and height */
	this.setWidth(this.width);
	this.setHeight(this.height);

	this.capture = function() {
		if (Lines.fio.saveFilesEnabled) {
			canvas.toBlob(function(blob) {
				saveAs(blob, Lines.fio.title.getValue() + "-" + Cool.padNumber(Lines.currentFrame, 3) + ".png");
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
		let min = {
			x: 10000,
			y: 10000
		};
		let max = {
			x: 0,
			y: 0
		}

		for (let i = 0; i < Lines.frames.length; i++) {
			const fr = Lines.frames[i];
			for (let h = 0; h < fr.length; h++) {
				const layer = fr[h];
				for (let j = 0; j < Lines.drawings[layer.d].length; j++) {
					const dr = Lines.drawings[layer.d][j];
					if (dr != "end") { /* v2.0 segments divided w end*/
						tolerance = Math.max( tolerance, layer.r * 4 );
						min.x = Math.min( min.x, dr.x );
						min.y = Math.min( min.y, dr.y );
						max.x = Math.max( max.x, dr.x );
						max.y = Math.max( max.y, dr.y );
					}	
				}
			}
		}

		self.setWidth((max.x - min.x) + tolerance * 2);
		self.setHeight((max.y - min.y) + tolerance * 2);

		for (let h = 0; h < Lines.frames.length; h++) {
			const fr = Lines.frames[h];
			for (let h = 0; h < fr.length; h++) {
				const layer = fr[h];
				const diff = {
					x: layer.x + (min.x - tolerance),
					y: layer.y + (min.y - tolerance)
				};
				if (diff.x > 0)
					layer.x -= diff.x;
				if (diff.y > 0)
					layer.y -= diff.y;
			}
		}
	};

	/* interface */
	const panel = new Panel("canvas-menu", "Canvas");

	/* update canvas width */
	this.widthInput = new UIText({
		id: "canvas-width",
		placeholder: this.width,
		label: "Width",
		blur: true,
		observe: {
			elem: self.canvas,
			attribute: "width"
		},
		callback: function(ev) {
			if (ev) { // key input
				if (ev.which == 13) {
					self.setWidth();
					self.widthInput.reset(self.width);
					this.blur();
				}
			} else { // observer
				self.widthInput.reset(Lines.canvas.canvas.width);
			}
		}
	});
	panel.add(this.widthInput);
	
	/* update canvas height */
	this.heightInput = new UIText({
		id: "canvas-height",
		placeholder: this.height,
		label: "Height",
		blur: true,
		observe: {
			elem: self.canvas,
			attribute: "height"
		},
		callback: function(ev) {
			if (ev) { // key input
				if (ev.which == 13) {
					self.setHeight();
					self.heightInput.reset(self.height);
					this.blur();
				}
			} else { // observer 
				self.heightInput.reset(Lines.canvas.canvas.height);
			}
		}
	});
	panel.add(this.heightInput);

	/* fit canvas to drawing */
	panel.add(new UIButton({
		title: "Fit Canvas to Drawing",
		callback: self.fitCanvasToDrawing,
		key: "shift-f"
	}));
}