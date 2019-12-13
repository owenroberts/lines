function Draw(defaults) {
	const self = this;

	Object.defineProperty(this, 'layer', {
		get: function() {
			return lns.anim.layers[lns.anim.layers.length -1];
		}
	});

	Object.defineProperty(this, 'drawing', {
		get: function() {
			return lns.anim.drawings[lns.anim.drawings.length - 1];
		}
	});

	lns.anim.drawings.push([]);
	lns.anim.layers.push(new Layer({ 
		...defaults, 
		d: Math.max(lns.anim.drawings.length - 1, 0),  
		f: { s: lns.anim.currentFrame, e: lns.anim.currentFrame }
	}));

	this.setProperties = function(props) {
		for (const prop in props) {
			if (self.layer[prop] !== undefined) {
				// self.layer[prop] = props[prop];
				if (lns.ui) lns.ui.faces[prop].update(props[prop]); 
				/* how to do this with ui, setter */
			}
		}
	};

	this.setProp = function(value, args) {
		lns.ui.layers.updateProperty(args.prop, value);
		self.layer[args.prop] = value;
	};

	// this.setProperties(defaults);

	this.setDefaults = function() {
		self.setProperties(defaults);
	};

	this.reset = function(f) {
		console.log('reset', f);
		lns.anim.drawings.push([]);
		lns.anim.layers.push(new Layer({ 
			...defaults, 
			d: lns.anim.drawings.length - 1,  
			f: { s: +f || lns.anim.currentFrame, e: +f || lns.anim.currentFrame }
		}));
		console.log(self.layer.f);
	};

	this.brush = 0;
	this.brushSpread = 1;
	this.startDots = false;
	this.dots = 10;
	this.grass = 0;

	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer
	this.mouseInterval = 30;
	this.isDrawing = false; // for drawStart to drawEnd so its not always moving

	this.outSideCanvas = function(ev) {
		if (ev.toElement != lns.canvas.canvas) {
			if (self.isDrawing) lns.data.saveLines();
			self.isDrawing = false;
		}
	};

	this.pop = function() {
		if (self.drawing.length > 0) {
			if (self.drawing.pop() == 'end')
				self.drawing.pop();
			self.drawing.push('end');
		}
	};

	this.popOff = function() {
		if (self.drawing.length > 0) {
			self.drawing.pop(); // remove end
			for (let i = self.drawing.length - 1; i > 0; i--) {
				if (self.drawing[i] != 'end') self.drawing.pop();
				else break;
			}
		}
	};

	this.update = function(ev) {
		if (performance.now() > self.mouseInterval + self.mouseTimer) {
			self.mouseTimer = performance.now();
			if (self.isDrawing)
				if (self.brush <= 0)
					self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
				else
					self.addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	};

	this.addBrush = function(x, y) {
		const b = self.brush * self.brush * self.brushSpread;
		let _y = 1;
		if (self.grass > 0) _y *= self.grass;
		let origin = new Cool.Vector(x, y);
		for (let i = 0; i < self.brush; i++) {
			let point = new Cool.Vector(x + Cool.randomInt(-b, b), y + Cool.randomInt(-b, b));
			while (point.dist(origin) > b){
				point = new Cool.Vector(x + Cool.randomInt(-b, b), y + Cool.randomInt(-b, b));
			}
			self.drawing.push(point);
			const points = Cool.randomInt(1,3);
			for (let i = 0; i < points; i ++) {
				self.drawing.push(new Cool.Vector(
					point.x + Cool.randomInt(-1, 1),
					point.y + Cool.randomInt(_y)
				));
			}
			self.drawing.push('end');
		}
	}

	this.addLine = function(x, y) {
		self.drawing.push(new Cool.Vector(x, y));
	};

	this.start = function(ev) {
		if (ev.which == 1 && !lns.render.isPlaying && !ev.altKey) {
			self.isDrawing = true;
			self.mouseTimer = performance.now();
			if (self.brush <= 0)
				self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
			else
				self.addBrush(ev.offsetX, ev.offsetY);
		} else if (ev.altKey) {
			self.startDots = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	};

	this.end = function(ev) {
		if (self.startDots) {
			const w = Math.abs(self.startDots.x - ev.offsetX);
			const h = Math.abs(self.startDots.y - ev.offsetY);
			const ratio =  w / h;
			const c = w / (ratio * self.dots/2);
			const r = h / (1/ratio * self.dots/2);
			let [startX, endX] = self.startDots.x < ev.offsetX ? [self.startDots.x, ev.offsetX] : [ev.offsetX, self.startDots.x];
			let [startY, endY] = self.startDots.y < ev.offsetY ? [self.startDots.y, ev.offsetY] : [ev.offsetY, self.startDots.y];
			for (let x = startX; x < endX; x += c) {
				for (let y = startY; y < endY; y += r) {
					const _x = Math.round(x) + Cool.randomInt(-c/2, c/2);
					const _y = Math.round(y) + Cool.randomInt(-r/2, r/2);
					const points = Cool.randomInt(1,3);
					for (let i = 0; i < points; i ++) {
						self.drawing.push(new Cool.Vector(
							_x + Cool.randomInt(-1, 1),
							_y + Cool.randomInt(-1, 1)
						));
					}
					self.drawing.push('end');
				}
			}
			self.startDots = false;
		} else if (ev.which == 1) {
			self.isDrawing = false;
			/* prevent saving single point drawing segments */
			if (self.drawing[self.drawing.length-2] != 'end' &&
				self.drawing.length > 1) {
				self.drawing.push("end");
			} else {
				self.drawing.pop();
			}
		}
	}

	if (window.PointerEvent) {
		lns.canvas.canvas.addEventListener('pointermove', self.update);
		lns.canvas.canvas.addEventListener('pointerdown', self.start);
		lns.canvas.canvas.addEventListener('pointerup', self.end);
	} else {
		lns.canvas.canvas.addEventListener('mousemove', self.update);
		lns.canvas.canvas.addEventListener('mousedown', self.start);
		lns.canvas.canvas.addEventListener('mouseup', self.end);

		const lastTouch = { which: 1 };

		function toucher(ev, callback) {
			ev.preventDefault();
			if (ev.touches[0]) {
				const rect = ev.target.getBoundingClientRect();
				lastTouch.offsetX = ev.targetTouches[0].pageX - rect.left - window.scrollX;
				lastTouch.offsetY = ev.targetTouches[0].pageY - rect.top - window.scrollY;
				lastTouch.which = 1;
				callback(lastTouch);
			}
		}

		/* apple pencil - safari doesn't support pointer event */
		lns.canvas.canvas.addEventListener('touchstart', ev => {
			toucher(ev, self.start);
		});
		lns.canvas.canvas.addEventListener('touchmove', ev => {
			toucher(ev, self.update);
		});
		lns.canvas.canvas.addEventListener('touchend', ev => {
			self.end(lastTouch);
		});
	}
	document.addEventListener('mousemove', self.outSideCanvas);
}
