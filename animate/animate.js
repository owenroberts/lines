window.addEventListener("load", function() {

	window.lns = {};

	Object.assign(Layer.prototype, LayerMixin);
	Object.assign(Lines.prototype, LinesMixin);

	const params = {};
	location.search.substr(1).split('&').map(a => {
		let [key, value] = a.split('=');
		params[key] = value;
	});

	if (params.render === 'pixel') {
		Object.assign(Lines.prototype, PixelMixin);
	}
	
	// modules
	lns.canvas = new Canvas("lines", 512, 512, "#ffffff", true);
	lns.render = new Render(30, true); // (dps, stats?)

	lns.anim = new Lines(lns.canvas.ctx, 30, true);
	lns.draw = new Draw({ 
		linesInterval: 5, 
		segmentNum: 2,
		jiggleRange: 1,
		wiggleRange: 1, 
		wiggleSpeed: 0.1,
		color: '#000000' 
	}); // defaults
	lns.bgImage = new Background();
	lns.data = new Data();
	lns.files = new Files({
		fit: false, /* fit to canvas when saving */
		save: false, /* save settings on unload  */
		load: true, /* load setttings after file load */
		reload: false, /* confirm reload */
		bg: true /* bg color */
	});

	const workspaceFields = [
		'hideCursor',
	];
	
	lns.ui = new Interface(lns);
	lns.ui.capture = new Capture({
		useSequentialNumbering: true,
		captureSettings: {
			lineWidth: 1,
			canvasScale: 2,
		}
	});
	lns.ui.states = new States();
	lns.ui.palette = new Palette();
	lns.ui.drawings = new Drawings();
	lns.ui.play = new Play();
	lns.ui.timeline = new Timeline();
	lns.ui.animator = new AnimatorInterface();
	lns.ui.settings = new Settings(lns, 'lns', appSave, workspaceFields);

	lns.ui.load('./interface/interface.json', function() {
		lns.draw.setDefaults();
		lns.ui.settings.load(appLoad);
		if (params.src) lns.files.loadFile(params.src.split('.')[0]);
		lns.ui.update();
		lns.render.start();
		lns.ui.timeline.init();
		lns.render.toggleStats();
	});

	// update ui for animate specific modules
	lns.uiUpdate = function() {
		lns.ui.timeline.update();
		lns.ui.drawings.update();
		lns.ui.states.update();
	};
});

function appSave() {
	return {
		palettes: lns.ui.palette.palettes, 
	};
}

function appLoad(settings) {
	lns.ui.palette.setup(settings.palettes);
}
