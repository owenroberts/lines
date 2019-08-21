window.addEventListener("load", function() {

	window.lns = {};

	// global parts used everywhere
	lns.lines = []; // lines currently being drawn
	lns.layers = [];  // keep separate layers references by frames
	lns.drawings = []; // saved drawings
	lns.currentFrame = 0;
	lns.numFrames = 0; // or 1 if 0 frame is one frame .... fml, or frames start at 1

	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff");
	lns.render = new Render(); // (fps, lineColor)
	lns.bgImage = new Background();
	lns.data = new Data();
	lns.draw = new Draw({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	lns.files = new Files({
		fit: false, /* fit to canvas when saving */
		save: false, /* save settings on unload  */
		load: true, /* load setttings after file load */
		reload: false, /* confirm reload */
		bg: false /* bg color */
	});
	
	lns.ui = new Interface(lns);
	animateInterface(lns.ui); /* add local ui modules first, not a great pattern */
	lns.ui.load('./js/interface.json'); 

	const openFile = localStorage.getItem('re-open');
	if (openFile) {
		lns.files.loadFile(openFile, lns.ui.fio.updateInterface);
		localStorage.removeItem('re-open');
	}

	if (location.search.split('=')[1]) {
		lns.files.loadFile(location.search.split('=')[1].split('.')[0])
	}

	lns.render.start(); // necessary ?
});
