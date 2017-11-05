/* rename pointer events (PointerEvent is taken) */
function Mouse(app) {
	const self = this;
	this.moves = 0; // number of events recorded/lines added, maybe just lines.length?
	this.isDrawing = false; // for drawStart to drawEnd so its not always moving

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
	this.segNumRange = this.segNumRangeDisplay.textContent = Number(this.segNumRangeElem.value);
	this.segNumRangeElem.addEventListener("change", function() {
		self.segNumRange = self.segNumRangeDisplay.textContent = Number(this.value);
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
	this.mouseIntervalDisplay.textContent = this.mouseInterval = Number(this.mouseIntervalElem.value);
	this.mouseIntervalElem.addEventListener("change", function() {
		self.mouseInterval = self.mouseIntervalDisplay.textContent = Number(this.value);
	});

	this.outSideCanvas = function(ev) {
		//console.log(ev.toElement)
		if (ev.toElement != app.canvas.canvas) { 
			if (self.isDrawing) app.data.saveLines();
			self.isDrawing = false;
			if (self.moves % 2 == 1) app.data.lines.splice(-1,1);
			self.moves = 0;

			/* pointer context click on frames for copy frames */
			if (ev.which == 3) {
				ev.preventDefault();
				const elem = document.elementFromPoint(ev.clientX, ev.clientY);
				const frameIndex = elem.dataset.index;
				if (elem.classList.contains("frame")) {
					if (!elem.classList.contains("copy")){
			 			elem.classList.add("copy")
			 			app.data.framesToCopy.push( Number(frameIndex) );
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
		if (self.moves > 0) app.data.lines[app.data.lines.length - 1].e = new Vector(x, y);
		/*start of new line */
		app.data.lines.push({
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
		if (self.moves % 2 == 1) app.data.lines.splice(-1, 1);
		if (app.data.lines.length > 0 && !app.data.lines[app.data.lines.length - 1].e) 
			app.data.lines.pop(); // remove lines with s and no e
		self.moves = 0;
	}

	if (window.PointerEvent) {
		app.canvas.canvas.addEventListener('pointermove', self.drawUpdate);
		app.canvas.canvas.addEventListener('pointerdown', self.drawStart);
		app.canvas.canvas.addEventListener('pointerup', self.drawEnd);
	} else {	
		app.canvas.canvas.addEventListener('mousemove', self.drawUpdate);
		app.canvas.canvas.addEventListener('mousedown', self.drawStart);
		app.canvas.canvas.addEventListener('mouseup', self.drawEnd);
	}
	document.addEventListener('mousemove', self.outSideCanvas);
}