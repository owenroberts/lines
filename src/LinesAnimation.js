/*
	basic unit of lines animation
	animation contains drawings and layers
	draw per second determined by renderer framerate and target fps
	fps effects frame updates and line rendering
	wiggle is calculated based on the layer offset, default 5 frames
*/

import * as Cool from '../../cool/cool.js';
import { Drawing } from './Drawing.js';
import { Layer } from './Layer.js';

export class LinesAnimation {
	constructor(ctx, dps, multiColor, multiWidth) {
		this.ctx = ctx;
		this.isLoaded = false;
		this.isPlaying = false;
		this.multiColor = multiColor || false;
		this.multiWidth = multiWidth || false;

		this.drawings = [];
		this.layers = [];
		this.styles = [];
		
		/*
			dps is the renderer speed
			dpf is how many draws per frame, must be int
			fps is not really relevant but easier to understand
			default dps is usuall 30 so 10 is good
			with 24 use 12
		*/

		if (!dps) dps = 30; // draw per frame from renderer
		this._fps = dps === 30 ? 10 : 12;
		this.drawsPerFrame = Math.round(dps / this._fps);
		this.currentFrame = 0;
		this.drawCount = 0;

		this.override = {};

		// most animations use default state, game anims/textures have states for changing frame
		// replace with manager ?? or is this too complicated???
		this.stateName = 'default'; // set state label
		this.states = { 'default': { start: 0, end: 0, dir: 1 } };
		this.stateData = structuredClone(this.states[this.stateName]);
		this.sequences = [];
		this.sequenceIndex = -1;

		this.layerColor;
		this.suspendUpdate = false;

		if (this.init) this.init(); // pixel init
	}

	randomCount() {
		this.drawCount = Cool.randomInt(this.drawsPerFrame);
	}

	set fps(value) {
		const dps = this.fps * this.dpf; // reverse engineer current dps
		let dpf = dps / +value;
		
		// if dpf isn't int, is it +1 -1 or just a new fps
		if (dpf % 1 > 0) {
			if (Math.abs(+value - this._fps) === 1) {
				dpf = this.dpf + Math.sign(this.fps - +value);
			} else {
				dpf = Math.round(dpf);
			}
		}
		
		this.drawsPerFrame = dpf;
		this._fps = +(dps / this.dpf).toFixed(3);
		this.drawCount = 0;
	}

	get fps() {
		return this._fps;
	}

	set dpf(value) {
		const dps = this.fps * this.dpf;
		this.drawsPerFrame = +value;
		this._fps = dps / this.drawsPerFrame;
		// this.drawCount = 0;
	}

	get dpf() {
		return this.drawsPerFrame;
	}

	get frame() {
		return this.currentFrame;
	}

	set frame(n) {
		this.currentFrame = +n;

		// reset end of default anim to anim end
		if (this.states.default) {
			if (this.states.default.end !== this.endFrame) {
				this.states.default.end = this.endFrame;
			}
		}
	}

	get endFrame() {
		const endFrame = this.layers.map(layer => { return layer.endFrame; });
		// when is layers.length 0 ??
		// return this.layers.length > 0 ? Math.max.apply(Math, endFrame) : 0;
		return Math.max.apply(Math, endFrame);
	}

	set endFrame(n) {
		this.layers.forEach(layer => { layer.endFrame = n; });
	}

	get state() {
		return this.stateData;
	}

	set state(stateName) {
		if (this.stateName !== stateName && this.states[stateName]) {
			this.stateName = stateName;
			this.stateData = structuredClone(this.states[this.stateName]); // so state dir can overwrite
			if (this.state) {
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
			// console.log(this.currentFrame, this.drawCount, this.drawsPerFrame);
			if (this.drawCount >= this.drawsPerFrame - 1) { // >== instead of === in case dpf changed
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

	draw(x, y, suspendLinesUpdate) {

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

			// console.log('props', props);

			//  maybe only needed in GameAnim ?? 
			if (x) props.x += x;
			if (y) props.y += y;
			
			if (props.tweens.length) { // default empty array -- .length didn't hurt
				for (let j = 0; j < props.tweens.length; j++) {
					const tween = props.tweens[j];
					if (tween.startFrame <= this.currentFrame && 
						tween.endFrame >= this.currentFrame) {
						props[tween.prop] = Cool.map(this.currentFrame, tween.startFrame, tween.endFrame, tween.startValue, tween.endValue);

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
			} else if (!suspendLinesUpdate && !this.suspendUpdate) { 
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
			// console.log(this.multiWidth);
			if (this.multiColor || this.multiWidth) {
				
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
				if (s[0] === 'end' || s[0] === 'add') continue; // end of line or connected line
				let e = drawing.get(j + 1); // get next [point, offset]
				if (e[0] === 'end') continue;
				if (e[0] === 'add') {
					// connect end of first point
					// go backwards to find start point of this segment
					// start assuming its very begining
					e = drawing.get(0);
					for (let k = j; k > 0; k--) {
						let ep = drawing.get(k)[0];
						if (ep === 'end' || ep === 'add') {
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
			const params = this.loadParams(json.l[i]);
			params.drawingEndIndex = this.drawings[params.drawingIndex].length;
			params.linesCount = randomCount;
			
			const layer = new Layer(params);
			this.layers[i] = layer;

			// maybe load when not debuggin -- add loading progress
			// this.drawings[layer.drawingIndex].update(layer); // -- this takes forever for load ...
		}

		// styles



		// states
		for (const key in json.s) {
			this.states[key] = {
				start: json.s[key][0],
				end: json.s[key][1],
				dir: json.s[key][2] ?? 1,
			};
		}

		this.sequences = structuredClone(json.q) ?? [];
		this.sequenceIndex = +(json.qi ?? -1);

		if (this.states.default) this.resetDefault();

		this.fps = json.fps;

		if (json.mc) this.multiColor = json.mc;
		if (json.mw) this.multiWidth = json.mw;

		this.width = json.w;
		this.height = json.h;

		this.halfWidth = Math.round(json.w / 2);
		this.halfHeight = Math.round(json.h / 2);

		if (callback) callback(json);
		if (this.onLoad) this.onLoad();
	}

	loadParams(json) {
		const params = {
			drawingIndex: json.d,
			startFrame: json.f[0],
			endFrame: json.f[1],
			x: json.x || 0,
			y: json.y || 0,
			color: json.c,
			lineWidth: json.lw || 1,
			segmentNum: json.n,
			jiggleRange: json.r,
			wiggleRange: json.w,
			wiggleSpeed: json.v,
			wiggleSegments: json.ws,
			breaks: json.b || false,
			linesInterval: json.l || 5,
			groupNumber: json.g,
		};
		if (json.t) {
			params.tweens = json.t.map(t => { 
				return { prop: t[0], startFrame: t[1], endFrame: t[2], startValue: t[3], endValue: t[4]}
			});
		}
		if (json.o) params.order = json.o;
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