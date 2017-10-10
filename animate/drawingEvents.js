function DrawingEvents(lines) {
	const self = this;
	this.moves = 0; // number of events recorded/lines added, maybe just lines.length?
	this.isDrawing = false;
	this.addToFrame = false; // for frames with drawings already recorded

	/*
	need to think about how to set up interface.... 
	this seems mad dumb.... 
	maybe do this http://jsfiddle.net/tAs6V/29/
	*/

	/*
		these should be in interface
		have a class for an interface element
	*/

	// divide lines into this many segments
	this.segNumRangeElem = document.getElementById("num");
	this.segNumRangeDisplay = document.getElementById("num-range");
	this.segmentNumRange = this.segNumRangeDisplay.textContent = Number(this.segNumRangeElem.value);
	this.segNumRangeElem.addEventListener("change", function() {
		self.segmentNumRange = self.segNumRangeDisplay.textContent = Number(this.value);
	});
	
	// how far the lines jiggle
	this.jiggleRangeElem = document.getElementById("jiggle"); 
	this.jiggleRangeDisplay = document.getElementById("jiggle-range"); 
	this.jiggleRange = this.jiggleRangeDisplay.textContent = Number(this.jiggleRangeElem.value);
	this.jiggleRangeElem.addEventListener("change", function() {
		self.jiggleRange = self.jiggleRangeDisplay.textContent = Number(this.value);
	});

	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  // this is independent of draw timer (??)
	this.mouseIntervalElem = document.getElementById("mouse");
	this.mouseIntervalDisplay = document.getElementById("mouse-range");
	this.mouseIntervalDisplay.textContent = this.mouseInterval = this.mouseIntervalElem.value;
	this.mouseIntervalElem.addEventListener("change", function() {
		self.mouseInterval = self.mouseIntervalDisplay.textContent = Number(this.value);
	});

	this.outSideCanvas = function(ev) {
		if (ev.toElement.id != lines.canvas.canvas) { 
			if (self.isDrawing) lines.saveLines();
			self.isDrawing = false;
			if (self.moves % 2 == 1) lines.linse.splice(-1,1);
			self.moves = 0;

			/* pointer context click on frames for copy frames */
			if (ev.which == 3) {
				ev.preventDefault();
				const elem = document.elementFromPoint(ev.clientX, ev.clientY);
				const frameIndex = elem.dataset.index;
				if (elem.classList.contains("frame")) {
					if (!elem.classList.contains("copy")){
			 			elem.classList.add("copy")
			 			lines.copyFrames.push( Number(frameIndex) );
			 		}
				}
			}
		}
	};

	this.drawUpdate = function(ev) {
		if (performance.now() > self.mouseInterval + self.mouseTimer) {
			self.mouseTimer = performance.now();
			if (self.isDrawing && (lines.frames[currentFrame] == undefined || self.addToFrame))
				lines.addLine(ev.offsetX, ev.offsetY);
		}
	};

	this.addLine = function(x, y) {
		/* end of last line */
		if (selfmoves > 0) lines.lines[lines.lines.length - 1].e = new Vector(x, y);
		/*start of new line */
		lines.lines.push({
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
		if (self.moves % 2 == 1) lines.lines.splice(-1, 1);
		if (lines.lines.length > 0)
			if (!lines.lines[lines.lines.length - 1].e) lines.lines.pop(); // remove lines with s and no e
		self.moves = 0;
	}

	if (window.PointerEvent) {
		lines.canvas.canvas.addEventListener('pointermove', self.drawUpdate);
		lines.canvas.canvas.addEventListener('pointerdown', self.drawStart);
		lines.canvas.canvas.addEventListener('pointerup', self.drawEnd);
	} else {	
		lines.canvas.canvas.addEventListener('mousemove', self.drawUpdate);
		lines.canvas.canvas.addEventListener('mousedown', self.drawStart);
		lines.canvas.canvas.addEventListener('mouseup', self.drawEnd);
	}
	document.addEventListener('mousemove', self.outSideLines);
}