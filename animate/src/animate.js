const { Animation, Animator, Drawing, Layer, AntiMixin, PixelMixin } = Lines;
const { Interface } = UI;
const { UIFile, UILabel, UIModal, UIButton, UINumberStep } = UI.Elements;
const lns = {};

Object.assign(Layer.prototype, LayerMixin);
Object.assign(Animation.prototype, AnimationMixin);

const params = {};
location.search.substr(1).split('&').map(a => {
	let [key, value] = a.split('=');
	params[key] = value;
});

if (params.render === 'pixel') {
	Object.assign(Lines.prototype, PixelMixin);
}

/*
	lns.renderer = Renderer({
		id: 'lines',
		width: 512,
		height: 512,
		bgColor: '#ffffff',
		retina: true,
		dps: 30,
		stats: true
	});
*/

// modules
lns.canvas = Canvas("lines", 512, 512, "#ffffff", true);
lns.render = Render(30, true); // (dps, stats?)
lns.anim = new Animation(lns.canvas.ctx, 30, true);
lns.draw = Draw(lns, { 
	linesInterval: 5, 
	segmentNum: 2,
	jiggleRange: 1,
	wiggleRange: 1, 
	wiggleSpeed: 0.1,
	color: '#000000' 
});
lns.bg = BackgroundImage();
lns.data = Data(lns);
lns.fio = FilesIO(lns, {
	fit: false, /* fit to canvas when saving */
	save: false, /* save settings on unload  */
	load: true, /* load setttings after file load */
	reload: false, /* confirm reload */
	bg: true /* bg color */
});
lns.play = Play(lns);
lns.capture = Capture(lns, {
	useSequentialNumbering: true,
	captureSettings: {
		lineWidth: 1,
		canvasScale: 2,
	}
});
lns.states = States(lns);
lns.palette = Palette(lns);
lns.drawings = Drawings(lns);
lns.timeline = Timeline();
lns.animator = AnimatorUI();


lns.ui = Interface(lns, { useMain: false });
lns.ui.setup();
lns.canvas.connect();
lns.render.connect();
lns.draw.connect();
lns.bg.connect();
lns.data.connect();
lns.fio.connect();
lns.play.connect();
lns.capture.connect();
lns.states.connect();
lns.palette.connect();
lns.drawings.connect();
lns.animator.connect();
lns.timeline.connect();

console.log(lns);


// const workspaceFields = [
// 	'hideCursor',
// ];

// lns.ui.settings = new Settings(lns, 'lns', appSave, workspaceFields);

// lns.ui.load('./interface/interface.json', function() {
// 	lns.draw.setDefaults();
// 	lns.ui.settings.load(appLoad);
// 	if (params.src) lns.files.loadFile(params.src.split('.')[0]);
// 	lns.ui.update();
// 	lns.render.start();
// 	lns.ui.timeline.init();
// 	lns.render.toggleStats();
// });

// // update ui for animate specific modules
// lns.uiUpdate = function() {
// 	lns.ui.timeline.update();
// 	lns.ui.drawings.update();
// 	lns.ui.states.update();
// };

// function appSave() {
// 	return {
// 		palettes: lns.ui.palette.palettes, 
// 	};
// }

// function appLoad(settings) {
// 	lns.ui.palette.setup(settings.palettes);
// }
