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
		this._state = 'default'; // set state label
		this.states = { 'default': { start: 0, end: 0 } };

		this.layerColor;

		if (this.init) this.init(); // pixel init
	}

	randomCount() {
		this.drawCount = Cool.randomInt(this.drawsPerFrame);
	}

	set fps(value) {
		// if (!value || value <= 0) return;

		const dps = this.fps * this.dpf; // reverse engineer current dps
		this.drawsPerFrame = Math.round(dps / +value);
		this.drawCount = 0;
		// fps is really whatever dps / dpf is 
		const f = dps / this.drawsPerFrame; // "real" fps
		// fix for step up/down
		if (f === this.fps && Math.abs(+value - this.fps) === 1) {
			console.log('if');
			const d = +value - this.fps;
			if (d === 1) {
				for (let n = +value; n < dps; n += d) {
					let dpf = Math.round(dps / n);
					if (dps / dpf > this.fps) {
						this.drawsPerFrame = Math.round(dps / n);
						break;
					}
				}
			}
			if (d === -1) {
				for (let n = +value; n > 0; n += d) {
					let dpf = Math.round(dps / n);
					if (dps / dpf < this.fps) {
						this.drawsPerFrame = Math.round(dps / n);
						break;
					}
				}
			}
		}
		
		this._fps = +(dps / this.drawsPerFrame).toFixed(3); 
	}

	get fps() {
		return this._fps;
	}

	set dpf(value) {
		this.drawsPerFrame = +value;
	}

	get dpf() {
		return this.drawsPerFrame;
	}

	get frame() {
		return this.currentFrame;
	}

	set frame(n) {
		this.currentFrame = +n;
		if (this.states.default) {
			if (this.states.default.end !== this.endFrame)
				this.states.default.end = this.endFrame;
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

	set state(state) {
		if (this._state !== state && this.states[state]) {
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
			if (this.drawCount === this.drawsPerFrame) {
				if (this.currentFrame >= this.state.end) {
					this.currentFrame = this.state.start;
					if (this.onPlayedState) this.onPlayedState();
					if (this.onPlayedOnce) this.onPlayedOnce();
				} else {
					this.currentFrame++;
				}
				this.drawCount = 0;
			} else {
				this.drawCount++;
			}
			if (this.onUpdate) this.onUpdate();
		}
	}

	finish() {
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

	draw(x, y, suspendLinesUpdate) {

		/* 
			get color and other funcs are bc pixel lines uses fill while regular lines uses stroke
			this is overly complicated due to pixel lines
			should consider having pixel lines more separate
			should test 
		*/
		let layerColor = this.getColor();
		this.ctx.beginPath(); // start drawing lines -- wait ...

		const layers = this.getLayers(); // GameAnim uses frames for performance upgrade
		for (let i = 0, len = layers.length; i < len; i++) {
			// draw each layer
			const layer = layers[i]; 
			const drawing = this.drawings[layer.drawingIndex]; // drawing has points + offsets
			const props = layer.drawProps; // color, wiggle, etc

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
			} else if (!suspendLinesUpdate) { 
				// suspend lines update can be set by renderer if fps drops
				if (layer.linesCount >= layer.linesInterval && drawing.needsUpdate) {
					// each layer has its own count for fps update
					// drawing has count for dps update checked against global drawCount
					drawing.update(props);
					layer.linesCount = 0;
				} else if (drawing.needsUpdate) {
					// drawing ready but layer is not
					layer.linesCount++;
				}
			}

			// if changing color finish previous ctx draw and start new
			if (this.multiColor && props.color !== layerColor) {
				this.finish();
				this.setColor(props.color);
				layerColor = props.color;
				this.ctx.beginPath();
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
		

		if (this.states.default) this.states.default.end = this.endFrame;

		this.fps = json.fps;

		if (json.mc) this.multiColor = json.mc;

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