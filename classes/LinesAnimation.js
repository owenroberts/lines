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
		this.props = {
			off: { x: 0, y: 0 },
			speed: { x: 0, y: 0 },
			over: {},
		};

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
		return this.layers.length > 0 ?
			Math.max.apply(Math, this.layers.map(layer => { return layer.f.e; }))
			: 0;
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

		const layers = this.layers.filter(layer => 
			this.currentFrame >= layer.f.s && this.currentFrame <= layer.f.e
		).sort((a, b) => {
			if (a.order) return a.order > b.order ? 1 : -1; // order not always there, ignore 0
			else return 1;
		});

		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			const drawing = this.drawings[layer.d];
			if (this.currentFrame >= layer.f.s && this.currentFrame <= layer.f.e) {

				// set once in layer class ... 
				this.props.s = 0;
				this.props.e = drawing.length;

				// set with layer renderProps ... 
				for (const key in layer) {
					this.props[key] = layer[key];
				}

				// xy come from games -- should be GameAnim only?
				// only works if game can edits props before super
				// should see if x,y is usually a vector
				if (x) this.props.x += x;
				if (y) this.props.y += y;
				
				if (layer.t) { // "tweens" -- empty array
					for (let j = 0; j < layer.t.length; j++) {
						const tween = layer.t[j];
						// range class lol -- wait Range exists???
						if (tween.sf <= this.currentFrame && tween.ef >= this.currentFrame) {
							this.props[tween.prop] = Cool.map(this.currentFrame, tween.sf, tween.ef, tween.sv, tween.ev);
							if (tween.prop == 's' || tween.prop == 'e') 
								this.props[tween.prop] = Math.round(this.props[tween.prop]);
						}
					}
				}

				// over ride animation data from renderer (usually effects)
				for (const key in this.over) {
					this.props[key] = this.over[key];
				}

				// how often to reset wiggle
				if (!suspendLinesUpdate) {
					if (layer.lc >= layer.l) {
						drawing.update(this.props);
						layer.lc = 0;
					} else {
						layer.lc++;
					}
				}

				if (this.multiColor) this.ctx.beginPath();
				for (let j = this.props.s; j < this.props.e - 1; j++) {
					const s = drawing.get(j);
					const e = drawing.get(j + 1);
					if (s !== 'end' && e !== 'end') {
						const off = [...s.off, ...e.off]; // offset stored in drawing points
						
						// catch for drawing - add flag?
						// what is this?
						// only happens on certain drawings but happens A LOT
						// maybe happens when segment num changes ... ?
						// still working on this lol
						if (off.length < this.props.n + 1) {
							console.log('off length')
							for (let k = off.length - 1; k < this.props.n + 1; k++) {
								off.push(new Cool.Vector());
							}
						}
						
						const v = new Cool.Vector(e.x, e.y);
						v.subtract(s);
						v.divide(this.props.n);
						this.ctx.moveTo(
							this.props.x + s.x + off[0].x,
							this.props.y + s.y + off[0].y
						);
						for (let k = 0; k < this.props.n; k++) {
							const p = s.clone().add(v.clone().multiply(k));
							if (!off[k + 1]) console.log('k + 1', k + 1, this.props, off, drawing);
							this.ctx.lineTo( 
								// breaks ? k + 1 : k (old breaky style)
								this.props.x + p.x + v.x + off[k + 1].x,
								this.props.y + p.y + v.y + off[k + 1].y
							);
						}

						if (this.ctx.strokeStyle != this.props.c && this.multiColor)
							this.ctx.strokeStyle = this.props.c;
					}
				}
				
				if (this.multiColor) this.ctx.stroke();
			}
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

		this.layers = json.l;

		// set first random values
		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			if (!layer.l) layer.l = 5; // new layer counter
			if (!layer.lc) layer.lc = 0;
			this.drawings[layer.d].update(layer); 
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