/*
	
	animation contains drawings and layers
	draw per second determined by renderer framerate and target fps
	fps effects frame updates and line rendering
	wiggle is calculated based on the layer offset, default 5 frames
*/

import { assert, randomInt, map } from '../../cool/cool.js';
import { Drawing } from './Drawing.js';
import { Layer } from './Layer.js';
import { Style } from './Style.js';
import { Points, LINES_VERSION } from './Consts.js';
<<<<<<< HEAD:src/Anim.js

/**
 * basic unit of lines animation
 * drawings, layers, styles, states, sequences
 */
export class Anim {
	constructor(renderer) {
		this.ctx = renderer.ctx;
		this.isMultiColor = renderer.isMultiColor;
		this.isMultiLineWidth = renderer.isMultiLineWidth;

		this.isPlaying = false;
		this.isLoaded = false;
		this.isSuspended = false; // suspend updates during performance drag

		this.drawings = [];
		this.layers = [];
		this.styles = [];

		/**
		 * draws per frame
		 * how many time to draw each frame in animation
		 * like fps, but tied to renderer draw time
		 * @type {number}
		 */
		this.dpf = 1; // draws per frame (update, like fps)

		this.currentFrame = 0;
		this.drawCount = 0;
		this.endFrame = 0; // set from loading layers

		this.override = {}; // override properties

		// most animations use default state, game anims/tileSets have states for changing frame
		// replace with manager ?? or is this too complicated???
		// or use js map?
		this.stateName = 'default'; // set state label
		this.states = { 'default': { start: 0, end: 0, dir: 1, loop: true } };
		this.stateData = structuredClone(this.states[this.stateName]);
		
		this.sequences = [];
		this.sequenceIndex = -1; // -1 means ignore the sequencer ... 

		this.layerColor; // wtf is this for?

		if (this.init) this.init(); // pixel init -- put in pixel mixin (or class?)
	}

	get frame() {
		return this.currentFrame;
	}

	set frame(n) {
		this.currentFrame = +n;

		// reset end of default anim to anim end
		// necessary for all lines? maybe just in animate?
		if (this.states.default) {
			if (this.states.default.end !== this.endFrame) {
				this.states.default.end = this.endFrame;
			}
		}
	}	

	get state() {
		return this.stateData;
	}

	set state(stateName) {
		if (this.stateName !== stateName && this.states[stateName]) {
			this.stateName = stateName;
			this.stateData = structuredClone(this.states[this.stateName]);
			// so state dir can overwrite
			if (this.state) { // why? what was error here ... 
				if (this.state.dir === 1) this.currentFrame = this.state.start;
				if (this.state.dir === -1) this.currentFrame = this.state.end;
			}
		}
	}

	resetDefault() {
		this.states.default.end = this.endFrame;
		this.stateData = structuredClone(this.states[this.stateName]);
	}

	setLinesUpdate(n) {
		this.layers.forEach(layer => {
			layer.linesInterval = n;
		});
	}

	overrideProperty(prop, value) {
		this.override[prop] = value;
	}

	cancelOverride() {
		this.override = {};
	}

	nextClip(playedState) {
		// console.log('sqi', this.sequenceIndex);
		const seq = this.sequences[this.sequenceIndex];
		let clip = seq.clips[seq.clipIndex];

		if (playedState) {
			clip.count++;
			if (clip.count >= clip.repeat) {
				clip.count = 0;
				seq.clipIndex++;
				if (seq.clipIndex >= seq.clips.length) {
					seq.clipIndex = 0;
				}
				clip = seq.clips[seq.clipIndex];
			}
		}

		if (this.stateName !== clip.state) {
			this.state = clip.state;
		}
		if (this.state.dir !== clip.dir) {
			this.state.dir = clip.dir;
			if (this.state.dir === 1) this.currentFrame = this.state.start;
			if (this.state.dir === -1) this.currentFrame = this.state.end;
		}
	}

	update() {
		if (this.isPlaying) {
			if (this.drawCount >= this.dpf - 1) { 
				// >= instead of === in case dpf changed

				if (this.sequenceIndex >= 0) {
					this.nextClip(false);
				}

				let playedState = false;
				if (this.state.dir === 1) {
					if (this.currentFrame >= this.state.end) {
						this.currentFrame = this.state.start;
						playedState = true;
					} else {
						this.currentFrame++;
					}
				} else {
					if (this.currentFrame <= this.state.start) {
						this.currentFrame = this.state.end;
						playedState = true;
					} else {
						this.currentFrame--;
					}
				}

				if (playedState) {
					if (this.onPlayedState) this.onPlayedState();
					if (this.onPlayedOnce) this.onPlayedOnce(); // should this delete itself?

					if (this.sequenceIndex >= 0) {
						this.nextClip(true);
					}
				}

				this.drawCount = 0;
			} else {
				this.drawCount++;
			}
			if (this.onUpdate) this.onUpdate();
		}
	}

