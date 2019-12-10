function Render(lps, color) {
	const self = this;

	this.lps = lps || 12; // lines per second all the time
	this.interval = 1000 / this.lps;  // fps per one second, the line interval
	this.timer = performance.now();

	this.onionSkinNum = 0;
	this.onions = [];
	this.onionSkinIsVisible = false;

	/* l key */
	this.setOnionSkin = function(n) {
		self.onionSkinNum = +n;
		self.onionSkinIsVisible = +n > 0 ? true : false;
	};

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		lns.anim.frame = 0;
		lns.anim.isPlaying = false;
		lns.canvas.ctx.miterLimit = 1; /* maybe not needed? happens in canvas reset*/
		lns.ui.update();
	};

	/* toggle play animation */
	this.toggle = function() {
		if (!lns.anim.isPlaying) {
			lns.ui.beforeFrame();
			lns.ui.afterFrame();
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
	};

	/* ' - lps is property of render engine, not individual animations */
	this.setLps = function(lps) {
		self.lps = +lps;
		self.interval = 1000 / self.lps;
		lns.anim.lps = self.lps;
	};

	this.update = function(time) {
		if (performance.now() > self.interval + self.timer || time == 'cap') {
			self.timer = performance.now();

			if (lns.anim.isPlaying) lns.ui.update(); 

			lns.canvas.ctx.clearRect(0, 0, lns.canvas.width, lns.canvas.height);

			/* in capture set animation onDraw */
			if (lns.ui.capture.bg && (lns.ui.capture.frames > 0 || lns.ui.capture.isVideo)) {
				lns.canvas.ctx.rect(0, 0, lns.canvas.width, lns.canvas.height);
				lns.canvas.ctx.fillStyle = lns.canvas.bgColor;
				lns.canvas.ctx.fill();
			}

			lns.bgImage.display();

			if (self.onionSkinNum > 0 && self.onionSkinIsVisible) {
				const temp = lns.anim.currentFrame;
				for (let o = 1; o <= self.onionSkinNum; o++){
					const index = temp - o;
					if (index >= 0) {
						const color = `rgba(105,150,255,${ 1.5 - (o / self.onionSkinNum) })`;
						lns.anim.currentFrame = index;
						lns.anim.overrideProperty('c', color);
						lns.anim.draw();
					}
				}
				lns.anim.cancelOverride();
				lns.anim.currentFrame = temp;
			}

			lns.anim.draw();
			lns.anim.update();
			
			lns.lines.draw();
		}
		if (!lns.ui.capture.capturing) 
			window.requestAnimFrame(self.update);
	};

	this.start = function() {
		window.requestAnimFrame(self.update);
	};
}