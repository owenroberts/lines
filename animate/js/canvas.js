function Canvas() {
	const self = this;

	this.widthInput = document.getElementById("canvas-width");
	this.heightInput = document.getElementById("canvas-height");

	this.canvas = document.getElementById("canvas");
	this.width, this.height; // are these part of the drawing? or data??
	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;
	this.ctx.strokeStyle = "000000"; // should be whatever color is?

	this.setStrokeColor = function(color) {
		this.ctx.strokeStyle = "#" + color;
	}

	/* change width and height */
	this.setWidth = function(width) {
		if (Number(width)) {
			self.width = self.canvas.width = self.widthInput.placeholder = width;
		} else {
			if (self.widthInput.value) 
				self.width = self.canvas.width = self.widthInput.placeholder = Number(self.widthInput.value);
			else if (!self.width)
				console.error("No width value set?");
		}
		self.widthInput.value = ""; // remove value after input 
		this.ctx.miterLimit = 1;
	}
	this.setHeight = function(height) {
		if (Number(height)) {
			self.height = self.canvas.height = self.heightInput.placeholder = height;
		} else {
			if (self.heightInput.value) 
				self.height = self.canvas.height = self.heightInput.placeholder = Number(self.heightInput.value);
			else if (!self.height)
				console.error("No height value set?");
		}
		self.heightInput.value = ""; // remove value after input 
		this.ctx.miterLimit = 1;
	}
	this.setWidth();
	this.setHeight();

	this.widthInput.addEventListener("keyup", function(ev) {
		if (ev.which == 13) self.setWidth();
	});
	this.widthInput.addEventListener("blur", self.setWidth);
	
	this.heightInput.addEventListener("keyup", function(ev) {
		if (ev.which == 13) self.setHeight();
	});
	this.heightInput.addEventListener("blur", self.setHeight);

	this.capture = function() {
		const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		window.location.href = cap;
	}
}