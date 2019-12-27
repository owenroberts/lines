function Background() {
	const self = this;

	this.show = true;
	this.img = new Image();
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.size = 1;

	this.loadImage = function(url) {
		self.img.src = url;
		self.img.onload = function() {
			self.width = self.img.width;
			self.height = self.img.height;
		}
	};

	/* b key */
	this.toggle = function() {
		self.show = !self.show;
	};

	this.display = function() {
		if (this.img.src && this.show)
			lns.canvas.ctx.drawImage(this.img, this.x, this.y, this.size * this.width, this.height * this.size);
	};
}