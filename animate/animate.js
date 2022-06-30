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
	
	lns.ui = new Interface(lns);
	lns.ui.capture = new Capture({
		useSequentialNumbering: true
	});
	lns.ui.states = new States();
	lns.ui.palette = new Palette();
	lns.ui.drawings = new Drawings();
	lns.ui.play = new Play();
	lns.ui.timeline = new Timeline();
	lns.ui.animator = new AnimatorInterface();
	setupAnimateInterface(lns.ui);
	lns.ui.settings = new Settings(lns, 'lns', appSave);

	lns.ui.load('./interface/interface.json', function() {
		lns.draw.setDefaults();
		lns.ui.settings.load(appLoad);
		if (params.src) lns.files.loadFile(params.src.split('.')[0], lns.ui.updateFIO);
		lns.ui.update();
		lns.render.start();
		lns.ui.timeline.init();
		if (lns.render.showStats) {
			lns.ui.panels.play.el.appendChild(lns.render.stats.dom);
		}
	});
});

function appSave() {
	return {
		canvasColor: lns.canvas.bgColor,
		lineWidth: lns.canvas.ctx.lineWidth,
		color: lns.draw.layer.color,
		width: lns.canvas.width,
		height: lns.canvas.height,
		fps: lns.anim.fps,
		dps: lns.render.dps,
		onionSkinIsVisible: lns.render.onionSkinIsVisible,
		onionSkinNum: lns.render.onionSkinNum,
		mouseInterval: lns.draw.mouseInterval,
		palettes: lns.ui.palette.palettes,
		rl: lns.ui.faces.rl.value,
		viewLayers: lns.ui.faces.viewLayers.value,
		viewActiveLayers: lns.ui.faces.viewActiveLayers.value,
		timelineAutoFit: lns.ui.faces.timelineAutoFit.value,
		timelineView: lns.ui.faces.timelineView.value,
		canvasScale: lns.ui.faces.canvasScale.value,
		interfaceScale: lns.ui.faces.interfaceScale.value,
		quickRefScale: lns.ui.faces.quickRefScale.value,
		quickRefList: lns.ui.panels.quickRef.list,
		hideCursor: lns.ui.faces.hideCursor.value,
		viewStats: lns.ui.faces.viewStats.value,
	};
}

function appLoad(settings) {

	/* environment + ui + lns.anim */
	lns.ui.faces.dps.update(settings.dps);

	/* environment + ui */
	lns.ui.faces.onionSkinNum.update(settings.onionSkinNum);
	lns.ui.faces.onionSkinIsVisible.update(settings.onionSkinIsVisible);
	lns.ui.faces.mouseInterval.update(settings.mouseInterval);
	lns.ui.faces.width.update(settings.width);
	lns.ui.faces.height.update(settings.height);
	lns.ui.faces.bgColor.update(settings.canvasColor);	
	lns.ui.faces.viewLayers.update(settings.viewLayers);
	lns.ui.faces.viewActiveLayers.update(settings.viewActiveLayers);
	lns.ui.faces.hideCursor.update(settings.hideCursor);
	lns.ui.faces.viewStats.update(settings.viewStats);

	lns.ui.faces.timelineAutoFit.update(settings.timelineAutoFit);
	lns.ui.faces.timelineView.update(settings.timelineView);

	lns.ui.faces.canvasScale.update(settings.canvasScale);
	lns.ui.faces.interfaceScale.update(settings.interfaceScale);
	lns.ui.faces.quickRefScale.update(settings.quickRefScale);
	console.log(lns.ui.faces.quickRefScale, settings.quickRefScale);

	settings.quickRefList.forEach(ref => {
		lns.ui.createUI(ref, ref.mod, ref.sub, lns.ui.panels.quickRef);
	});
	lns.ui.panels.quickRef.list = settings.quickRefList;

	lns.ui.faces.lineWidth.update(settings.lineWidth); // has to be called last bc of reset ... 

	/* lns.anim + ui */
	lns.ui.faces.fps.update(settings.fps);
	lns.ui.faces.color.update(settings.color);

	// palettes - no need to separate module from ui bc its all ui 
	// - only one not a ui with update ... 
	lns.ui.palette.setup(settings.palettes);

	/* ui only */
	lns.ui.faces.rl.update(settings.rl);  // toggle not dependent on another value
}
