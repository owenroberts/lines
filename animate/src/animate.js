import '../css/animate.scss';

import { Renderer, Animator, Drawing, Layer, AntiMixin, PixelMixin, Style } from '../../src/lines.js';

import { Interface, Settings, UISection } from '../../../oi/src/oi.js';

import { LayerMixin } from './layer-mixin.js';
import { AnimateAnim } from './animate-anim.js';
import { DrawingMixin } from './drawing-mixin.js';

import { PlaybackPanel } from './playback.js';
import { CanvasPanel } from './canvas.js';
import { EventsPanel } from './events.js';
import { StylesPanel } from './styles.js';

// import { AnimatorUI } from './animator-ui.js';
// import { Background } from './background.js';
// import { Brush } from './brush.js';
// import { Capture } from './capture.js';
// import { Data } from './cata.js';
// import { Drawings } from './drawings.js';
// import { Eraser } from './eraser.js';
// import { FilesIO } from './files-io.js';
// import { Palette } from './palette.js';
// import { Sequencer } from './sequencer.js';
// import { States } from './states.js';
// import { Timeline } from './timeline.js';

Object.assign(Layer.prototype, LayerMixin);
Object.assign(Drawing.prototype, DrawingMixin);

const renderer = new Renderer({
	width: 512,
	height: 512,
	bgColor: '#ffffff',
	isMultiColor: true,
	isMultiLineWidth: true,
});

const anim = new AnimateAnim(renderer);
anim.drawings.push(new Drawing());
anim.layers.push(new Layer());
anim.styles.push(new Style());

const ui = new Interface({
	name: "lines",
	workspaces: [{
		text: 'animation',
		url: 'workspaces/animation.json',
	},
	{
		text: 'drawing',
		url: 'workspaces/drawing.json',
	}],
	
});

ui.update = () => {
	// ui.panels.timeline.update();
	// ui.panels.drawings.update();
	// ui.panels.states.update();
};

ui.addPanel(new PlaybackPanel(anim, renderer, ui));
ui.addPanel(new CanvasPanel(anim, renderer, ui));
ui.addPanel(new EventsPanel(anim, renderer, ui));
ui.addPanel(new StylesPanel(anim, ui));
// lns.styles = Styles(lns, lns.anim.styles[0].getProps());

ui.addSection("canvas");
ui.sections.canvas.el.appendChild(renderer.canvas);

ui.settings.load();
renderer.start();

console.log(anim, renderer, ui);

// lns.brush = Brush(lns);
// lns.eraser = Eraser(lns);
// lns.bg = Background(lns);
// lns.data = Data(lns);
// lns.fio = FilesIO(lns, { // verbose params ...
// 	fit: false, // fit to canvas when saving
// 	save: false, // save settings on unload
// 	load: true, // load setttings after file load
// 	reload: false, // confirm reload
// 	bg: true // bg color
// });

// lns.capture = Capture(lns, {
// 	useSequentialNumbering: true,
// 	captureSettings: {
// 		lineWidth: 1,
// 		canvasScale: 2,
// 	}
// });
// lns.states = States(lns);
// lns.palette = Palette(lns);
// lns.drawings = Drawings(lns);
// lns.timeline = Timeline(lns);
// lns.sequencer = Sequencer(lns);
// lns.animator = AnimatorUI(lns);

// lns.ui.update = function() {
// 	lns.timeline.update();
// 	lns.drawings.update();
// 	lns.states.update();
// };
// lns.ui.update();


// lns.ui.settings = new Settings(lns, {
// 	name: 'lns', 
// 	workspaceFields: ['hideCursor'],
// 	workspaces: [
// 		{
// 			text: 'Animation',
// 			url: 'workspaces/Animation.json',
// 		},
// 		{
// 			text: 'Drawing',
// 			url: 'workspaces/Drawing.json',
// 		}
// 	],
// 	appSave() {
// 		return {
// 			palettes: lns.palette.getPalettes(), 
// 		};
// 	},
// 	appLoad(settings) {
// 		if (settings.inteface) lns.palette.setup(settings.inteface.palettes);
// 	}
// });

// lns.timeline.init();
// lns.playback.toggleStats();



