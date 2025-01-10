import '../css/animate.scss';

import { Renderer, LinesAnimation, Animator, Drawing, Layer, AntiMixin, PixelMixin, Style } from '../../src/Lines.js';

import { Interface, Settings, Elements } from '../../../ui/src/UI.js';

const { UIFile, UILabel, UIModal, UIButton, UINumberStep, UICollection, UIColor, UIToggle, UIDragButton, UISelect, UINumber, UIText, UIElement, UIRow } = Elements;

import { LayerMixin } from './LayerMixin.js';
import { AnimationMixin } from './AnimationMixin.js';
import { DrawingMixin } from './DrawingMixin.js';

import { AnimatorUI } from './AnimatorUI.js';
import { Background } from './Background.js';
import { Brush } from './Brush.js';
import { Canvas } from './Canvas.js';
import { Capture } from './Capture.js';
import { Data } from './Data.js';
import { Draw } from './Draw.js';
import { Styles } from './Styles.js';
import { Drawings } from './Drawings.js';
import { Eraser } from './Eraser.js';
import { Events } from './Events.js';
import { FilesIO } from './FilesIO.js';
import { Palette } from './Palette.js';
import { Playback } from './Playback.js';
import { Sequencer } from './Sequencer.js';
import { States } from './States.js';
import { Timeline } from './Timeline.js';

// import { Clip } from './UI/Clip.js';
// import { Layer } from './UI/Layer.js';
// import { Sequence } from './UI/Sequence.js';
// import { TimelineGroup } from './UI/TimelineGroup.js';
// import { Tween } from './UI/Tween.js';

const lns = {};

Object.assign(Layer.prototype, LayerMixin);
Object.assign(LinesAnimation.prototype, AnimationMixin);
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
	lineWidth: 1,
});


lns.anim = new LinesAnimation(lns.renderer.ctx, 30, true, true);
lns.anim.drawings.push(new Drawing());
lns.anim.layers.push(new Layer({ 
	// ...defaults, 
	drawingIndex: 0, // Math.max(lns.anim.drawings.length - 1, 0),
	styleIndex: 0,
	startFrame: 0, // lns.anim.currentFrame,
}));
lns.anim.styles.push(new Style());

// modules
lns.playback = Playback(lns, { stats: false }); // (dps, stats?)
lns.canvas = Canvas(lns);


// lns.draw = Draw(lns, { 
// 	linesInterval: 5, 
// 	segmentNum: 2,
// 	jiggleRange: 1,
// 	wiggleRange: 1, 
// 	wiggleSpeed: 0.1,
// 	color: '#000000',
// 	lineWidth: 1
// });


lns.styles = Styles(lns, lns.anim.styles[0].getProps());

lns.brush = Brush(lns);
lns.eraser = Eraser(lns);
lns.events = Events(lns);
lns.bg = Background(lns);
lns.data = Data(lns);
lns.fio = FilesIO(lns, { // verbose params ...
	fit: false, // fit to canvas when saving
	save: false, // save settings on unload
	load: true, // load setttings after file load
	reload: false, // confirm reload
	bg: true // bg color
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
lns.timeline = Timeline(lns);
lns.sequencer = Sequencer(lns);
lns.animator = AnimatorUI(lns);

lns.ui = Interface(lns, { useMain: false });
lns.ui.setup();

lns.canvas.connect();
lns.playback.connect();
// lns.draw.connect();
lns.styles.connect();
lns.events.connect();
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
lns.sequencer.connect();

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
			url: 'workspaces/Animation.json',
		},
		{
			text: 'Drawing',
			url: 'workspaces/Drawing.json',
		}
	],
	appSave() {
		return {
			palettes: lns.palette.getPalettes(), 
		};
	},
	appLoad(settings) {
		if (settings.inteface) lns.palette.setup(settings.inteface.palettes);
	}
});
// lns.ui.settings.load();
// lns.draw.setDefaults();

lns.timeline.init();
lns.playback.toggleStats();
lns.renderer.start();
lns.ui.settings.load();

if (params.src) {
	lns.fio.loadFile(params.src);
}

console.log('lns', lns);
window.lns = lns;
