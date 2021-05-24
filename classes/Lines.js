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

	draw(x, y, suspendLinesUpdate) {
		if (!this.multiColor) this.ctx.beginPath();

		for (let i = 0, len = this.layers.length; i < len; i++) {
			if (this.layers[i].isInFrame(this.currentFrame)) {
				const layer = this.layers[i];
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
					if (s !== 'end' && e !== 'end') {
						const off = [...s.off, ...e.off]; // offset stored in drawing points
						
						// catch for drawing - add flag?
						// what is this?
						// only happens on certain drawings but happens A LOT
						// maybe happens when segment num changes ... ?
						// still working on this lol
						// als when in the middle of drawing
						// this would be useful to fix!!!
						if (off.length < props.segmentNum + 1) {
							for (let k = off.length - 1; k < props.segmentNum + 1; k++) {
								off.push(new Cool.Vector());
							}
						}

						if (props.segmentNum === 1) { // i rarely use n=1 tho
							this.simplePixelLine(
								props.x + s.x + off[0].x,
								props.y + s.y + off[0].y,
								props.x + e.x + off[1].x,
								props.y + e.y + off[1].y
							);
						} else {
							const v = new Cool.Vector(e.x, e.y);
							v.subtract(s);
							v.divide(props.segmentNum);
							
							for (let k = 0; k < props.segmentNum; k++) {
								const p0 = s.clone().add(v.clone().multiply(k));
								const p1 = s.clone().add(v.clone().multiply(k + 1));

								const index = props.breaks ? k : k + 1;
								this.simplePixelLine(
									props.x + p0.x + off[k].x,
									props.y + p0.y + off[k].y,
									props.x + p1.x + off[k + 1].x,
									props.y + p1.y + off[k + 1].y,
								);
							}
						}

						if (this.ctx.fillStyle !== props.color && this.multiColor)
							this.ctx.fillStyle = props.color;
					}
				}
				
				if (this.multiColor) this.ctx.fill();
			}
		}
		if (!this.multiColor) this.ctx.fill();
		if (this.onDraw) this.onDraw();
	}

	simplePixelLine(x0, y0, x1, y1) {
		const size = this.ctx.lineWidth;
		x0 = Math.round(x0);
		y0 = Math.round(y0);
		x1 = Math.round(x1);
		y1 = Math.round(y1);
		let dx = Math.abs(x1 - x0);
		let dy = Math.abs(y1 - y0);
		let sx = x0 < x1 ? 1 : -1;
		let sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		while(true) {
			this.ctx.rect(x0, y0, size, size);
			if (x0 === x1 && y0 === y1) break;
			let e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	pixelLine(x1, y1, x2, y2) {
		const size = this.ctx.lineWidth;
		x1 = Math.round(x1);
		x2 = Math.round(x2);
		y1 = Math.round(y1);
		y2 = Math.round(y2);

		const dx = Math.abs(x2 - x1);
		const sx = x1 < x2 ? 1 : -1;
		const dy = Math.abs(y2 - y1);
		const sy = y1 < y2 ? 1 : -1;

		let error, len, rev, count = dx;

		if (dx > dy) {
			error = dx / 2;
			rev = x1 > x2 ? 1 : 0;
			if (dy > 1) {
				error = 0;
				count = dy - 1;
				do {
				  len = error / dy + 2 | 0;
				  this.ctx.rect(x1 - len * rev, y1, len, size);
				  x1 += len * sx;
				  y1 += sy;
				  error -= len * dy - dx;
				} while (count--);
			}
			if (error > 0) this.ctx.rect(x1, y2, x2 - x1, size);
		} else if (dx < dy) {
				error = dy / 2;
				rev = y1 > y2 ? 1 : 0;
				if (dx > 1) {
					error = 0;
					count--;
					do {
						len = error / dx + 2 | 0;
						this.ctx.rect(x1, y1 - len * rev, size, len);
						y1 += len * sy;
						x1 += sx;
						error -= len * dx - dy;
					} while (count--);
				}
				if (error > 0) this.ctx.rect(x2, y1, size, y2 - y1);
		} else {
			do {
				this.ctx.rect(x1, y1, size, size);
				x1 += sx;
				y1 += sy;
			} while (count--);
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