function Background() {
	const self = this;

	this.show = true;
	this.img = new Image();
	this.x = 0;
	this.y = 0;
	this.size = 0;
	this.ratio = 1; // why?

	this.loadImage = function(url) {
		self.img.src = url;
		self.img.onload = function() {
			/* set img size */
			self.size = self.img.width;
			self.ratio = self.img.width / self.img.height;
			
			/* set uis fuck me ... could just code this one 
				hard code for now */
			// self.xRange.setRange(-self.img.width, self.img.height);
			// self.yRange.setRange(-self.img.height, self.img.height);
			// self.sizeRange.setRange(self.img.width / 4, self.img.width * 4);
			// self.sizeRange.setValue(self.img.width);
		}
	};

	/* b key */
	this.toggle = function() {
		self.show = !self.show;
	};

	this.setX = function(n) {
		self.x = +n;
	};

	this.setY = function(n) {
		self.y = +n;
	};

	this.setSize = function(n) {
		self.size = +n;
	};

	this.display = function() {
		if (this.img.src && this.show)
			Lines.canvas.ctx.drawImage(this.img, this.x, this.y, this.size * this.img.width, this.img.height * this.size);
	};
}