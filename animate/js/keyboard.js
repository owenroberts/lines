/* keyboard events and handlers */
function Keyboard(app) {
	let self = this;

	this.keyDown = function(ev) {
		//console.log(ev.which);
		// if (ev.which == 9) ev.preventDefault(); // tab
		if (document.activeElement.nodeName != "INPUT") {
			if (keys[ev.which] == "space") {
				/* also update buttons?? */
				ev.preventDefault();
				app.draw.toggle();
			}
			if (keys[ev.which] == "a") {
				if (ev.shiftKey) app.data.explode(true, false);
				else  app.data.explode(false, false);
			}
			if (keys[ev.which] == "b") app.draw.background.toggle();
			if (keys[ev.which] == "c") app.data.copyFrames();
			if (keys[ev.which] == "d") app.data.deleteFrame();
			if (keys[ev.which] == "e") app.interface.nextFrame();
			if (keys[ev.which] == "f") app.data.fitCanvasToDrawing();
			if (keys[ev.which] == "g") app.data.duplicate();
			if (keys[ev.which] == "i") app.data.insertFrame();
			if (keys[ev.which] == "k") app.canvas.capture();
			if (keys[ev.which] == "m") app.data.addMultipleCopies();
			if (keys[ev.which] == "o") app.data.loadFramesFromFile();
			if (keys[ev.which] == "q") app.data.offsetDrawing();
			if (keys[ev.which] == "r") app.data.addToFrame();
			if (keys[ev.which] == "s") {
				if (ev.shiftKey) app.data.saveFramesToFile(true);
				else app.data.saveFramesToFile(false);
			}
			if (keys[ev.which] == "x") app.data.clearFrame();
			if (keys[ev.which] == "v") {
				if (ev.ctrlKey) app.data.clearFramesToCopy();
				else app.data.pasteFrames();
			}
			if (keys[ev.which] == "w") app.interface.prevFrame();
			if (keys[ev.which] == "z") {
				if (ev.shiftKey) app.data.cutLastDrawing();
				else if (ev.ctrlKey) app.data.undo();
				else app.data.cutLastSegment();
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);
}