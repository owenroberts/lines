/*
	basic unit of lines animation
	animation contains drawings and layers
	draw per second determined by renderer framerate and target fps
	fps effects frame updates and line rendering
	wiggle is calculated based on the layer offset, default 5 frames
*/

class LinesAnimation {
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
		
		// props are layer specific right?? -- part of layer class?
		// this.props = {
		// 	override: {},
		// };
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
		this.props.override[prop] = value;
	}

	cancelOverride() {
		this.props.override = {};
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

		const layers = this.layers.filter(layer => layer.isInFrame(this.currentFrame))
		.sort((a, b) => {
			if (a.order) return a.order > b.order ? 1 : -1; // order not always there, ignore 0
			else return 1;
		});

		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const drawing = this.drawings[layer.drawingIndex];
			const props = layer.drawProps;

			// better to get this interactively if Animate app
			// this.props.e = layer.drawingEndIndex > 0 ? layer.drawingEndIndex : drawing.length;
			props.endIndex = drawing.length;

			if (x) props.x += x;
			if (y) props.y += y;
			
			if (props.tweens) { // default empty array
				for (let j = 0; j < props.tweens.length; j++) {
					const tween = props.tweens[j];
					// range class lol -- wait Range exists???
					if (tween.sf <= this.currentFrame && tween.ef >= this.currentFrame) {
						this.props[tween.prop] = Cool.map(this.currentFrame, tween.sf, tween.ef, tween.sv, tween.ev);
						if (tween.prop == 's' || tween.prop == 'e') 
							this.props[tween.prop] = Math.round(this.props[tween.prop]);
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
				if (updateDrawing) drawing.update(props);
			}

			if (this.multiColor) this.ctx.beginPath();
			for (let j = props.startIndex; j < props.endIndex - 1; j++) {
				const s = drawing.get(j);
				const e = drawing.get(j + 1);
				if (s !== 'end' && e !== 'end') {
					const off = [...s.off, ...e.off]; // offset stored in drawing points
					
					// catch for drawing - add flag?
					// what is this?
					// only happens on certain drawings but happens A LOT
					// maybe happens when segment num changes ... ?
					// still working on this lol
					// als when in the middle of drawing
					if (off.length < props.segmentNum + 1) {
						for (let k = off.length - 1; k < props.segmentNum + 1; k++) {
							off.push(new Cool.Vector());
						}
					}

					const v = new Cool.Vector(e.x, e.y);
					v.subtract(s);
					v.divide(props.segmentNum);
					this.ctx.moveTo(
						props.x + s.x + off[0].x,
						props.y + s.y + off[0].y
					);
					for (let k = 0; k < props.segmentNum; k++) {
						const p = s.clone().add(v.clone().multiply(k));
						if (!off[k + 1]) console.log('k + 1', k + 1, props, off, drawing);
						const index = props.breaks ? k : k + 1;
						this.ctx.lineTo( 
							props.x + p.x + v.x + off[index].x,
							props.y + p.y + v.y + off[index].y
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
		this.loaded = true;
		for (let i = 0; i < json.d.length; i++) {
			this.drawings[i] = json.d[i] ? 
				new Drawing(json.d[i]) : 
				null;
		}

		// this.layers = json.l;
		for (let i = 0; i < json.l.length; i++) {
			// console.log(this.drawings[json.l[i].d].length)
			this.layers[i] = new Layer(json.l[i], this.drawings[json.l[i].d].length);
		}

		// set first random values
		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			this.drawings[layer.drawingIndex].update(layer);
			// console.log(this.drawings[layer.drawingIndex].length)
			// layer.drawingEndIndex = this.drawings[layer.drawingIndex].length;
			// console.log(layer.drawingEndIndex);
		}

		for (const key in json.s) {
			this.states[key] = json.s[key];
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

	setOnLoad(callback) {
		if (this.isLoaded) callback();
		else this.onLoad = callback;
	}
}