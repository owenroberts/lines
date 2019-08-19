function Render(lps, color) {
	const self = this;

	this.lps = lps || 12; // lines per second all the time
	this.interval = 1000 / this.lps;  // fps per one second, the line interval
	this.timer = performance.now();

	this.onionSkinNum = 0;
	this.onions = [];
	this.onionSkinIsVisible = false;

	this.lineColor = color || '#000000'; /* default black*/

	this.setLineColor = function(value) {
		this.lineColor = value;
		lns.draw.layer.c = value;
	};

	/* l key */
	this.setOnionSkin = function(n) {
		self.onionSkinNum = +n;
		self.onionSkinIsVisible = true;
	};

	/* shift l */
	this.toggleOnion = function() {
		self.onionSkinIsVisible = !self.onionSkinIsVisible;
		/* set onion back? */
	};

	/* ; key */
	this.setFps = function(fps) {
		lns.anim.fps = +fps;
		lns.anim.intervalRatio = self.interval / (1000 / +fps);
	};

	/* ' key */
	this.setLps = function(lps) {
		self.lps = +lps;
		self.interval = 1000 / self.lps;
		self.intervalRatio = self.interval / (1000 / self.fps);
	};

	/* just set drawing back to 0 but might do other things */
	this.reset = function() {
		lns.anim.frame = 0;
		lns.anim.isPlaying = false;
		lns.canvas.ctx.miterLimit = 1;
		lns.ui.updateInterface();
	};

	/* toggle play animation */
	this.toggle = function() {
		if (!lns.anim.isPlaying) {
			lns.ui.beforeFrame();
			lns.ui.afterFrame();
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
	};

	/* f key */
	this.setFrame = function(f) {
		if (+f >= 0) lns.anim.frame = +f;
	};

	this.update = function(time) {
		if (performance.now() > self.interval + self.timer || time == 'cap') {
			self.timer = performance.now();

			lns.anim.update();
			if (lns.anim.isPlaying) {
				lns.ui.updateInterface(); /* ui thing */
			}

			lns.canvas.ctx.clearRect(0, 0, lns.canvas.width, lns.canvas.height);

			if (lns.ui.capture.captureWithBackground) {
				lns.canvas.ctx.rect(0, 0, lns.canvas.width, lns.canvas.height);
				lns.canvas.ctx.fillStyle = lns.canvas.bgColor;
				lns.canvas.ctx.fill();
			}

			lns.bgImage.display();

			/* draws onionskin this is first so its under main lines */
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
			lns.lines.draw();
		}
		if (!lns.ui.capture.capturing) 
			window.requestAnimFrame(self.update);
	};

	this.start = function() {
		window.requestAnimFrame(self.update);
	};
}