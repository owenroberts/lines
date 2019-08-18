window.addEventListener("load", function() {

	window.lns = {};

	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff");
	lns.render = new Render(); // (lps, lineColor)

	lns.lines = new Animation(lns.canvas.ctx);
	lns.anim = new Animation(lns.canvas.ctx);

	lns.draw = new Draw(lns.lines, { n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	
	
	lns.bgImage = new Background();
	
	lns.data = new Data(lns.anim);

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

	lns.render.start(); // necessary ?
});
