function DrawEvents() {
	const self = this;

	this.isDrawing = false; // for drawStart to drawEnd so its not always moving
	this.startDots = false;


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
				self.addLine(ev.offsetX, ev.offsetY);
		}
	};

	this.addLine = function(x, y) {
		Lines.lines.push( new Cool.Vector(x, y) );
	};

	this.drawStart = function(ev) {
		if (ev.which == 1 && !Lines.draw.isPlaying && !ev.altKey) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
			/* add line? */
		} else if (ev.altKey) {
			self.startDots = new Cool.Vector(ev.offsetX, ev.offsetY);
		}
	};

	this.drawEnd = function(ev) {
		if (self.startDots) {
			const n = prompt('Number of dots: ');
			const w = Math.abs(self.startDots.x - ev.offsetX);
			const h = Math.abs(self.startDots.y - ev.offsetY);
			const ratio =  w / h;
			const c = w / (ratio * n/2);
			const r = h / (1/ratio * n/2);
			for (let x = self.startDots.x; x < ev.offsetX; x += c) {
				for (let y = self.startDots.y; y < ev.offsetY; y += r) {
					const points = Cool.randomInt(2,4);
					const _x = x + Cool.randomInt(-c/2, c/2);
					const _y = y + Cool.randomInt(-r/2, r/2);
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
		label: "Wiggle Speed",
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
}