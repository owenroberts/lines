function DrawEvents(defaults) {
	const self = this;

	this.isDrawing = false; // for drawStart to drawEnd so its not always moving

	this.setDefaults = function() {
		self.segNumRange = defaults.n; /* default 2*/
		self.jiggleRange = defaults.r; /* default 1 */
		self.wiggleRange = defaults.w; /* 2 is good */
		self.wiggleSpeed = defaults.v; /* 0.1 good */
	};
	this.defaults = defaults;
	this.setDefaults();

	this.brush = 0;
	this.brushSpread = 1;
	this.startDots = false;
	this.dots = 10;

	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer 
	this.mouseInterval = 30;

	
	this.outSideCanvas = function(ev) {
		if (ev.toElement != Lines.canvas.canvas) { 
			if (self.isDrawing) 
				Lines.data.saveLines();
			self.isDrawing = false;

			/* pointer context click on frames for copy frames */
			if (ev.which == 3) {
				ev.preventDefault();
				const elem = document.elementFromPoint(ev.clientX, ev.clientY);
				if (elem.classList.contains("frame")) {
					Lines.data.addFrameToCopy(elem);
				}
			}
		}
	};

	this.drawUpdate = function(ev) {
		if (performance.now() > self.mouseInterval + self.mouseTimer) {
			self.mouseTimer = performance.now();
			if (self.isDrawing)
				if (self.brush <= 0)
					self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
				else
					self.addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	};

	this.addBrush = function(x, y) {
		const b = self.brush * self.brush * self.brushSpread;
		let origin = new Cool.Vector(x, y);
		for (let i = 0; i < self.brush; i++) {
			let point = new Cool.Vector(x + Cool.randomInt(-b, b), y + Cool.randomInt(-b, b));
			while (point.dist(origin) > b){
				point = new Cool.Vector(x + Cool.randomInt(-b, b), y + Cool.randomInt(-b, b));
			}
			Lines.lines.push(point);
			const points = Cool.randomInt(1,3);
			for (let i = 0; i < points; i ++) {
				Lines.lines.push(new Cool.Vector(
					point.x + Cool.randomInt(-1, 1), 
					point.y + Cool.randomInt(-1, 1)
				));
			}
			Lines.lines.push('end');
		}
	}

	this.addLine = function(x, y) {
		Lines.lines.push(new Cool.Vector(x, y));
	};

	this.drawStart = function(ev) {
		if (ev.which == 1 && !Lines.draw.isPlaying && !ev.altKey) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
			if (self.brush <= 0)
				self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
			else
				self.addBrush(ev.offsetX, ev.offsetY);
		} else if (ev.altKey) {
			self.startDots = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	};

	this.drawEnd = function(ev) {
		if (self.startDots) {
			const w = Math.abs(self.startDots.x - ev.offsetX);
			const h = Math.abs(self.startDots.y - ev.offsetY);
			const ratio =  w / h;
			const c = w / (ratio * self.dots/2);
			const r = h / (1/ratio * self.dots/2);
			let [startX, endX] = self.startDots.x < ev.offsetX ? [self.startDots.x, ev.offsetX] : [ev.offsetX, self.startDots.x];
			let [startY, endY] = self.startDots.y < ev.offsetY ? [self.startDots.y, ev.offsetY] : [ev.offsetY, self.startDots.y];
			for (let x = startX; x < endX; x += c) {
				for (let y = startY; y < endY; y += r) {
					const _x = Math.round(x) + Cool.randomInt(-c/2, c/2);
					const _y = Math.round(y) + Cool.randomInt(-r/2, r/2);
					const points = Cool.randomInt(1,3);
					for (let i = 0; i < points; i ++) {
						Lines.lines.push(new Cool.Vector(
							_x + Cool.randomInt(-1, 1), 
							_y + Cool.randomInt(-1, 1)
						));
					}
					Lines.lines.push('end');
				}
			}
			self.startDots = false;
		} else if (ev.which == 1) {
			self.isDrawing = false;
			Lines.lines.push("end");
		}
	}

	if (window.PointerEvent) {
		Lines.canvas.canvas.addEventListener('pointermove', self.drawUpdate);
		Lines.canvas.canvas.addEventListener('pointerdown', self.drawStart);
		Lines.canvas.canvas.addEventListener('pointerup', self.drawEnd);
	} else {	
		Lines.canvas.canvas.addEventListener('mousemove', self.drawUpdate);
		Lines.canvas.canvas.addEventListener('mousedown', self.drawStart);
		Lines.canvas.canvas.addEventListener('mouseup', self.drawEnd);
	}
	document.addEventListener('mousemove', self.outSideCanvas);
}