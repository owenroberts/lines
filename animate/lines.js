window.addEventListener("load", function() {

	window.lns = {};

	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff", true);
	lns.render = new Render(10); // (lps)

	lns.anim = new Animation(lns.canvas.ctx);

	lns.draw = new Draw({ n: 2, r: 1, w: 1, v: 0.1, c: '#000000' }); // defaults
	lns.bgImage = new Background();
	lns.data = new Data(lns.anim);
	lns.files = new Files({
		fit: false, /* fit to canvas when saving */
		save: false, /* save settings on unload  */
		load: true, /* load setttings after file load */
		reload: false, /* confirm reload */
		bg: true /* bg color */
	});
	
	lns.ui = new Interface(lns);
	lns.ui.capture = new Capture();
	lns.ui.states = new States();
	lns.ui.palette = new Palette();
	lns.ui.layers = new Layers();
	lns.ui.drawings = new Drawings();
	lns.ui.play = new Play();
	lns.ui.timeline = new Timeline();
	setupAnimateInterface(lns.ui);
	lns.ui.settings = new Settings(lns, 'lns', appSave);

	lns.ui.load('./interface/interface.json', function() {
		lns.draw.setDefaults();
		lns.ui.settings.load(appLoad);
		const url = location.search.split('=')[1]
		if (url) lns.files.loadFile(url.split('.')[0], lns.ui.updateFIO);
		lns.ui.update();
		lns.render.start();

		lns.ui.timeline.init();
	});
});

function appSave() {
	return {
		canvasColor: lns.canvas.bgColor,
		lineWidth: lns.canvas.ctx.lineWidth,
		c: lns.draw.layer.c,
		width: lns.canvas.width,
		height: lns.canvas.height,
		fps: lns.anim.fps,
		lps: lns.render.lps,
		onionSkinIsVisible: lns.render.onionSkinIsVisible,
		onionSkinNum: lns.render.onionSkinNum,
		mouseInterval: lns.draw.mouseInterval,
		palettes: lns.ui.palette.palettes,
		rl: lns.ui.faces.rl.value,
		timelineView: lns.ui.faces.timelineView.value
	};
}

function appLoad(settings) {

	/* environment + ui + lns.anim */
	lns.ui.faces.lps.update(settings.lps);

	/* environment + ui */
	lns.ui.faces.onionSkinNum.update(settings.onionSkinNum);
	lns.ui.faces.mouseInterval.update(settings.mouseInterval);
	lns.ui.faces.width.update(settings.width);
	lns.ui.faces.height.update(settings.height);
	lns.ui.faces.bgColor.update(settings.canvasColor);	
	lns.ui.faces.timelineView.update(settings.timelineView);

	lns.ui.faces.lineWidth.update(settings.lineWidth); // has to be called last bc of reset ... 

	/* lns.anim + ui */
	lns.ui.faces.fps.update(settings.fps);
	lns.ui.faces.c.update(settings.c);

	// palettes - no need to separate module from ui bc its all ui 
	// - only one not a ui with update ... 
	lns.ui.palette.setup(settings.palettes);

	/* ui only */
	lns.ui.faces.rl.update(settings.rl);  // toggle not dependent on another value
}
