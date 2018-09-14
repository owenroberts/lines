function Background() {
	const self = this;

	this.show = true;
	this.img = new Image();
	this.x = 0;
	this.y = 0;
	this.size = 0;
	this.ratio = 1;

	this.loadImage = function(ev) {
		if (ev.which == 13) {
			self.img.src = this.value;
			self.img.onload = function() {
				/* set img size */
				self.size = self.img.width;
				self.ratio = self.img.width / self.img.height;
				/* set uis */
				self.xRange.setRange(-self.img.width, self.img.height);
				self.yRange.setRange(-self.img.height, self.img.height);
				self.sizeRange.setRange(self.img.width / 4, self.img.width * 4);
				self.sizeRange.setValue(self.img.width);
			}
		}
	};

	/* b key */
	this.toggle = function() {
		self.show = !self.show;
	}

	/* interface */
	const panel = new Panel("background-menu", "Background Image");

	/* copy/paste url */
	panel.add(new UIText({
		title: "Add image URL hit enter",
		callback: this.loadImage
	}));
	
	/* b - toggle visibility of bkg */
	panel.add(new UIToggleButton({
		title: "Hide Background",
		callback: this.toggle, 
		key: "b", 
		on: "Hide", 
		off: "Show" 
	}));
	
	/* update x position */
	this.xRange = new UIRange({
		label: "X", 
		callback: function() {
			self.x = this.value;
		}
	});
	panel.add(this.xRange);
	
	/* update y position */
	this.yRange = new UIRange({
		label: "Y", 
		callback: function() {
			self.y = this.value;
		}
	});
	panel.add(this.yRange);
	
	/* update size */
	this.sizeRange = new UIRange({
		label: "Size", 
		callback: function() {
			self.size = this.value;
		}
	});
	panel.add(this.sizeRange);
}