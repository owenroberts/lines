function DrawEvents() {
	const self = this;
	this.moves = 0; // number of events recorded
	this.isDrawing = false; // for drawStart to drawEnd so its not always moving

	this.outSideCanvas = function(ev) {
		if (ev.toElement != Lines.canvas.canvas) { 
			if (self.isDrawing) Lines.data.saveLines();
			self.isDrawing = false;
			if (self.moves % 2 == 1) Lines.lines.splice(-1,1);
			self.moves = 0;

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
			if (self.isDrawing) {
				self.addLine(ev.offsetX, ev.offsetY);
			}
		}
	};

	this.addLine = function(x, y) {
		/* end of last line */
		if (self.moves > 0) 
			Lines.lines[Lines.lines.length - 1].e = new Cool.Vector(x, y);
		/* start of new line */
		Lines.lines.push({
			s:  new Cool.Vector(x, y)
		});
		self.moves++;
	};

	this.drawStart = function(ev) {
		if (ev.which == 1 && !Lines.draw.isPlaying) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
		}
	};

	this.drawEnd = function(ev) {
		if (ev.which == 1) self.isDrawing = false;
		if (self.moves % 2 == 1) Lines.lines.splice(-1, 1);
		if (Lines.lines.length > 0 && !Lines.lines[Lines.lines.length - 1].e) 
			Lines.lines.pop(); // remove lines with s and no e
		self.moves = 0;
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
	const panel = new Panel("mouse", "Mouse");
	Lines.interface.panels["mouse"] = panel;

	this.segNumRange = 2;
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
			self.segNumElem.setValue(self.segNumRange);
		},
		key: "h"
	});
	panel.add(this.segNumElem);

	panel.addRow();
	this.jiggleRange = 1;
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
			self.jiggleElem.setValue(self.jiggleRange);
		},
		key: "j"
	});
	panel.add(this.jiggleElem);

	
	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer 
	this.mouseInterval = 30;
	panel.addRow();
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
			self.mouseElem.setValue(self.mouseInterval);
		},
		key: "u"
	});
	panel.add(this.mouseElem);
}