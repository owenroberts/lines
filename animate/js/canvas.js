function Canvas(width, height, color) {
	const self = this;

	this.width = width; // invoke canvas with width & height?
	this.height = height;
	this.canvas = document.getElementById("canvas");
	
	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;
	this.ctx.strokeStyle = "000000"; // doesn't matter, color managed by color module

	this.color = new Color("canvas-color", "Canvas Color", function(color) {
		self.canvas.style.backgroundColor = "#" + color;
	});
	if (color) {
		self.color.color = color;
		self.canvas.style.backgroundColor = "#" + color;
	}

	this.setStrokeColor = function(color) {
		this.ctx.strokeStyle = "#" + color;
	}

	/* interface */
	const panel = new Panel("canvasmenu", "Canvas");

	this.widthInput = new UIText({
		id: "canvas-width",
		placeholder: this.width,
		label: "Width",
		blur: true,
		callback: function(ev) {
			if (ev.which == 13 || ev.type == "blur") { 
				self.setWidth();
				self.widthInput.reset(self.width);
				this.blur();
			}
		}
	});
	panel.add(this.widthInput);
	
	this.heightInput = new UIText({
		id: "canvas-height",
		placeholder: this.height,
		label: "Height",
		blur: true,
		callback: function(ev) {
			if (ev.which == 13 || ev.type == "blur") {
				self.setHeight();
				self.heightInput.reset(self.height);
				this.blur();
			}
		}
	});
	panel.add(this.heightInput);


	/* change width and height */
	this.setWidth = function(width) {
		if (Number(width)) {
			self.width = self.canvas.width = width;
		} else {
			if (self.widthInput.getValue()) 
				self.width = self.canvas.width = self.widthInput.getValue();
			else if (!self.width)
				console.error("No width value set?");
		}
		self.widthInput.reset(self.width);
		self.ctx.miterLimit = 1;
	}

	this.setHeight = function(height) {
		if (Number(height)) {
			self.height = self.canvas.height = height;
		} else {
			if (self.heightInput.getValue()) 
				self.height = self.canvas.height = self.heightInput.getValue();
			else if (!self.height)
				console.error("No height value set?");
		}
		self.heightInput.reset(self.height);
		self.ctx.miterLimit = 1;
	}
	
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
}