function DrawEvents() {
	const self = this;

	this.isDrawing = false; // for drawStart to drawEnd so its not always moving
	
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
					self.addLine(ev.offsetX, ev.offsetY);
				else
					self.addBrush(ev.offsetX, ev.offsetY);
		}
	};

	this.addBrush = function(x, y) {
		const b = self.brush * self.brush;
		let origin = new Cool.Vector(x, y);
		for (let i = 0; i < self.brush; i++) {
			let point = new Cool.Vector(x + Cool.random(-b, b), y + Cool.random(-b, b));
			while (point.dist(origin) > b){
				point = new Cool.Vector(x + Cool.random(-b, b), y + Cool.random(-b, b));
			}
			Lines.lines.push(point);
			const points = Cool.randomInt(1,3);
			for (let i = 0; i < points; i ++) {
				Lines.lines.push(new Cool.Vector(
					point.x + Cool.random(-1, 1), 
					point.y + Cool.random(-1, 1)
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
				self.addLine(ev.offsetX, ev.offsetY);
			else
				self.addBrush(ev.offsetX, ev.offsetY);
		} else if (ev.altKey) {
			self.startDots = new Cool.Vector(ev.offsetX, ev.offsetY);
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
					const _x = x + Cool.randomInt(-c/4, c/4);
					const _y = y + Cool.randomInt(-r/2, r/2);
					const points = Cool.randomInt(1,4);
					for (let i = 0; i < points; i ++) {
						Lines.lines.push(new Cool.Vector(
							_x + Cool.random(-1, 1), 
							_y + Cool.random(-1, 1)
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

	/* interface */
	const panel = new Panel("mouse-menu", "Mouse");

	this.segNumRange = 2; /* default 2*/
	this.segNumElem = new UIRange({
		label: "Segments",
		value: this.segNumRange,
		display: "num-range",
		min: 1,
		max: 20,
		callback: function(ev) {
			/* this is not DRY */
			if (ev.type == "input") {
				self.segNumRange = Number(this.value);
			} else if (ev.type == "keydown") {
				const n = prompt("Segment num?");
				self.segNumRange = Number(n);
			}
		},
		key: "h"
	});
	panel.add(this.segNumElem);

	this.jiggleRange = 1; /* default 1 */
	this.jiggleElem = new UIRange({
		label: "Jiggle",
		value: this.jiggleRange,
		min: 0,
		max: 10,
		display: "jiggle-range",
		callback: function(ev) {
			if (ev.type == "input") {
				self.jiggleRange = Number(this.value);
			} else if (ev.type == "keydown") {
				const n = prompt("Jiggle num?");
				self.jiggleRange = Number(n);
			}
		},
		key: "j"
	});
	panel.add(this.jiggleElem);

	this.wiggleRange = 0; /* 2 is good */
	this.wiggleElem = new UIRange({
		label: "Wiggle",
		value: this.wiggleRange,
		min: 0,
		max: 15,
		display: "wiggle-range",
		callback: function(ev) {
			self.wiggleRange = Number(this.value);
		}
	});
	panel.add(this.wiggleElem);

	this.wiggleSpeed = 0; /* 0.1 good */
	this.wiggleSpeedElem = new UIRange({
		label: "Wiggle Amt",
		value: this.wiggleSpeed,
		min: 0,
		max: 5,
		step: 0.005,
		display: "wiggle-speed-range",
		callback: function(ev) {
			self.wiggleSpeed = Number(this.value);
		}
	});
	panel.add(this.wiggleSpeedElem);

	
	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer 
	this.mouseInterval = 30;
	this.mouseElem = new UIRange({
		label: "Mouse Time",
		value: 30,
		min: 0,
		max: 100,
		display: "mouse-range",
		callback: function(ev) {
			if (ev.type == "input") {
				self.mouseInterval = Number(this.value);
			} else if (ev.type == "keydown") {
				const n = prompt("Mouse move?");
				self.mouseInterval = Number(n);
			}
		},
		key: "u"
	});
	panel.add(this.mouseElem);

	this.brush = 0;
	panel.add(new UIRange({
		label: "Brush",
		value: 0,
		min: 0,
		max: 10,
		display: "brush-range",
		callback: function(ev) {
			self.brush = Number(this.value);
		}
	}));

	this.startDots = false;
	this.dots = 10;
	panel.add(new UIRange({
		label: "Dots",
		value: 10,
		min: 1,
		max: 20,
		display: "dots-range",
		callback: function(ev) {
			self.dots = Number(this.value);
		}
	}));

}