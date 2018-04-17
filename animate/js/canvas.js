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
	}

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
	}

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
	}
	
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
	}

	/* interface */
	const panel = new Panel("canvasmenu", "Canvas");

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
}