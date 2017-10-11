function Canvas() {
	const self = this;

	this.widthInput = document.getElementById("canvas-width");
	this.heightInput = document.getElementById("canvas-height");

	this.canvas = document.getElementById("canvas");
	this.width, this.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctxStrokeColor = "000000"; // should be whatever color is?

	/* change width and height */
	this.setWidth = function() {
		self.width = self.canvas.width = self.widthInput.placeholder = Number(self.widthInput.value);
		self.widthInput.value = ""; // remove value after input 
	}
	this.setHeight = function() {
		self.height = self.canvas.height = self.heightInput.placeholder = Number(self.heightInput.value);
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


	/* background could be a module */
	this.bkgImg = new Image();
	this.bkgX = 0;
	this.bkgY = 0;
	this.bkgSize = 0;
	this.bkgRatio = 1;
	/* this is the only sprite-like thing in here
	game engine version might need sprite module... */
}