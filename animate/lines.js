window.addEventListener("load", function() {

	window.lns = {};

	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff", true);
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
	lns.ui.capture = new Capture();
	lns.ui.states = new States();
	lns.ui.palette = new Palette();
	lns.ui.layers = new Layers();
	lns.ui.drawings = new Drawings();
	lns.ui.fio = new FilesInterface(lns.ui);
	animateInterface(lns.ui);
	lns.ui.settings = new Settings(lns, 'lns', appSave, appLoad);

	lns.ui.settings.canvasLoad = function() {
		if (localStorage['settings-lns']) {
			const settings = JSON.parse(localStorage['settings-lns']);
			if (settings) lns.canvas.setLineWidth(settings.lineWidth);
		}
	};
	
	lns.ui.load('./interface/interface.json', function() {
		const url = location.search.split('=')[1]
		if (url) lns.files.loadFile(url.split('.')[0], lns.ui.fio.update);

		lns.render.start();
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
		rl: lns.ui.rl.isOn
		// displayLayers: lns.ui.layers.canvas.canvas.style.display
	};
}

function appLoad(settings) {
	lns.canvas.setBGColor(settings.canvasColor);
	lns.canvas.setWidth(settings.width);
	lns.canvas.setHeight(settings.height);
	lns.canvas.setLineWidth(settings.lineWidth);
	lns.render.setFps(settings.fps);
	lns.render.setLps(settings.lps);
	lns.draw.layer.c = settings.c;
	lns.render.onionSkinIsVisible = settings.onionSkinIsVisible;
	lns.render.onionSkinNum = settings.onionSkinNum;

	lns.ui.faces.lps.value = settings.lps;
	lns.ui.faces.fps.value = settings.fps;
	lns.ui.faces.lineWidth.value = settings.lineWidth;
	lns.ui.faces.c.value = settings.c;
	/* this can be done with update, but i dont like lns.ui.faces being the location ... 
		update is also setting value
		setValue doesn't set the input for range values 
		lotta ui work left to do! */

	lns.ui.faces.bgColor.value = settings.canvasColor;
	lns.ui.faces.onionSkinNum.value = settings.onionSkinNum;

	lns.ui.faces.lineWidth.update(settings.lineWidth);

	/* update sets value and calls callback ...*/
	lns.ui.faces.mouseInterval.update(settings.mouseInterval);

	lns.ui.palette.palettes = settings.palettes;
	if (lns.ui.palette.current) 
		self.loadPalette(lns.palettes.current);
	for (const key in settings.palettes) {
		if (key != 'current') {
			lns.ui.panels.palette.add(new UIButton({
				text: key,
				callback: function() {
					lns.ui.palette.loadPalette(key);
				}
			}));
		}
	}

	if (settings.rl == false) {
		lns.ui.rl.callback();
		lns.ui.rl.toggle();
	}

	if (settings.displayLayers) {
		lns.ui.layers.toggleCanvas.callback();
		lns.ui.layers.toggleCanvas.toggle();
	}
}
