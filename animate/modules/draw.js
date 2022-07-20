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
		},
		set: function(drawing) {
			lns.anim.drawings[lns.anim.drawings.length - 1] = drawing;
		}
	});

	lns.anim.drawings.push(new Drawing());
	lns.anim.layers.push(new Layer({ 
		...defaults, 
		drawingIndex: Math.max(lns.anim.drawings.length - 1, 0),  
		startFrame: lns.anim.currentFrame,
	}));

	this.setProperties = function(props, uiOnly) {
		for (const prop in props) {
			if (self.layer[prop] !== undefined) {
				self.layer[prop] = props[prop];
				if (lns.ui.faces[prop]) lns.ui.faces[prop].update(props[prop], uiOnly);
			}
		}
	};

	this.setProperty = function(value, prop) {
		lns.anim.updateProperty(prop, value);
		self.layer[prop] = value;
	};

	this.setDefaults = function() {
		self.setProperties(defaults);
	};

	this.reset = function(f) {
		let newDrawing = false;
		if (!self.drawing) newDrawing = true;
		else if (self.drawing.length > 0) newDrawing = true;
		if (newDrawing) {
			lns.anim.drawings.push(new Drawing()); // new Drawing?
			/* seems repetietive - settings class ... ? */
			lns.ui.faces.color.addColor(self.layer.color); // add color to color pallette
			lns.anim.layers.push(new Layer({
				linesInterval: +lns.ui.faces.linesInterval.value,
				segmentNum: +lns.ui.faces.segmentNum.value,
				jiggleRange: +lns.ui.faces.jiggleRange.value,
				wiggleRange: +lns.ui.faces.wiggleRange.value,
				wiggleSpeed: +lns.ui.faces.wiggleSpeed.value,
				color: lns.ui.faces.color.value,
				drawingIndex: lns.anim.drawings.length - 1,
				startFrame: +f || lns.anim.currentFrame,
			}));
			lns.data.saveState();
		}  

		// or just change layer frame ?

		lns.ui.update();
	}; /* r key */

	this.cutEnd = function() {
		/* make sure draw layer doesn't extend to far */
		let endFrame = 0;
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (layer.endFrame > endFrame) endFrame = layer.endFrame;
		}
		if (lns.draw.layer.endFrame > endFrame) 
			lns.draw.layer.endFrame = endFrame;
		/* layer loop function?? its called forEach dumbass */
	};

	// what uses this?
	this.hasDrawing = function() {
		return lns.anim.layers.some(layer => {
			return layer.isInFrame(lns.anim.currentFrame) && 
				lns.anim.drawings[layer.drawingIndex].length > 0; 
			});
	};

	// open color selector
	this.quickColorSelect = function() {
		const modal = new UIModal({ title: "Select Color", app: lns, position: lns.mousePosition });
		modal.add(new UIColor({
			callback: function(value) {
				self.setProperty(value, 'color');
				lns.ui.faces.color.el.value = value;
			}
		}));
		lns.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { "background": color },
				value: color,
				callback: function() {
					self.setProperty(color, 'color');
					lns.ui.faces.color.el.value = color;
					modal.clear();
				}
			}))
		});
	}; /* g key */

	this.randomColor = function() {
		const color = '#' + Math.floor(Math.random()*16777215).toString(16);
		self.setProperty(color, 'color');
		lns.ui.faces.color.el.value = color;
	}; /* shift-g */

	this.colorVariation = function() {
		let n = parseInt(self.layer.color.substr(1), 16);
		n += Cool.randomInt(-500, 500);
		n = Math.max(0, n);
		const color = '#' + n.toString(16);
		self.setProperty(color, 'color');
		lns.ui.faces.color.el.value = color;
	}; /* alt-g */

	this.isBrush = false;
	this.brushSpreadXLeft = 0;
	this.brushSpreadXRight = 0;
	this.brushSpreadY = 0;
	this.brushRandomX = 0;
	this.brushRandomY = 0;
	this.brushSegmentsMin = 1;
	this.brushSegmentsMax = 3;
	this.startDots = false;
	this.dots = 10;
	this.grass = 0;

	// how often the mousemove records, default 30ms
	this.mouseTimer = performance.now();  //  independent of draw timer
	this.mouseInterval = 30;
	this.distanceThreshold = 5; // distance between points required to record
	this.isDrawing = false; // for drawStart to drawEnd so its not always moving
	lns.mousePosition = new Cool.Vector();
	this.prevPosition = new Cool.Vector();

	this.isErasing = false;
	this.eraseDistance = 10;
	this.eraseMethod = 'points'; // points, lines

	this.setEraseMethod = function(value) {
		self.eraseMethod = value;
	};

	this.outSideCanvas = function(ev) {
		if (ev.toElement != lns.canvas.canvas) {
			if (self.isDrawing) self.reset();
			self.isDrawing = false;
		}
	};

	this.pop = function() {
		if (self.drawing.length > 0) {
			if (self.drawing.pop() === 'end')
				self.drawing.pop();
			self.drawing.add('end');
		}
	};

	/* could be drawing class */
	this.popOff = function() {
		if (self.drawing.length > 0) {
			self.drawing.pop(); // remove end
			for (let i = self.drawing.length - 1; i >= 0; i--) {
				if (self.drawing.points[i] !== 'end' &&
					self.drawing.points[i] !== 'add') {
					self.drawing.pop();
				}
				else break;
			}
		}
	};

	this.addBrush = function(x, y) {
		// while (point.dist(origin) > self.distanceThreshold){
		let origin = new Cool.Vector(x, y);
		origin.divide(lns.canvas.scale);
		self.drawing.add(origin.round());

		const numPoints = Cool.randomInt(self.brushSegmentsMin, self.brushSegmentsMax);
		for (let i = 1; i <= numPoints; i ++) {
			let _x = Cool.random(-self.brushSpreadXLeft, self.brushSpreadXRight) * (i / numPoints) * (1 - Cool.random(self.brushRandomX));
			let _y = self.brushSpreadY * (i / numPoints) * (1 - Cool.random(self.brushRandomY));

			let point = new Cool.Vector(x + _x, y - _y);
			point.divide(lns.canvas.scale);
			if (point.x > 0 && point.x < lns.canvas.width && 
				point.y > 0 && point.y < lns.canvas.height) {
				self.drawing.add(point.round());
			}
		}
		self.drawing.add('end');
	};

	this.addLine = function(x, y) {
		self.drawing.add(new Cool.Vector(x, y).divide(lns.canvas.scale).round());
	};

	this.erase = function(x, y) {
		let mousePosition = new Cool.Vector(x, y).divide(lns.canvas.scale).round();

		let layers = [];
		for (let i = lns.anim.layers.length - 1; i >= 0; i--) {
			const layer = lns.anim.layers[i];
			
			if (layer.isLocked) continue;
			if (!layer.isInFrame(lns.anim.currentFrame)) continue;
		
			const drawing = lns.anim.drawings[layer.drawingIndex];
			for (let j = drawing.points.length - 1; j >= 0; j--) {
				const point = new Cool.Vector(drawing.points[j]);
				const d = mousePosition.distance(point);
				if (d < self.eraseDistance) {
					if (self.eraseMethod === 'lines') {
						let s = j, e = j; // start and end points
						while (drawing.points[s] !== 'end' && s > 0) {
							s--;
						}
						while (drawing.points[e] !== 'end' && e < drawing.length) {
							e++;
						}
						drawing.points.splice(s, e);
					} else if (self.eraseMethod === 'points') {
						drawing.points[j] = 'end';
					}
				}
			}

			if (self.eraseMethod === 'points') {
				for (let j = drawing.points.length - 1; j >= 0; j--) {
					if (drawing.points[j] === 'end' && drawing.points[j - 1] === 'end') {
						drawing.points.splice(j, 1);
					}
					if (drawing.points[j + 1] === 'end' && drawing.points[j - 1] === 'end') {
						drawing.points.splice(j, 1);
					}
					if (drawing.points[j] === 'end' && j === 0) {
						drawing.points.splice(j, 1);
					}
				}
			}
			
			if (drawing.points.length === 0 && i !== lns.anim.layers.length - 1) {
				layer.removeIndex(lns.anim.currentFrame, function() {
					lns.anim.layers.splice(i, 1);
					self.reset();
				});
			} else {
				drawing.update(layer.drawProps);
			}
		}
	};

	this.update = function(ev) {
		if (performance.now() > self.mouseInterval + self.mouseTimer) {
			self.mouseTimer = performance.now();
			lns.mousePosition.x = ev.pageX;
			lns.mousePosition.y = ev.pageY;
			if (self.isDrawing) {
				if (!self.isBrush) {
					if (lns.mousePosition.distance(self.prevPosition) > self.distanceThreshold) {
						self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
						self.prevPosition = lns.mousePosition.clone();
					}
				} else  {
					self.addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
				}
			} else if (self.isErasing) {
				self.erase(Math.round(ev.offsetX), Math.round(ev.offsetY));
			}
		}
	};

	this.start = function(ev) {
		ev.preventDefault();
		if (ev.which >= 2) self.isErasing = true;
		if (ev.which == 1 && !lns.render.isPlaying && !ev.altKey) {
			if (ev.ctrlKey) {
				self.isErasing = true;
			} else {
				self.isDrawing = true;
				self.mouseTimer = performance.now();
				if (!self.isBrush) {
					self.addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
					self.prevPosition = lns.mousePosition.clone();
				} else {
					self.addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
				}
			}
		} else if (ev.altKey) {
			self.startDots = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	};

	this.end = function(ev) {
		self.isErasing = false;
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
						self.drawing.add(new Cool.Vector(
							_x + Cool.randomInt(-1, 1),
							_y + Cool.randomInt(-1, 1)
						));
					}
					self.drawing.add('end');
				}
			}
			self.startDots = false;
		} else if (ev.which == 1) {
			self.isDrawing = false;

			/* prevent saving single point drawing segments */
			let last = self.drawing.get(-2);
			if (last !== 'end' && last !== 'add' && self.drawing.length > 1) {
				self.drawing.add(ev.shiftKey ? 'add' : 'end');
			} else {
				self.drawing.pop();
			}
		}
		self.prevPosition = undefined;
	};

	if (window.navigator.platform.includes('iPad')) {
		const lastTouch = { which: 1 };
		const dpr = window.devicePixelRatio;

		function toucher(ev, callback) {
			ev.preventDefault();
			if (ev.touches[0]) {
				const rect = ev.target.getBoundingClientRect();
				lastTouch.offsetX = ev.targetTouches[0].pageX - rect.left / dpr;
				lastTouch.offsetY = ev.targetTouches[0].pageY - rect.top / dpr;
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
	} else if (window.PointerEvent) {
		lns.canvas.canvas.addEventListener('pointermove', self.update);
		lns.canvas.canvas.addEventListener('pointerdown', self.start);
		lns.canvas.canvas.addEventListener('pointerup', self.end);

	} else {
		lns.canvas.canvas.addEventListener('mousemove', self.update);
		lns.canvas.canvas.addEventListener('mousedown', self.start);
		lns.canvas.canvas.addEventListener('mouseup', self.end);
	}

	document.addEventListener('mousemove', self.outSideCanvas);
}
