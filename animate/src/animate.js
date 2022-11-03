const { Renderer, Animation, Animator, Drawing, Layer, AntiMixin, PixelMixin } = Lines;
const { Interface, Settings } = UI;
const { UIFile, UILabel, UIModal, UIButton, UINumberStep, UICollection, UIColor, UIToggle, UIDragButton, UISelect, UINumber, UIText } = UI.Elements;
const lns = {};

Object.assign(Layer.prototype, LayerMixin);
Object.assign(Animation.prototype, AnimationMixin);
Object.assign(Drawing.prototype, DrawingMixin);

const params = {};
location.search.substr(1).split('&').map(a => {
	let [key, value] = a.split('=');
	params[key] = value;
});

if (params.render === 'pixel') {
	Object.assign(Lines.prototype, PixelMixin);
}

lns.renderer = Renderer({
	width: 512,
	height: 512,
	bgColor: '#ffffff',
	retina: true,
	dps: 30,
	lineWidth: 2,
});

lns.anim = new Animation(lns.renderer.ctx, 30, true);

// modules
lns.playback = Playback(lns, { stats: false }); // (dps, stats?)
lns.canvas = Canvas(lns);
lns.draw = Draw(lns, { 
	linesInterval: 5, 
	segmentNum: 2,
	jiggleRange: 1,
	wiggleRange: 1, 
	wiggleSpeed: 0.1,
	color: '#000000',
	lineWidth: 1
});
lns.brush = Brush(lns);
lns.eraser = Eraser(lns);
lns.bg = Background(lns);
lns.data = Data(lns);
lns.fio = FilesIO(lns, { // verbose params ...
	fit: false, /* fit to canvas when saving */
	save: false, /* save settings on unload  */
	load: true, /* load setttings after file load */
	reload: false, /* confirm reload */
	bg: true /* bg color */
});
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
lns.animator = AnimatorUI(lns);

lns.ui = Interface(lns, { useMain: false });
lns.ui.setup();
lns.canvas.connect();
lns.playback.connect();
lns.draw.connect();
lns.brush.connect();
lns.eraser.connect();
lns.bg.connect();
lns.data.connect();
lns.fio.connect();
lns.capture.connect();
lns.states.connect();
lns.palette.connect();
lns.drawings.connect();
lns.animator.connect();
lns.timeline.connect();

lns.ui.update = function() {
	lns.timeline.update();
	lns.drawings.update();
	lns.states.update();
};
lns.ui.update();

lns.ui.settings = new Settings(lns, {
	name: 'lns', 
	workspaceFields: ['hideCursor'],
	workspaces: [
		{
			text: 'Animation',
			url: '/animate/workspaces/Animation.json',
		},
		{
			text: 'Drawing',
			url: '/animate/workspaces/Drawing.json',
		}
	],
	appSave() {
		return {
			palettes: lns.palette.getPalettes(), 
		};
	},
	appLoad(settings) {
		lns.palette.setup(settings.interface.palettes);
	}
});
lns.ui.settings.load();
lns.draw.setDefaults();

lns.timeline.init();
lns.playback.toggleStats();
lns.renderer.start();

if (params.src) lns.fio.loadFile(params.src);

console.log(lns);

