/* global Lines object */
function Lines() {

	/* these should be another module ?? */
	this.frames = [];
	this.copyFrames = [];

	this.lines = []; // lines currently being drawn
	this.copy = []; // not sure? this probably doesn't need to be global ....

	this.drawings = []; // saved drawings

	/* 
	save states never really implemented 
	*/

	/* can this be a module?  timeline? */
	this.currentFrame = 0;
	this.currentFrameCounter = 0; // for when line fps is different from anim fps, counts with floats
	this.isPlaying = false;

	this.fpsElem = document.getElementById("fps");
	this.fps = Number(this.fpsElem.value); // 10 is default but maybe should be 15
	this.lineInterval = 1000/this.fps;  // fps per one second
	this.timer = performance.now(); 
	this.intervalRatio = this.lineInterval / (1000/this.fps);  // this starts same as lineInterval, written out to show math

	this.fpsElem.addEventListener("change", function() {
		self.fps = Number(this.value);
		self.intervalRatio = self.lineInterval / (1000/self.fps);
		this.blur();
	});

	this.onionSkinNum = 0; // number of onion skin frames

	this.canvas = new Canvas();
	this.drawingEvents = new DrawingEvents(this);
	this.color = new Color();
	this.background = new Background();

	this.saveLines = function() {
		
	}
}
window.addEventListener("load", function() {
	const lines = new Lines();
	console.log(lines);
});
