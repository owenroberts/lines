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
	
	lns.ui.capture = new Capture();
	lns.ui.states = new States();
	lns.ui.palette = new Palette();
	lns.ui.layers = new Layers();
	lns.ui.drawings = new Drawings();
	lns.ui.fio = new FilesInterface(lns.ui);
	lns.ui.settings = new Settings(lns, 'lns', appSave, appLoad);
	lns.ui.ai = new AnimateInterface(lns.ui);

	lns.ui.settings.canvasLoad = function() {
		if (localStorage['settings-lns']) {
			const settings = JSON.parse(localStorage['settings-lns']);
			if (settings) lns.canvas.setLineWidth(settings.lineWidth);
		}
	};
	
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
		rl: lns.ui.rl.isOn,
		displayLayers: lns.ui.layers.canvas.canvas.style.display
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

	lns.ui.faces.lps.setValue(settings.lps);
	lns.ui.faces.fps.setValue(settings.fps);
	lns.ui.faces.lineWidth.setValue(settings.lineWidth);
	lns.ui.faces.c.setValue(settings.c);
	/* this can be done with update, but i dont like lns.ui.faces being the location ... 
		update is also setting value
		setValue doesn't set the input for range values 
		lotta ui work left to do! */

	lns.ui.faces.bgColor.setValue(settings.canvasColor);
	lns.ui.faces.lineWidth.update(settings.lineWidth);
	lns.ui.faces.onionSkinNum.setValue(settings.onionSkinNum);

	/* update sets value and calls callback ...*/
	lns.ui.faces.mouseInterval.update(settings.mouseInterval);

	lns.ui.palette.palettes = settings.palettes;
	if (lns.ui.palette.current) 
		self.loadPalette(lns.palettes.current);
	for (const key in settings.palettes) {
		if (key != 'current') {
			lns.ui.panels.palette.add(new UIButton({
				title: key,
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
