/* global lns object */
window.addEventListener("load", function() {

	lns = {};

	// global parts used everywhere - module? render?
	lns.lines = []; // lines currently being drawn
	lns.layers = [];  // keep separate layers references by frames
	lns.drawings = []; // saved drawings
	lns.currentFrame = 0;
	lns.numFrames = 0; // or 1 if 0 frame is one frame .... fml, or frames start at 1

	// modules
	lns.canvas = new Canvas(512, 512, "#ffffff");
	lns.render = new Render();
	lns.bgImage = new Background();
	lns.data = new Data();
	lns.lineColor = new Color(); // lns.lineColor.set('#ffffff');
	lns.draw = new Draw({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	lns.files = new Files({
		fit: false, /* fit to canvas when saving */
		save: false, /* save settings on unload  */
		reload: false, /* confirm reload */
		bg: false /* bg color */
	});
	lns.interface = new Interface();

	const openFile = localStorage.getItem('re-open');
	if (openFile) {
		lns.files.loadFramesFromFile(openFile);
		localStorage.removeItem('re-open');
	}

	lns.render.start(); // necessary ?
});
