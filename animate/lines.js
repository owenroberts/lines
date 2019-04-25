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
	

	// width height color, def color is black 000000
	//  lns.canvas = new Canvas(1024, 512, "ffffff" );  // sundays
	lns.canvas = new Canvas(512, 512, "#ffffff" )
	lns.draw = new Draw();
	lns.data = new Data();
	lns.lineColor = new Color();
	// lns.lineColor.set('#ffffff');
	lns.drawEvents = new DrawEvents({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	lns.fio = new Files_IO({
		fit: false, /* fit to canvas when saving */
		save: true, /* save settings */
		bg: true /* bg color */
	});

	// interfaces
	lns.interface = new Interface();
	lns.drawingInterface = new DrawingInterface();

	lns.draw.start(); // necessary ?
});
