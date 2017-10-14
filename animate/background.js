function Background() {
	const self = this;

	this.imageInput = document.getElementById("bkg-img");
	this.xRange = document.getElementById("bkg-x");
	this.yRange = document.getElementById("bkg-y");
	this.sizeRange = document.getElementById("bkg-size");
	this.show = true;

	/* background could be a module */
	this.img = new Image();
	this.x = Number(this.xRange.value);
	this.y = Number(this.yRange.value);
	this.size = Number(this.sizeRange.value);
	this.ratio = 1;
	/* this is the only sprite-like thing in here
	game engine version might need sprite module... */

	this.loadImage = function(ev) {

		if (ev.which == 13) {
			self.img.src = this.value;
			self.img.onload = function() {
				self.xRange.min = -self.img.width;
				self.yRange.min = -self.img.height;
				self.xRange.max = self.img.width;
				self.yRange.max = self.img.height;
				self.size = self.img.width;
				self.ratio = self.img.width / self.img.height;
				self.sizeRange.min = self.img.width / 4;
				self.sizeRange.max = self.img.width * 4;
				self.sizeRange.value = self.img.width;
			}
		}
	};

	this.imageInput.addEventListener("keyup", self.loadImage);

	this.toggle = function() {
		self.show = !self.show;
	}

	this.xRange.addEventListener("input", function() {
		self.x = this.value;
	});

	this.yRange.addEventListener("input", function() {
		self.y = this.value;
	});
	
	this.sizeRange.addEventListener("input", function() {
		self.size = this.value;
	});
	
}