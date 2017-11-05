function Canvas() {
	const self = this;

	this.widthInput = document.getElementById("canvas-width");
	this.heightInput = document.getElementById("canvas-height");

	this.canvas = document.getElementById("canvas");
	this.width, this.height; // are these part of the drawing? or data??
	this.ctx = this.canvas.getContext('2d');
	this.ctxStrokeColor = "000000"; // should be whatever color is?

	/* change width and height */
	this.setWidth = function(width) {
		if (width == undefined && self.widthInput.value) 
			width = Number(self.widthInput.value);
		else if (width == undefined) console.error("No width value set?");
		self.width = self.canvas.width = self.widthInput.placeholder = width;
		self.widthInput.value = ""; // remove value after input 
	}
	this.setHeight = function(height) {
		if (height == undefined && self.heightInput.value)
			height = Number(self.heightInput.value);
		else if (height == undefined) console.error("No height value set?");
		
		self.height = self.canvas.height = self.heightInput.placeholder = height;
		self.heightInput.value = "";
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