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
		lns.anim.drawings[lns.anim.drawings.length - 1] = drawing;
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

	function setProperty(prop, value) { // why is this differnt ?? -- really should be prop value
		lns.anim.updateProperty(prop, value);
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
		// rewrite with reduce
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
					setProperty('color', color,);
					lns.ui.faces.color.el.value = color;
					modal.clear();
				}
			}));
		});
	} /* g key */

	function randomColor() {
		const color = '#' + Math.floor(Math.random()*16777215).toString(16);
		setProperty('color', color);
		lns.ui.faces.color.el.value = color;
	} /* shift-g */

	function colorVariation() {
		let n = parseInt(getDrawLayer().color.substr(1), 16);
		n += Cool.randomInt(-500, 500);
		n = Math.max(0, n);
		const color = '#' + n.toString(16);
		setProperty('color', color);
		lns.ui.faces.color.el.value = color; // el ?
	} /* alt-g */

	// how often the mousemove records, default 30ms
	let mouseTimer = performance.now();  //  independent of draw timer
	let mouseInterval = 30;
	let distanceThreshold = 2; // distance between points required to record
	let isDrawing = false; // for drawStart to drawEnd so its not always moving
	let prevPosition = new Cool.Vector();
	lns.mousePosition = new Cool.Vector(); // stop using vectors all together ??

	let isErasing = false;
	let eraseDistance = 10;
	let eraseMethod = 'points'; // points, lines

	/* update all of this shit with returns */

	function outSideCanvas(ev) {
		if (ev.toElement !== lns.canvas.canvas) {
			if (isDrawing) reset();
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

	function erase(x, y) {
		let mousePosition = new Cool.Vector(x, y).divide(lns.canvas.getScale()).round();

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
					} else if (eraseMethod === 'points') {
						drawing.points[j] = 'end';
					}
				}
			}

			if (eraseMethod === 'points') {
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

			const point = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY))
				.divide(lns.canvas.getScale())
				.round();

			if (isDrawing) {
				if (lns.brush.isActive()) {
					lns.brush.add(getCurrentDrawing(), point);
				} else {
					if (lns.mousePosition.distance(prevPosition) > distanceThreshold) {
						addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
						prevPosition = lns.mousePosition.clone();
					}
				}
			} else if (isErasing) {
				erase(Math.round(ev.offsetX), Math.round(ev.offsetY));
			}
		}
	}

	function start(ev) {
		ev.preventDefault();

		const drawing = getCurrentDrawing();
		const point = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY))
			.divide(lns.canvas.getScale())
			.round();

		if (ev.which >= 2) isErasing = true;
		if (ev.which == 1 && !lns.render.isPlaying && !ev.altKey) {

			if (ev.ctrlKey) {
				isErasing = true;
			} else {
				isDrawing = true;
				mouseTimer = performance.now();
				if (lns.brush.isActive()) {
					lns.brush.add(drawing, point);
				} else {
					drawing.add(point);
					prevPosition = lns.mousePosition.clone();
				}
			}
		} else if (ev.altKey) {
			lns.brush.startFill(point);
		}
	}

	function end(ev) {
		isErasing = false;
		const drawing = getCurrentDrawing();
		const point = new Cool.Vector(Math.round(ev.offsetX), Math.round(ev.offsetY))
			.divide(lns.canvas.getScale())
			.round();
			
		if (lns.brush.fillActive()) {
			lns.brush.endFill(drawing, point);
		} else if (ev.which === 1) {
			isDrawing = false;
			
			let last = drawing.get(-2); /* prevent saving single point drawing segments */
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

	document.addEventListener('mousemove', outSideCanvas);

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

		const drawPanel = lns.ui.getPanel('draw', { label: 'Lines' });

		lns.ui.addCallbacks([
			{ callback: reset, key: 'r', text: 'Save Lines' },
			{ callback: setDefaults, text: 'Reset Defaults' },
		], 'draw');

		lns.ui.addProps({
			'linesInterval': {
				type: 'UINumberStep',
				value: defaults.linesInterval,
				range: [1, 10],
				callback: value => { setProperty('linesInterval', value); }
			},
			'segmentNum': {
				type: 'UINumberStep',
				value: defaults.segmentNum,
				range: [1, 10],
				callback: value => { setProperty('segmentNum', value); }
			},
			'jiggleRange': {
				type: 'UINumberStep',
				value: defaults.jiggleRange,
				range: [0, 10],
				callback: value => { setProperty('jiggleRange', value); }
			},
			'wiggleRange': {
				type: 'UINumberStep',
				value: defaults.wiggleRange,
				range: [0, 16],
				callback: value => { setProperty('wiggleRange', value); }
			},
			'wiggleSpeed': {
				type: 'UINumberStep',
				value: defaults.wiggleSpeed,
				range: [0, 8],
				step: 0.005,
				callback: value => { setProperty('wiggleSpeed', value); }
			},
			'wiggleSegments': {
				type: 'UIToggleCheck',
				value: defaults.wiggleSegments,
				callback: value => { setProperty('wiggleSegments', value); }
			},
			'breaks': {
				type: 'UIToggleCheck',
				value: defaults.breaks,
				callback: value => { setProperty('breaks', value); }
			},
			'color': {
				type: 'UIColor',
				value: defaults.color, // huh lns.anim.getProps ? 
				callback: value => { setProperty('color', value); }
			},
		}, 'draw');

		

		lns.ui.addCallbacks([
			{ callback: quickColorSelect, key: 'g', text: 'Quick Color', row: true, },
			{ callback: randomColor, key: 'shift-g', text: 'Random Color', },
			{ callback: colorVariation, key: 'alt-g', text: 'Color Variation', },
		], 'draw');

		lns.ui.addProp('eraseMethod', {
			type: 'UISelect',
			option: ['points', 'lines'],
			callback: value => { eraseMethod = value; },
		}, 'erase');
	}

	return { 
		connect, reset, setDefaults, 
		getDrawLayer, getCurrentDrawing, setCurrentDrawing,
		popOff, pop, cutEnd,
		hasDrawing, 
		setProperties,
		isDrawing() { return isDrawing; },
		stop() { isDrawing = false; },
	};
}
