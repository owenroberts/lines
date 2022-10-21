/*
	this is more like mouse events or something ... 
*/

function Draw(lns, defaults) {

	function getDrawLayer() {
		return lns.anim.getDrawLayer();
	}

	function getCurrentDrawing() {
		return lns.anim.drawings[lns.anim.drawings.length - 1];
	}

	// use this ??
	function setCurrentDrawing(drawing) {
		lns.anim.drawings[lns.anim.drawings.length = 1] = drawing;
	}


	lns.anim.drawings.push(new Drawing());
	lns.anim.layers.push(new Layer({ 
		...defaults, 
		drawingIndex: Math.max(lns.anim.drawings.length - 1, 0),  
		startFrame: lns.anim.currentFrame,
	}));

	function setProperties(props, uiOnly) {
		for (const prop in props) {
			if (getDrawLayer()[prop] !== undefined) {
				getDrawLayer()[prop] = props[prop]; // should just be layer prop right??
				// lns.anim.updateProperty(prop, props[prop]);
				if (lns.ui.faces[prop]) lns.ui.faces[prop].update(props[prop], uiOnly); // should just do this .. jesus christ
			}
		}
	}

	function setProperty(value, prop) { // why is this differnt ?? -- really should be prop value
		lns.anim.updateProperty(value, prop);
		getDrawLayer()[prop] = value;
	}

	function setDefaults() {
		setProperties(defaults);
	}

	function reset(f) {
		let drawing = getCurrentDrawing();
		let newDrawing = drawing ? false : true;
		if (drawing.length > 0) newDrawing = true;

		if (newDrawing) {
			lns.anim.drawings.push(new Drawing()); // new Drawing?
			/* seems repetietive - settings class ... ? */
			lns.ui.faces.color.addColor(getDrawLayer().color); // add color to color pallette
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
	} /* r key */

	function cutEnd() {
		/* make sure draw layer doesn't extend to far */
		let endFrame = 0;
		// write with reduce
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (layer.endFrame > endFrame) endFrame = layer.endFrame;
		}
		if (getDrawLayer().endFrame > endFrame) 
			getDrawLayer().endFrame = endFrame;
		/* layer loop function?? its called forEach dumbass */
	}

	function hasDrawing() {
		// write with filters
		return lns.anim.layers.some(layer => {
			return layer.isInFrame(lns.anim.currentFrame) && 
				lns.anim.drawings[layer.drawingIndex].length > 0; 
			});
	}

	// open color selector -- why here ?? -- should be in color right??
	function quickColorSelect() {
		const modal = new UIModal({ title: "Select Color", app: lns, position: lns.mousePosition });
		modal.add(new UIColor({
			callback: value => {
				setProperty(value, 'color');
				lns.ui.faces.color.el.value = value;
			}
		}));
		lns.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { background: color },
				value: color,
				callback: () => {
					setProperty(color, 'color');
					lns.ui.faces.color.el.value = color;
					modal.clear();
				}
			}));
		});
	} /* g key */

	function randomColor() {
		const color = '#' + Math.floor(Math.random()*16777215).toString(16);
		setProperty(color, 'color');
		lns.ui.faces.color.el.value = color;
	} /* shift-g */

	function colorVariation() {
		let n = parseInt(getDrawLayer().color.substr(1), 16);
		n += Cool.randomInt(-500, 500);
		n = Math.max(0, n);
		const color = '#' + n.toString(16);
		setProperty(color, 'color');
		lns.ui.faces.color.el.value = color; // el ?
	} /* alt-g */

	/* feels like a totally unrelated section ...*/

	let isBrush = false;
	let brushSpreadXLeft = 0;
	let brushSpreadXRight = 0;
	let brushSpreadYDown = 0;
	let brushSpreadYUp = 0;
	let brushSpreadMultiplier = 1;
	let brushRandomX = 0;
	let brushRandomY = 0;
	let brushSegmentsMin = 1;
	let brushSegmentsMax = 3;
	let startDots = false;
	let dots = 10;
	let grass = 0;

	// how often the mousemove records, default 30ms
	let mouseTimer = performance.now();  //  independent of draw timer
	let mouseInterval = 30;
	let distanceThreshold = 5; // distance between points required to record
	let isDrawing = false; // for drawStart to drawEnd so its not always moving
	let prevPosition = new Cool.Vector();
	lns.mousePosition = new Cool.Vector(); // stop using vectors all together ??

	let isErasing = false;
	let eraseDistance = 10;
	let eraseMethod = 'points'; // points, lines

	/* update all of this shit with returns */

	function outSideCanvas(ev) {
		if (ev.toElement !== lns.canvas.canvas) {
			if (isDrawing) self.reset();
			isDrawing = false;
		}
	}

	function pop() {
		const drawing = getCurrentDrawing();
		if (drawing.length > 0) {
			if (drawing.pop() === 'end') drawing.pop();
			drawing.add('end');
		}
	}

	/* could be drawing class */
	function popOff() {
		const drawing = getCurrentDrawing();
		if (drawing.length > 0) {
			drawing.pop(); // remove end
			for (let i = drawing.length - 1; i >= 0; i--) {
				if (drawing.points[i] !== 'end' &&
					drawing.points[i] !== 'add') {
					drawing.pop();
				}
				else break;
			}
		}
	}

	function addBrush(x, y) {
		const drawing = getCurrentDrawing();
		let origin = new Cool.Vector(x, y);
		origin.divide(lns.canvas.scale);
		drawing.add(origin.round());

		const numPoints = Cool.randomInt(brushSegmentsMin, brushSegmentsMax);
		for (let i = 1; i <= numPoints; i ++) {
			let _x = Cool.random(-brushSpreadXLeft, brushSpreadXRight)
				* brushSpreadMultiplier
				* (i / numPoints) 
				* (1 - Cool.random(brushRandomX));
			let _y = Cool.random(-brushSpreadYDown, brushSpreadYUp)
				* brushSpreadMultiplier
				* (i / numPoints) 
				* (1 - Cool.random(brushRandomY));

			let point = new Cool.Vector(x + _x, y - _y);
			point.divide(lns.canvas.scale);
			if (point.x > 0 && point.x < lns.canvas.width && 
				point.y > 0 && point.y < lns.canvas.height) {
				drawing.add(point.round());
			}
		}
		drawing.add('end');
	}

	function addLine(x, y) {
		getCurrentDrawing().add(new Cool.Vector(x, y).divide(lns.canvas.scale).round());
	}

	function erase(x, y) {
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
				if (d < eraseDistance) {
					if (eraseMethod === 'lines') {
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
					reset();
				});
			} else {
				drawing.update(layer.drawProps);
			}
		}
	}

	function update(ev) {
		if (performance.now() > mouseInterval + mouseTimer) {
			mouseTimer = performance.now();
			lns.mousePosition.x = ev.pageX;
			lns.mousePosition.y = ev.pageY;
			if (isDrawing) {
				if (!isBrush) {
					if (lns.mousePosition.distance(prevPosition) > distanceThreshold) {
						addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
						prevPosition = lns.mousePosition.clone();
					}
				} else  {
					addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
				}
			} else if (isErasing) {
				erase(Math.round(ev.offsetX), Math.round(ev.offsetY));
			}
		}
	}

	function start(ev) {
		ev.preventDefault();
		if (ev.which >= 2) isErasing = true;
		if (ev.which == 1 && !lns.render.isPlaying && !ev.altKey) {
			if (ev.ctrlKey) {
				isErasing = true;
			} else {
				isDrawing = true;
				mouseTimer = performance.now();
				if (!isBrush) {
					addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
					prevPosition = lns.mousePosition.clone();
				} else {
					addBrush(Math.round(ev.offsetX), Math.round(ev.offsetY));
				}
			}
		} else if (ev.altKey) {
			startDots = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY));
		}
	}

	function end(ev) {
		isErasing = false;
		if (startDots) { // make func
			const drawing = getCurrentDrawing();
			const w = Math.abs(startDots.x - ev.offsetX);
			const h = Math.abs(startDots.y - ev.offsetY);
			const ratio =  w / h;
			const c = w / (ratio * dots / 2);
			const r = h / (1 / ratio * dots / 2);
			let [startX, endX] = startDots.x < ev.offsetX ? 
				[startDots.x, ev.offsetX] : 
				[ev.offsetX, self.startDots.x];
			let [startY, endY] = startDots.y < ev.offsetY ? 
				[startDots.y, ev.offsetY] : 
				[ev.offsetY, self.startDots.y];
			
			for (let x = startX; x < endX; x += c) {
				for (let y = startY; y < endY; y += r) {
					const _x = Math.round(x) + Cool.randomInt(-c/2, c/2);
					const _y = Math.round(y) + Cool.randomInt(-r/2, r/2);
					const points = Cool.randomInt(1,3);
					for (let i = 0; i < points; i ++) {
						drawing.add(new Cool.Vector(
							_x + Cool.randomInt(-1, 1),
							_y + Cool.randomInt(-1, 1)
						));
					}
					drawing.add('end');
				}
			}
			startDots = false;
		} else if (ev.which === 1) {
			isDrawing = false;
			const drawing = getCurrentDrawing();

			/* prevent saving single point drawing segments */
			let last = drawing.get(-2);
			if (last !== 'end' && last !== 'add' && drawing.length > 1) {
				drawing.add(ev.shiftKey ? 'add' : 'end');
			} else {
				drawing.pop();
			}
		}
		prevPosition = undefined;
	}

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
			toucher(ev, start);
		});
		lns.canvas.canvas.addEventListener('touchmove', ev => {
			toucher(ev, update);
		});
		lns.canvas.canvas.addEventListener('touchend', ev => {
			end(lastTouch);
		});
	} else if (window.PointerEvent) {
		lns.canvas.canvas.addEventListener('pointermove', update);
		lns.canvas.canvas.addEventListener('pointerdown', start);
		lns.canvas.canvas.addEventListener('pointerup', end);

	} else {
		lns.canvas.canvas.addEventListener('mousemove', update);
		lns.canvas.canvas.addEventListener('mousedown', start);
		lns.canvas.canvas.addEventListener('mouseup', end);
	}

	document.addEventListener('mousemove', self.outSideCanvas);

	function connect() {
		lns.ui.addProps({
			'mouseInterval': {
				type: 'UINumberRange',
				key: 'm',
				value: mouseInterval,
				callback: value => { mouseInterval = value; },
				range: [0, 100],
			},
			'distanceThreshold': {
				type: 'UINumberStep',
				key: 'shift-m',
				range: [0, 30],
				value: distanceThreshold,
				callback: value => { distanceThreshold = value; },
			},
		}, 'mouse');

		lns.ui.addCallbacks([
			{ callback: quickColorSelect, key: 'g', text: 'Quick Color', },
			{ callback: randomColor, key: 'shift-g', text: 'Random Color', },
			{ callback: colorVariation, key: 'alt-g', text: 'Color Variation', },
		], 'lineColor');

		lns.ui.addProps({
			'color': {
				type: 'UIColor',
				// value: color, // huh lns.anim.getProps ? 
				callback: value => { setProperty('color', value); }
			},
			'segmentNum': {
				type: 'UINumberStep',
				range: [1, 10],
				callback: value => { setProperty('segmentNum', value); }
			},
			'jiggleRange': {
				type: 'UINumberStep',
				range: [0, 10],
				callback: value => { setProperty('jiggleRange', value); }
			},
			'wiggleRange': {
				type: 'UINumberStep',
				range: [0, 16],
				callback: value => { setProperty('wiggleRange', value); }
			},
			'wiggleSpeed': {
				type: 'UINumberStep',
				range: [0, 8],
				step: 0.005,
				callback: value => { setProperty('wiggleSpeed', value); }
			},
			'wiggleSegments': {
				type: 'UIToggle',
				callback: value => { setProperty('wiggleSegments', value); }
			},
			'breaks': {
				type: 'UIToggle',
				callback: value => { setProperty('breaks', value); }
			}
		}, 'draw');

		lns.ui.addCallbacks([
			{ callback: reset, key: 'r', text: 'Save Lines' },
			{ callback: setDefaults, text: 'Reset Defaults' },
		], 'draw');

		lns.ui.addProp('eraseMethod', {
			type: 'UISelect',
			option: ['points', 'lines'],
			callback: value => { eraseMethod = value; },
		}, 'erase');

		lns.ui.addProps({
			'isBrush': {
				type: 'UIToggleCheck',
				value: isBrush,
				label: 'Use Brush',
				key: 'b',
				callback: value => { isBrush = value; }
			},
			'dots': {
				type: 'UINumberRange',
				range: [10, 50],
				value: 10,
				callback: value => { dots = value; }
			},
			'brushSpreadXLeft': {
				row: true,
				type: 'UINumberRange',
				range: [0, 50],
				callback: value => { brushSpreadXLeft = value; },
			},
			'brushSpreadXRight': {
				type: 'UINumberRange',
				range: [0, 50],
				callback: value => { brushSpreadXRight = value; },
			},
			'brushSpreadYDown': {
				type: 'UINumberRange',
				range: [0, 50],
				callback: value => { brushSpreadYUp = value; },
			},
			'brushRandomX': {
				type: 'UINumberRange',
				range: [0, 1],
				step: 0.01,
				callback: value => { brushRandomX = value; },
			},
			'brushRandomY': {
				type: 'UINumberRange',
				range: [0, 1],
				step: 0.01,
				callback: value => { brushRandomY = value; },
			},
			'brushSegmentsMin': {
				type: 'UINumberStep',
				range: [1, 5],
				value: 1,
				callback: value => { brushSegmentsMin = value; },
			},
			'brushSegmentsMax': {
				type: 'UINumberStep',
				range: [1, 5],
				value: 3,
				callback: value => { brushSegmentsMax = value; },
			},
			'brushSpreadMultiplier': {
				type: 'UINumberStep',
				range: [1, 5],
				value: 1,
				callback: value => { brushSpreadMultiplier = value; },
			},
		}, 'brush')
	}

	return { connect, reset };
}