	finish(props) {
		this.ctx.stroke();
	}

	setColor(color) {
		if (this.ctx.strokeStyle !== color) this.ctx.strokeStyle = color;
	}

	getColor() {
		return this.ctx.strokeStyle; 
	}

	getLayers() {
		let layers = [];
		for (let i = 0, len = this.layers.length; i < len; i++) {
			if (this.layers[i].isInFrame(this.currentFrame)) {
				layers.push(this.layers[i]);
			}
		}
		return layers;
	}

	getCurrentProps() {
		return {
			color: this.ctx.strokeStyle,
			lineWidth: this.ctx.lineWidth,
		};
	}

	draw(x, y) {

		/* 
			get color and other funcs are bc pixel lines uses fill while regular lines uses stroke
			this is overly complicated due to pixel lines
			should consider having pixel lines more separate
			should test 
		*/
		
		let currentProps = this.getCurrentProps();
		this.ctx.beginPath(); // start drawing lines -- wait ...

		const layers = this.getLayers(); // GameAnim uses frames for performance upgrade
		for (let i = 0, len = layers.length; i < len; i++) {
			if (!layers[i].isVisible) continue;
			// draw each layer
			const layer = layers[i]; 
			const drawing = this.drawings[layer.drawingIndex]; // drawing has points + offsets
			const props = layer.getProps();
			const style = this.styles[layer.styleIndex];
			// console.log('style', style);

			for (const k in style) {
				props[k] = style[k];
			}

			//  maybe only needed in GameAnim ?? 
			if (Number.isFinite(x)) props.x += x;
			if (Number.isFinite(y)) props.y += y;
			
			if (props.tweens.length) { // default empty array -- .length didn't hurt
				for (let j = 0; j < props.tweens.length; j++) {
					const tween = props.tweens[j];
					if (tween.startFrame <= this.currentFrame && 
						tween.endFrame >= this.currentFrame) {
						props[tween.prop] = map(this.currentFrame, tween.startFrame, tween.endFrame, tween.startValue, tween.endValue);

						// fix for floating point array index errors -- move to actual prop calcs?
						if (tween.prop === 'startIndex' || tween.prop === 'endIndex' || tween.prop === 'segmentNum') {
							props[tween.prop] = Math.round(props[tween.prop]);
						}
					}
				}
			}

			// over ride animation data from renderer (usually effects)
			for (const key in this.override) {
				props[key] = this.override[key];
			}

			// how often to reset wiggle
			if (drawing.firstUpdate) { // lazy load -- way to get rid of this check?
				drawing.firstUpdate = false;
				drawing.update(props);
			} else if (!this.isSuspended) { 
				// suspend lines update can be set by renderer if fps drops
				if (layer.linesCount >= props.linesInterval && drawing.needsUpdate) {
					// each layer has its own count for fps update
					// drawing has count for dps update checked against global drawCount
					drawing.update(props);
					layer.linesCount = 0;
				} else if (drawing.needsUpdate) {
					// drawing ready but layer is not
					layer.linesCount++;
				}
			}

			// if props change, stroke previous layers and change to new ...
			if (this.isMultiColor || this.isMultiLineWidth) {
				
				if (props.color !== currentProps.color || props.lineWidth !== currentProps.lineWidth) {
					this.finish();

					if (props.color !== currentProps.color) {
						this.setColor(props.color);
						currentProps.color = props.color;
					}

					if (props.lineWidth !== currentProps.lineWidth) {
						if (this.ctx.lineWidth !== props.lineWidth) {
							this.ctx.lineWidth = props.lineWidth;
						}
						currentProps.lineWidth = props.lineWidth;
					}

					this.ctx.beginPath();
				}
			}
			
			// layers save the end index except in lines/animate
			// also works with tweens that set endIndex to 0
			let endIndex = props.endIndex < 0 ? drawing.length - 1 : props.endIndex - 1;

			// loop over points
			for (let j = props.startIndex; j < endIndex; j++) {
				const s = drawing.get(j); // returns [point, offset]
				if (s[0] === Points.END || s[0] === Points.ADD) continue; // end of line or connected line
				let e = drawing.get(j + 1); // get next [point, offset]
				if (e[0] === Points.END) continue;
				if (e[0] === Points.ADD) {
					// connect end of first point
					// go backwards to find start point of this segment
					// start assuming its very begining
					e = drawing.get(0);
					for (let k = j; k > 0; k--) {
						let ep = drawing.get(k)[0];
						if (ep === Points.END || ep === Points.ADD) {
							e = drawing.get(k + 1);
							break;
						}
					}
				}

				this.drawLines(s, e, props); // draws lines between points
			}
		}
		this.finish();
		if (this.onDraw) this.onDraw();
	}

