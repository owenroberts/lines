/* rename pointer events (PointerEvent is taken) */
function Mouse() {
	const self = this;
	this.moves = 0; // number of events recorded/lines added, maybe just lines.length?
	this.isDrawing = false; // for drawStart to drawEnd so its not always moving

	this.outSideCanvas = function(ev) {
		//console.log(ev.toElement)
		if (ev.toElement != Lines.canvas.canvas) { 
			if (self.isDrawing) Lines.data.saveLines();
			self.isDrawing = false;
			if (self.moves % 2 == 1) Lines.data.lines.splice(-1,1);
			self.moves = 0;

			/* pointer context click on frames for copy frames */
			if (ev.which == 3) {
				ev.preventDefault();
				const elem = document.elementFromPoint(ev.clientX, ev.clientY);
				const frameIndex = elem.dataset.index;
				if (elem.classList.contains("frame")) {
					if (!elem.classList.contains("copy")){
			 			elem.classList.add("copy")
			 			Lines.data.framesToCopy.push( Number(frameIndex) );
			 		}
				}
			}
		}
	};

	this.drawUpdate = function(ev) {
		if (performance.now() > self.mouseInterval + self.mouseTimer) {
			self.mouseTimer = performance.now();
			/* does it need to stop? */
			if (self.isDrawing) {
				self.addLine(ev.offsetX, ev.offsetY);
			}
		}
	};

	this.addLine = function(x, y) {
		/* end of last line */
		if (self.moves > 0) Lines.data.lines[Lines.data.lines.length - 1].e = new Vector(x, y);
		/*start of new line */
		Lines.data.lines.push({
			s:  new Vector(x, y)
		});
		self.moves++;
	};

	this.drawStart = function(ev) {
		if (ev.which == 1) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
		}
	};

	this.drawEnd = function(ev) {
		if (ev.which == 1) self.isDrawing = false;
		if (self.moves % 2 == 1) Lines.data.lines.splice(-1, 1);
		if (Lines.data.lines.length > 0 && !Lines.data.lines[Lines.data.lines.length - 1].e) 
			Lines.data.lines.pop(); // remove lines with s and no e
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
	panel.add( new UIRange({
		id: "num",
		label: "Segments",
		value: this.segNumRange,
		display: "num-range",
		min: 1,
		max: 20,
		callback: function() {
			self.segNumRange = Number(this.value);
		}
	}) );

	panel.addRow();
	this.jiggleRange = 1;
	panel.add( new UIRange({
		id: "jiggle",
		display: "jiggle-range",
		label: "Jiggle",
		value: this.jiggleRange,
		min: 0,
		max: 10,
		callback: function() {
			self.jiggleRange = Number(this.value);
		}
	}) );

	
	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer 
	this.mouseInterval = 30;
	panel.addRow();
	panel.add( new UIRange({
		id: "mouse-timer",
		display: "mouse-range",
		label: "Mouse Time",
		value: 30,
		min: 0,
		max: 100,
		callback: function() {
			self.mouseInterval = Number(this.value);
		}
	}) );
}