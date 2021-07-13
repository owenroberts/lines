/*
	basic unit of lines animation
	animation contains drawings and layers
	draw per second determined by renderer framerate and target fps
	fps effects frame updates and line rendering
	wiggle is calculated based on the layer offset, default 5 frames
*/

class Lines {
	constructor(ctx, dps, multiColor) {
		this.ctx = ctx;
		this.isLoaded = false;
		this.isPlaying = false;
		this.multiColor = multiColor || false;

		this.drawings = [];
		this.layers = [];
		
		this.dps = dps || 30; // draw per frame from renderer
		this.fps = 5; // update frames

		this.currentFrame = 0;
		this.drawsPerFrame = Math.round(this.dps / this.fps);
		this.drawCount = 0;

		this.override = {};

		// most animations use default state, game anims/textures have states for changing frame
		this._state = 'default'; // set state label
		this.states = { 'default': {start: 0, end: 0 } };
	}

	randomCount() {
		this.drawCount = Cool.randomInt(this.drawsPerFrame);
	}

	set fps(fps) {
		this._fps = +fps;
		this.drawsPerFrame = Math.round(this.dps / this.fps);
		this.drawCount = 0;
	}

	get fps() {
		return this._fps;
	}

	set frame(n) {
		this.currentFrame = +n;
		if (this.states.default) {
			if (this.states.default.end != this.endFrame)
				this.states.default.end = this.endFrame;
		}
	}

	get endFrame() {
		const endFrame = this.layers.map(layer => { return layer.endFrame; });
		// when is layers.length 0 ??
		// return this.layers.length > 0 ? Math.max.apply(Math, endFrame) : 0;
		return Math.max.apply(Math, endFrame);
	}

	set state(state) {
		if (this._state != state && this.states[state]) {
			this._state = state;
			if (this.state) this.frame = this.state.start;
		}
	}

	get state() {
		return this.states[this._state];
	}

	get stateName() {
		return this._state;
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

	update() {
		if (this.isPlaying) {
			if (this.drawCount == this.drawsPerFrame) {
				if (this.currentFrame >= this.state.end) {
					this.currentFrame = this.state.start;
					if (this.onPlayedState) this.onPlayedState();
					if (this.onPlayedOnce) {
						this.onPlayedOnce();
					}
				} else {
					this.currentFrame++;
				}
				this.drawCount = 0;
			}
			this.drawCount++;

			if (this.onUpdate) this.onUpdate();
		}
	}

	finish() {
		this.ctx.stroke();
	}

	setColor(color) {
		if (this.ctx.strokeStyle !== color) this.ctx.strokeStyle = color;
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

	draw(x, y, suspendLinesUpdate) {
		if (!this.multiColor) this.ctx.beginPath();
		const layers = this.getLayers();
		for (let i = 0, len = layers.length; i < len; i++) {
			const layer = layers[i];
			const drawing = this.drawings[layer.drawingIndex];
			const props = layer.drawProps;

			if (x) props.x += x;
			if (y) props.y += y;
			
			if (props.tweens.length) { // default empty array -- .length didn't hurt
				for (let j = 0; j < props.tweens.length; j++) {
					const tween = props.tweens[j];
					// console.log(tween);
					// range class lol -- wait Range exists???
					if (tween.startFrame <= this.currentFrame && 
						tween.endFrame >= this.currentFrame) {
						props[tween.prop] = Cool.map(this.currentFrame, tween.startFrame, tween.endFrame, tween.startValue, tween.endValue);
						if (tween.prop == 'startIndex' || tween.prop == 'endIndex') {
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
			} else if (!suspendLinesUpdate) {
				if (layer.linesCount >= layer.linesInterval && drawing.needsUpdate) {
					drawing.update(props);
					layer.linesCount = 0;
				} else if (drawing.needsUpdate) {
					layer.linesCount++;
				}
			}

			if (this.multiColor) this.ctx.beginPath();
			let { endIndex, startIndex } = props;
			if (endIndex < 0) endIndex = drawing.length;
			// text animation
			// if (this.endIndexMultiplier !== undefined) {
			// 	endIndex *= this.endIndexMultiplier; 
			// }
			// if (this.startIndexMultiplier !== undefined) {
			// 	startIndex = Math.floor(this.startIndexMultiplier * drawing.length);
			// }

			for (let j = startIndex; j < endIndex - 1; j++) {
				const s = drawing.get(j);
				const e = drawing.get(j + 1);
				if (s[0] !== 'end' && e[0] !== 'end') {
					const off = [];
					for (let i = 0; i < s[1].length; i++) {
						off.push(s[1][i]);
					}
					if (e[1]) off.push(e[1][0])
					
					// fuckin fuck fix... happens  when drawing ??
					if (off.length < props.segmentNum + 1) {
						for (let k = off.length - 1; k < props.segmentNum + 1; k++) {
							off.push([0,0]);
						}
					}

					this.drawLines(s[0], e[0], props, off);
					if (this.multiColor) this.setColor(props.color);
				}
			}
			
			if (this.multiColor) this.finish();
		}
		if (!this.multiColor) this.finish();
		if (this.onDraw) this.onDraw();
	}

	drawLines(s, e, props, off) {
		this.ctx.moveTo(
			props.x + s[0] + off[0][0],
			props.y + s[1] + off[0][1]
		);

		if (props.segmentNum == 1) { // i rarely use n=1 tho
			this.ctx.lineTo( 
				props.x + e[0] + off[1][0],
				props.y + e[1] + off[1][1]
			);
		} else {
			const v = [
				(e[0] - s[0]) / props.segmentNum,
				(e[1] - s[1]) / props.segmentNum,
			];
			
			// need to spend a little time here ...
			
			for (let k = 1; k < props.segmentNum; k++) {
				const p = [
					s[0] + v[0] * k,
					s[1] + v[1] * k
				];
				if (!off[k + 1]) console.log('k + 1', k + 1, props, off, drawing);
				const index = props.breaks ? k : k + 1;
				this.ctx.lineTo( 
					props.x + p[0] + v[0] + off[index][0],
					props.y + p[1] + v[1] + off[index][1]
				);
			}
		}
	}

	load(src, callback) {
		fetch(src)
			.then(response => { return response.json() })
			.then(data => { this.loadData(data, callback); })
			.catch(error => { console.error(error) });
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

		const randomCount = Math.round(Math.random() * 5);
		for (let i = 0; i < json.l.length; i++) {
			const params = this.loadParams(json.l[i]);
			params.drawingEndIndex = this.drawings[params.drawingIndex].length;
			params.linesCount = randomCount;
			
			const layer = new Layer(params);
			this.layers[i] = layer;

			// maybe load when not debuggin -- add loading progress
			// this.drawings[layer.drawingIndex].update(layer); // -- this takes forever for load ...
		}

		for (const key in json.s) {
			this.states[key] = {
				start: json.s[key][0],
				end: json.s[key][1],
			};
		}

		if (this.states.default)
			this.states.default.end = this.endFrame;

		this.fps = json.fps;

		if (json.mc) this.multiColor = json.mc;

		this.width = json.w;
		this.height = json.h;

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
			segmentNum: json.n,
			jiggleRange: json.r,
			wiggleRange: json.w,
			wiggleSpeed: json.v,
			wiggleSegments: json.ws,
			breaks: json.b || false,
			linesInterval: json.l || 5,
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
}