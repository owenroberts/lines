function Background() {
	const self = this;

	this.imageInput = document.getElementById("bkg-img");
	this.xRange = document.getElementById("bkg-x");
	this.yRange = document.getElementById("bkg-y");
	this.sizeRange = document.getElementById("bkg-size");
	this.showBkg = true;

	/* background could be a module */
	this.img = new Image();
	this.x = Number(this.xRange.value);
	this.y = Number(this.yRange.value);
	this.size = Number(this.sizeRange.value);
	this.sizeRatio = 1;
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
				self.sizeRange = self.img.width;
				self.sizeRatio = self.img.width / self.img.height;
				self.sizeRange.min = self.img.width / 10;
				self.sizeRange.max = self.img.width * 2;
				self.sizeRange.value = self.img.width;
			}
		}
	};

	this.imageInput.addEventListener("keyup", self.loadImage);

	this.toggle = function() {
		self.showBkg = !self.showBkg;
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