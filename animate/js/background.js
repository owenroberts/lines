function Background() {
	const self = this;

	this.show = true;
	this.img = new Image();
	this.x = 0;
	this.y = 0;
	this.size = 0;
	this.ratio = 1;
	/* this is the only sprite-like thing in here
	game engine version might need sprite module... */

	this.loadImage = function(ev) {
		if (ev.which == 13) {
			self.img.src = this.value;
			self.img.onload = function() {
				self.xRange.setRange(-self.img.width, self.img.height);
				self.yRange.setRange(-self.img.height, self.img.height);
				self.size = self.img.width;
				self.ratio = self.img.width / self.img.height;
				self.sizeRange.setRange(self.img.width / 4, self.img.width * 4);
				self.sizeRange.value = self.img.width;
			}
		}
	};

	/* this doesn't really need key command bc have copy/paste anyway */
	this.imageInput = new UI("bkg-img", "keyup", self.loadImage);
	
	this.xRange = new UIRange("bkg-x", "input", function() {
		self.x = this.value;
	});

	this.yRange = new UIRange("bkg-y", "input", function() {
		self.y = this.value;
	});
	
	this.sizeRange = new UIRange("bkg-size", "input", function() {
		self.size = this.value;
	});

	/* b key */
	this.toggle = function() {
		self.show = !self.show;
	}
	
}