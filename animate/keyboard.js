/* keyboard events and handlers */
function Keyboard(app) {
	let self = this;

	this.keyDown = function(ev) {
		if (document.activeElement.nodeName != "INPUT") {
			if (keys[ev.which] == "space") {
				evs.preventDefault();
				playToggle();
			}
			if (keys[ev.which] == "b") toggleBkg();
			if (keys[ev.which] == "c") app.data.copyFrames();
			if (keys[ev.which] == "d") app.data.deleteFrame();
			if (keys[ev.which] == "e") nextFrame();
			if (keys[ev.which] == "f") fitCanvasToDrawing();
			if (keys[ev.which] == "g") app.data.duplicate();
			if (keys[ev.which] == "i") app.data.insertFrame();
			if (keys[ev.which] == "k") screenCapture();
			if (keys[ev.which] == "m") app.data.addMultipleCopies();
			if (keys[ev.which] == "o") loadFramesFromFile();
			if (keys[ev.which] == "r") app.data.addToFrame();
			if (keys[ev.which] == "s") saveFramesToFile(ev);
			if (keys[ev.which] == "x") app.data.clearFrame();
			if (keys[ev.which] == "v") {
				if (ev.ctrlKey) app.data.clearFramesToCopy();
				else pasteFrames();
			}
			if (keys[ev.which] == "w") prevFrame();
			if (keys[ev.which] == "z") {
				if (ev.shiftKey) app.data.cutLastDrawing();
				else if (ev.ctrlKey) app.data.undo();
				else app.data.cutLastSegment();
			}
		}
	}
	document.addEventListener("keydown", keyDown, false);

}