	drawLines(s, e, props) {

		// move ctx to start point + start offset
		// s,e = [point, offset] = [[x, y], [offset1, offset2]] = [[x,y], [[x,y], [x,y]]]

		// prevent draw errors -- get rid of this somehow ... 
		if (typeof s[0] === 'undefined') return;
		if (typeof e[0] === 'undefined') return;

		this.ctx.moveTo(
			props.x + s[0][0] + s[1][0][0],
			props.y + s[0][1] + s[1][0][1]
		);

		// if its just one line draw to end
		if (props.segmentNum === 1) { // i rarely use n=1 tho
			this.ctx.lineTo( 
				props.x + e[0][0] + e[1][0][0],
				props.y + e[0][1] + e[1][0][1]
			);
			return;
		}

		// get direction between s and e to divide into vector and distance
		const v = [
			(e[0][0] - s[0][0]) / props.segmentNum,
			(e[0][1] - s[0][1]) / props.segmentNum,
		];	
		
		// segment end points
		for (let k = 1; k < props.segmentNum; k++) {
			// line to start + vector * k 
			const p = [
				s[0][0] + v[0] * k,
				s[0][1] + v[1] * k
			];

			// add offset to segment points
			let o = [0, 0]; // 0, 0 to prevent missing offset errors
			if (k === props.segmentNum - 1 && !props.breaks) {
				o = e[1][0];
			} else if (s[1][k]) {
				o = s[1][k];
				if (!o) console.log('else k', k, o, s, e); // leave debug here
			}
			
			// finish line
			this.ctx.lineTo( 
				props.x + p[0] + v[0] + o[0],
				props.y + p[1] + v[1] + o[1]
			);
		}
	}

	load(src, callback) {
		if (typeof src === 'object') loadJSON(src, callback);
		else {
			fetch(src)
				.then(response => { return response.json() })
				.then(data => { this.loadData(data, callback); })
				.catch(error => { console.error(error) });
		}
	}

	loadJSON(json, callback) {
		this.loadData(json, callback);
	}

	loadData(json, callback) {

		assert(json.v === LINES_VERSION, `json data v${json.v} is not correct version, lines version = ${LINES_VERSION}`);

		this.isLoaded = true;
		for (let i = 0; i < json.d.length; i++) {
			this.drawings[i] = json.d[i] ? 
				new Drawing(json.d[i]) : 
				null;
		}

		// random starting interval count
		const randomCount = Math.round(Math.random() * 5);

		// layers
		for (let i = 0; i < json.l.length; i++) {
			const params = this.loadLayerParams(json.l[i]);
			params.drawingEndIndex = this.drawings[params.drawingIndex].length;
			params.linesCount = randomCount;
			
			const layer = new Layer(params);
			this.layers[i] = layer;

			// maybe load when not debuggin -- add loading progress
			// this.drawings[layer.drawingIndex].update(layer); // -- this takes forever for load ...
		}
		console.log(this.layers);

		const endFrame = this.layers.map(layer => { return layer.endFrame; });
		this.endFrame = Math.max.apply(Math, endFrame);

		// styles
		// this.styles = structuredClone(json.st);
		for (let i = 0; i < json.st.length; i++) {
			const params = structuredClone(json.st[i]);
			this.styles[i] = new Style(params);
		}

		// states
		for (const key in json.s) {
			this.states[key] = {
				start: json.s[key][0],
				end: json.s[key][1],
				dir: json.s[key][2] ?? 1,
				loop: json.s[key][3] ?? true,
			};
		}

		this.sequences = structuredClone(json.q) ?? [];
		this.sequenceIndex = +(json.qi ?? -1);

		if (this.states.default) this.resetDefault();

		this.dpf = json.dpf;

		if (json.mc) this.isMultiColor = json.mc;
		if (json.mw) this.isMultiLineWidth = json.mw;

		this.width = json.w;
		this.height = json.h;

		this.halfWidth = Math.round(json.w / 2);
		this.halfHeight = Math.round(json.h / 2);

		if (callback) callback(json);
		if (this.onLoad) this.onLoad();
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

	setOnLoad(callback) {
		if (this.isLoaded) callback();
		else this.onLoad = callback;
	}

	play() {
		this.isPlaying = true;
	}

	stop() {
		this.isPlaying = false;
	}
}