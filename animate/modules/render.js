function Render(dps, showStats) {
	const self = this;
	this.showStats = showStats;
	if (showStats) {
		this.stats = new Stats();
		this.stats.dom.style.position = 'relative';
	}

	this.dps = dps || 30; // draws pers second
	this.interval = 1000 / this.dps;  // time interval between draws
	this.timer = performance.now();

	this.onionSkinNum = 0;
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
			lns.ui.play.checkEnd();
			lns.ui.timeline.update();
		} else {
			lns.draw.layer.startFrame = lns.draw.layer.endFrame = lns.anim.currentFrame;
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
	};

	/* ' - dps is property of render engine, not individual animations */
	this.setDps = function(dps) {
		self.dps = +dps;
		self.interval = 1000 / self.dps;
		lns.anim.dps = self.dps;
	};

	/* ; - fps update frame value in anim*/
	this.setFps = function(fps) {
		lns.anim.fps = +fps;
	};

	this.update = function(time) {
		if (showStats) self.stats.begin();
		if (performance.now() > self.interval + self.timer || time == 'cap') {
			self.timer = performance.now();


			// what actually need to be update here ?
			if (lns.anim.isPlaying) lns.ui.timeline.update();

			lns.canvas.ctx.clearRect(0, 0, lns.canvas.width, lns.canvas.height);

			/* in capture set animation onDraw */
			if (lns.ui.capture.bg && (lns.ui.capture.frames > 0 || lns.ui.capture.isVideo)) {
				lns.canvas.ctx.fillStyle = lns.canvas.bgColor;
				lns.canvas.ctx.fillRect(0, 0, lns.canvas.width, lns.canvas.height);
			}

			lns.bgImage.display();

			if (self.onionSkinNum > 0 && self.onionSkinIsVisible) {
				const temp = lns.anim.currentFrame;
				for (let o = 1; o <= self.onionSkinNum; o++){
					const index = temp - o;
					if (index >= 0) {
						lns.anim.currentFrame = index;
						lns.anim.overrideProperty('color', `rgba(105,150,255,${ 1.5 - (o / self.onionSkinNum) })`);
						/* this triggers capture, turn off onion skin for clean capture */
						lns.anim.draw();
					}
				}
				lns.anim.cancelOverride();
				lns.anim.currentFrame = temp;
			}

			/* draw before update is cool for now ... */
			lns.anim.draw();
			lns.anim.update();
		}
		if (!lns.ui.capture.isCapturing) 
			window.requestAnimFrame(self.update);
		if (showStats) self.stats.end();
	};

	this.start = function() {
		window.requestAnimFrame(self.update);
	};
}