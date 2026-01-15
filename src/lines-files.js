import { assert, randomInt } from '../../cool/cool.js';
import { Drawing, Layer, Style, LINES_VERSION } from './lines.js';

// ** update example with this

/**
 * load and save files for lines
 */
export class LinesFiles {
	
	constructor(anim, renderer) {
		this.anim = anim;
		this.renderer = renderer;
	}

	saveData(title, groups, isSingleFrame) {

		const json = {
			title: title ?? prompt("name file"),
			version: LINES_VERSION,
			width: this.renderer.width,
			height: this.renderer.height,
			dpf: this.anim.dpf,
			isMultiColor: [...new Set(this.anim.layers.map(layer => layer.color))].length > 1, // filter
			isMultiLineWidth: [...new Set(this.anim.layers.map(layer => layer.lineWidth))].length > 1,
			bgColor: this.renderer.bgColor,
			drawings: structuredClone(this.anim.drawings.map(d => d.points)),
		};

		if (json.drawings.length === 0) {
			console.log('File not saved, no drawings to save.');
			return;
		}

		json.layers = isSingleFrame ? 
			this.anim.layers
				.filter(l => l.isInFrame(this.anim.currentFrame))
				.map(l => { return { ...l.getSaveProps(), f: [0, 0] }}) :
			this.anim.layers.map(l => l.getSaveProps());

		// need to prune drawings after
		// 
		if (json.layers.length === 0) return;

		// this is part of layers already right? just need to load ... 
		// const groups = this.timeline.groups();
		// *** redo groups
		if (groups.length > 0) json.groups = [...groups];

		const states = Object.keys(this.anim.states)
			.filter(s => s !== 'default');

		if (states.length > 0) {
			json.states = {};
			states.forEach(state => {
				json.states[state] = [
					this.anim.states[state].start, 
					this.anim.states[state].end,
					this.anim.states[state].dir ?? 1,
					this.anim.states[state].loop ?? true,
				];
			});
		}

		// styles
		json.styles = structuredClone(this.anim.styles);

		json.sequences = structuredClone(this.anim.sequences ?? []);
		json.sequenceIndex = +(this.anim.sequenceIndex ?? -1);
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

		assert(json.version === LINES_VERSION, `json data v${json.v} is not correct version, lines version = ${LINES_VERSION}`);

		for (let i = 0; i < json.drawings.length; i++) {
			this.anim.drawings[i] = new Drawing(json.drawings[i]);
		}

		for (let i = 0; i < json.layers.length; i++) {
			const params = this.loadLayerParams(json.layers[i]);
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
		for (const key in json.states) {
			this.anim.states[key] = {
				start: json.states[key][0],
				end: json.states[key][1],
				dir: json.states[key][2] ?? 1,
				loop: json.states[key][3] ?? true,
			};
		}

		for (let i = 0; i < json.styles.length; i++) {
			this.anim.styles[i] = new Style(json.styles[i]);
		}

		this.anim.sequences = json.sequences ?? [];
		this.anim.sequenceIndex = +(json.sequenceIndex ?? -1);

		if (this.anim.states.default) this.anim.resetDefault();
		this.dpf = json.dpf;

		this.anim.isMultiColor = json.isMultiColor ?? false;
		this.anim.isMultiLineWidth = json.isMultiLineWidth ?? false;

		this.anim.width = json.width;
		this.anim.height = json.height;

		this.renderer.setWidth(json.width);
		this.renderer.setHeight(json.height);

		// need this ???
		this.anim.halfWidth = Math.round(json.width / 2);
		this.anim.halfHeight = Math.round(json.height / 2);

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