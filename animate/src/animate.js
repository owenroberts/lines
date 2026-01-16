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
import { DataPanel } from './data.js';
import { QuickAnimatePanel } from './quick-animate.js';
import { AnimatorPanel } from './animator.js';
import { BrushPanel } from './brush.js';
import { EraserPanel } from './eraser.js';
import { TimelinePanel } from './timeline.js';
import { BackgroundPanel } from './background.js';
import { DrawingsPanel } from './drawings.js'; // really need this??
import { ClipsPanel } from './clips.js';
import { FilesPanel } from './files.js';
import { CapturePanel } from './capture.js';

// import { Sequencer } from './sequencer.js';
// import { Palette } from './palette.js'; // this prob not needed anymore with styles ... but maybe for brush? maybe add to brush ... 

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
	ui.panels.timeline.update();
	ui.panels.drawings.update();
	ui.panels.clips.update();
};

ui.addPanel(new PlaybackPanel(ui, anim, renderer));
ui.addPanel(new FilesPanel(ui, anim, renderer));
ui.addPanel(new CanvasPanel(ui, anim, renderer));
ui.addPanel(new EventsPanel(ui, anim, renderer));
ui.addPanel(new StylesPanel(ui, anim));
ui.addPanel(new DataPanel(ui, anim));
ui.addPanel(new QuickAnimatePanel(ui, anim));
ui.addPanel(new BrushPanel(ui, anim, renderer));
ui.addPanel(new EraserPanel(ui, anim, renderer));
ui.addPanel(new TimelinePanel(ui, anim));
ui.addPanel(new BackgroundPanel(ui, anim, renderer));
ui.addPanel(new ClipsPanel(ui, anim));
ui.addPanel(new CapturePanel(ui, anim, renderer));

ui.addPanel(new DrawingsPanel(ui, anim));
ui.addPanel(new AnimatorPanel(ui, anim));

ui.addSection("canvas");
ui.sections.canvas.el.appendChild(renderer.canvas);

ui.settings.load();
renderer.start();
ui.panels.timeline.init();

console.log(anim, renderer, ui);

// lns.sequencer = Sequencer(lns);

// lns.ui.settings = new Settings(lns, {
// 	name: 'lns', 
// 	workspaceFields: ['hideCursor'],
// 	appSave() {
// 		return {
// 			palettes: lns.palette.getPalettes(), 
// 		};
// 	},
// 	appLoad(settings) {
// 		if (settings.inteface) lns.palette.setup(settings.inteface.palettes);
// 	}
// });

// lns.playback.toggleStats();



