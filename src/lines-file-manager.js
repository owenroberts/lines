import { assert, randomInt } from '../../cool/cool.js';
import { Drawing, Layer, Style, LINES_VERSION } from './lines.js';

// ** update example with this

/**
 * load and save files for lines
 */
export class FileManager {
	
	constructor(anim, renderer) {
		this.anim = anim;
		this.renderer = renderer;
	}

	saveData(title, groups, isSingleFrame) {

		const json = {
			title: title ?? prompt("name file"),
			v: LINES_VERSION,
			w: this.renderer.width,
			h: this.renderer.height,
			dpf: this.anim.dpf,
			mc: [...new Set(this.anim.layers.map(layer => layer.color))].length > 1, // filter
			mw: [...new Set(this.anim.layers.map(layer => layer.lineWidth))].length > 1,
			bg: this.renderer.bgColor,
			d: this.anim.drawings.map(d => d ? d.getPoints() : null), // *** pruned
		};

		json.d.pop(); // *** remove active drawing
		if (json.d.length === 0) {
			console.log('File not saved, no drawings to save.');
			return;
		}

		json.l = isSingleFrame ? 
			this.anim.layers
				.filter(l => l.isInFrame(this.anim.currentFrame)) 
				.map(l => { return { ...l.getSaveProps(), f: [0, 0] }}) :
			this.anim.layers.map(l => l.getSaveProps());

		// need to prune drawings after

		json.l.pop(); // *** remove active layer
		if (json.l.length === 0) return;

		// this is part of layers already right? just need to load ... 
		// const groups = this.timeline.groups();
		if (groups.length > 0) json.g = [...groups];

		const states = Object.keys(this.anim.states)
			.filter(s => s !== 'default');

		if (states.length > 0) {
			json.s = {};
			states.forEach(state => {
				json.s[state] = [
					this.anim.states[state].start, 
					this.anim.states[state].end,
					this.anim.states[state].dir ?? 1,
					this.anim.states[state].loop ?? true,
				];
			});
		}

		// styles
		json.st = structuredClone(this.anim.styles);

		json.q = structuredClone(this.anim.sequences ?? []);
		json.qi = +(this.anim.sequenceIndex ?? -1);
		return json;
	}

	resetAnim() {
		// not DRY with anim constructor
		// can't overwrite, break refs
		
		this.anim.drawings = [];
		this.anim.layers = [];
		this.anim.styles = [];
		
		this.currentFrame = 0;
		this.drawCount = 0;

		this.override = {};

		this.stateName = 'default'; // set state label
		this.states = { 'default': { start: 0, end: 0, dir: 1, loop: true } };

		this.sequences = [];
		this.sequenceIndex = -1; 
	}

	loadData(json, callback) {
		assert(json.v === LINES_VERSION, `json data v${json.v} is not correct version, lines version = ${LINES_VERSION}`);

		for (let i = 0; i < json.d.length; i++) {
			this.anim.drawings[i] = json.d[i] ? 
				new Drawing(json.d[i]) : 
				null; // still necessary? do i prune drawings on save??
		}

		for (let i = 0; i < json.l.length; i++) {
			const params = this.loadLayerParams(json.l[i]);
			const layer = new Layer(params);
			layer.drawingEndIndex = this.anim.drawings[params.drawingIndex].length;
			layer.linesCount = randomInt(5); // weird this is here?
			this.anim.layers[i] = layer;
		}

		// no DRY with animate-anim ... 
		const endFrame = this.anim.layers
			.map(layer => { return layer.endFrame; });
		this.anim.endFrame = Math.max.apply(Math, endFrame);

		// states
		for (const key in json.s) {
			this.anim.states[key] = {
				start: json.s[key][0],
				end: json.s[key][1],
				dir: json.s[key][2] ?? 1,
				loop: json.s[key][3] ?? true,
			};
		}

		for (let i = 0; i < json.st.length; i++) {
			const params = structuredClone(json.st[i]);
			this.anim.styles[i] = new Style(params);
		}

		this.anim.sequences = structuredClone(json.q) ?? [];
		this.anim.sequenceIndex = +(json.qi ?? -1);

		if (this.anim.states.default) this.anim.resetDefault();
		this.dpf = json.dpf;

		this.anim.isMultiColor = json.mc ?? false;
		this.anim.isMultiLineWidth = json.mw ?? false;

		this.anim.width = json.w;
		this.anim.height = json.h;

		this.renderer.setWidth(json.w);
		this.renderer.setHeight(json.h);

		// need this ???
		this.anim.halfWidth = Math.round(json.w / 2);
		this.anim.halfHeight = Math.round(json.h / 2);

		if (callback) callback(json);
		if (this.anim.onLoad) this.anim.onLoad();
	}

	loadLayerParams(layerParams) {
		const params = {
			drawingIndex: layerParams.d ?? 0,
			startFrame: layerParams.f ? layerParams.f[0] : 0,
			endFrame: layerParams.f ? layerParams.f[1] : 0,
			x: layerParams.x ?? 0,
			y: layerParams.y ?? 0,
			styleIndex: layerParams.s ?? 0,
			groupNumber: layerParams.g ?? -1,
		};
		if (layerParams.t) {
			params.tweens = layerParams.t.map(t => { 
				return { prop: t[0], startFrame: t[1], endFrame: t[2], startValue: t[3], endValue: t[4]}
			});
		}
		if (layerParams.o) params.order = layerParams.o;
		return params;
	}
}