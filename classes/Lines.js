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
		this.multiColor = multiColor || true;

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
				} else {
					this.currentFrame++;
				}
				this.drawCount = 0;
			}
			this.drawCount++;

			if (this.onUpdate) this.onUpdate();
		}
	}

	draw(x, y, suspendLinesUpdate) {
		if (!this.multiColor) this.ctx.beginPath();

		const layers = [];
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i].isInFrame(this.currentFrame)) {
				layers.push(this.layers[i]);
			}
		}


		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const drawing = this.drawings[layer.drawingIndex];
			const props = layer.drawProps;

			if (x) props.x += x;
			if (y) props.y += y;
			
			if (props.tweens) { // default empty array
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
			if (!suspendLinesUpdate) {
				const updateDrawing = layer.update();
				if (updateDrawing) {
					drawing.seed.x = Math.random();
					drawing.seed.y = Math.random();
					drawing.seed.z = Math.random();
					// console.log(this.seed); // do need to loop somewhere ...
				}
			}

			if (this.multiColor) this.ctx.beginPath();
			const endIndex = props.endIndex >= 0 ? props.endIndex : drawing.length;

			const wiggle = new Cool.Vector();
			const speed = new Cool.Vector(props.wiggleSpeed, props.wiggleSpeed);

			for (let j = props.startIndex; j < endIndex - 1; j++) {
				const s = drawing.get(j);
				const e = drawing.get(j + 1);
				if (s !== 'end' && e !== 'end') {
					
					noise.seed(drawing.seed.x);
					let xf = noise.perlin2(s.x, s.y) * props.jiggleRange * 2;
					noise.seed(drawing.seed.y);
					let yf = noise.perlin2(s.x, s.y) * props.jiggleRange * 2;

					// noise.seed(drawing.seed.z);
					const w = noise.perlin2(wiggle.x/100, wiggle.y/100) * props.wiggleRange;
					wiggle.add(speed);
					// console.log(w, props.wiggleRange, wiggle.x, wiggle.y);
					// if (j == 0) console.log(w, this.seed.y, wiggle.x, wiggle.y, props.wiggleRange);


					const v = new Cool.Vector(e.x, e.y);
					v.subtract(s);
					v.divide(props.segmentNum);
					this.ctx.moveTo(
						props.x + s.x + xf + w,
						props.y + s.y + yf + w,
					);

					for (let k = 0; k < props.segmentNum; k++) {
						const p = s.clone().add(v.clone().multiply(k));
						
						noise.seed(drawing.seed.x);
						let xf = noise.perlin2(p.x + v.x, p.y + v.y) * props.jiggleRange * 2;
						noise.seed(drawing.seed.y);
						let yf = noise.perlin2(p.x + v.x, p.y + v.y) * props.jiggleRange * 2;
						
						this.ctx.lineTo( 
							props.x + p.x + v.x + xf + w,
							props.y + p.y + v.y + yf + w,
						);
					}

					if (this.ctx.strokeStyle != props.color && this.multiColor)
						this.ctx.strokeStyle = props.color;
				}
			}
			
			if (this.multiColor) this.ctx.stroke();
		}
		if (!this.multiColor) this.ctx.stroke();
		if (this.onDraw) this.onDraw();
	}

	getNoise(seed, x, y, jig, wig, wiggle) {
		noise.seed(seed);
		let n = noise.perlin2(x, y) * jig;
		// noise.seed(seed.y);
		// let w = noise.perlin2(wiggle.x, wiggle.y) * wig;
		// n *= jig;
		// w *= wig;
		return n;
	}

	load(src, callback) {
		fetch(src)
			.then(response => { return response.json() })
			.then(data => { this.loadData(data, callback); })
			.catch(error => { console.error(error) });
	}

	loadJSON(json, callback) {
		this.loadData(json, callback);
		this.loadData(json, callback);
	}

	loadData(json, callback) {
		this.loaded = true;
		for (let i = 0; i < json.d.length; i++) {
			this.drawings[i] = json.d[i] ? 
				new Drawing(json.d[i]) : 
				null;
		}

		for (let i = 0; i < json.l.length; i++) {
			const params = this.loadParams(json.l[i]);
			params.drawingEndIndex = this.drawings[params.drawingIndex].length;
			
			const layer = new Layer(params);
			this.layers[i] = layer;

			this.drawings[layer.drawingIndex].update(layer);
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