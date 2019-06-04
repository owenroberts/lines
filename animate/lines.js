/* global lns object */
window.addEventListener("load", function() {

	lns = {};

	// global parts used everywhere - module? render?
	lns.lines = []; // lines currently being drawn
	lns.frames = [];
	lns.layers = [];  // keep separate layers references by frames
	lns.drawings = []; // saved drawings
	lns.currentFrame = 0;

	// modules
	lns.canvas = new Canvas(512, 512, "#ffffff" )
	lns.render = new Render();
	lns.bgImage = new Background();
	lns.data = new Data();
	lns.lineColor = new Color(); // lns.lineColor.set('#ffffff');
	lns.draw = new Draw({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	lns.fio = new Files({
		fit: false, /* fit to canvas when saving */
		save: true, /* save settings */
		reload: false, /* confirm reload */
		bg: true /* bg color */
	});

	lns.interface = new Interface();

	lns.render.start(); // necessary ?
});
