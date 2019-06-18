/* global lns object */
window.addEventListener("load", function() {

	lns = {};

	// global parts used everywhere - module? render?
	lns.lines = []; // lines currently being drawn
	lns.layers = [];  // keep separate layers references by frames
	lns.drawings = []; // saved drawings
	lns.currentFrame = 0;
	lns.frames = 0;

	lns.getLayers = function(index) {
		if (!index) index = lns.currentFrame;
		const layers = [];
		for (let i = 0; i < lns.layers.length; i++) {
			const layer = lns.layers[i];
			const frames = layer.f;
			for (let j = 0; j < frames.length; j++) {
				const frame = frames[j];
				if (index >= frame.s && index <= frame.e) {
					layers.push(layer);
					if (callback) callback(layer, frames, frame);
				}
			}
		}
		return layers;
	};

	// modules
	lns.canvas = new Canvas(512, 512, "#ffffff" )
	lns.render = new Render();
	lns.bgImage = new Background();
	lns.data = new Data();
	lns.lineColor = new Color(); // lns.lineColor.set('#ffffff');
	lns.draw = new Draw({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	lns.fio = new Files({
		fit: false, /* fit to canvas when saving */
		save: false, /* save settings on unload  */
		reload: false, /* confirm reload */
		bg: false /* bg color */
	});
	lns.interface = new Interface();

	const openFile = localStorage.getItem('re-open');
	if (openFile) {
		lns.fio.loadFramesFromFile(openFile);
		localStorage.removeItem('re-open');
	}

	lns.render.start(); // necessary ?
});
