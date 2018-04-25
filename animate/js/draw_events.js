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
				self.addLine(ev.offsetX, ev.offsetY);
		}
	};

	/* add a point */
	this.addLine = function(x, y) {
		Lines.lines.push( new Cool.Vector(x, y) );
	};

	this.drawStart = function(ev) {
		if (ev.which == 1 && !Lines.draw.isPlaying) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
		}
	};

	this.drawEnd = function(ev) {
		if (ev.which == 1) 
			self.isDrawing = false;
		Lines.lines.push("end");
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