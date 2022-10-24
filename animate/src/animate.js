const { Animation, Animator, Drawing, Layer, AntiMixin, PixelMixin } = Lines;
const { Interface, Settings } = UI;
const { UIFile, UILabel, UIModal, UIButton, UINumberStep, UICollection, UIColor, UIToggle, UIDragButton, UISelect } = UI.Elements;
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
lns.render = Render(30, false); // (dps, stats?)
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
	addLoad(settings) {
		lns.palette.setup(settings.palettes);
	}
});
lns.ui.settings.load();
lns.draw.setDefaults();
if (params.src) lns.fio.loadFile(params.src.split('.')[0]);
lns.render.start();
lns.timeline.init();
lns.render.toggleStats();

console.log(lns);

