window.addEventListener("load", function() {

	lns = {};

	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff");
	lns.render = new Render(12); // (lps)

	lns.lines = new Animation(lns.canvas.ctx);
	lns.anim = new Animation(lns.canvas.ctx);
	lns.lines.debug = true;

	lns.draw = new Draw(lns.lines, { n: 2, r: 1, w: 1, v: 0.1, c: '#000000' }); // defaults
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
	lns.ui.load('./interface/interface.json'); 

	const openFile = localStorage.getItem('re-open');
	if (openFile) {
		lns.files.loadFile(openFile, lns.ui.fio.updateInterface);
		localStorage.removeItem('re-open');
	}

	if (location.search.split('=')[1]) {
		lns.files.loadFile(location.search.split('=')[1].split('.')[0]);
		lns.ui.fio.title.setValue(location.search.split('=')[1].split('.')[0].split('/').pop())
	}

	lns.render.start(); // necessary ?
});
