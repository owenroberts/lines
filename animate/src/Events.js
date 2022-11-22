/*
	mouse / pointer events
*/

function Events(lns) {

	// how often the mousemove records, default 30ms
	let mouseTimer = performance.now();  //  independent of draw timer
	let mouseInterval = 30;
	let distanceThreshold = 2; // distance between points required to record
	let isDrawing = false; // for drawStart to drawEnd so its not always moving
	let prevPosition = new Cool.Vector();
	lns.mousePosition = new Cool.Vector(); // stop using vectors all together ??

	function outSideCanvas(ev) {
		if (ev.toElement === lns.renderer.canvas) return;
		if (isDrawing) endPoint(ev);
	}

	function transformPoint(x, y) {
		const scale = lns.renderer.getProps().scale;
		const point = [
			Math.round(x / scale),
			Math.round(y / scale),
		];
		return point;
	}

	function update(ev) {
		if (performance.now() > mouseInterval + mouseTimer) {
			mouseTimer = performance.now();
			lns.mousePosition.x = Math.round(ev.pageX);
			lns.mousePosition.y = Math.round(ev.pageY);

			const drawing = lns.anim.getCurrentDrawing();
			const point = transformPoint(ev.offsetX, ev.offsetY);

			if (isDrawing) {
				if (lns.brush.isActive()) {
					lns.brush.add(drawing, point);
				} else {
					if (lns.mousePosition.distance(prevPosition) > distanceThreshold) {
						// addLine(Math.round(ev.offsetX), Math.round(ev.offsetY));
						drawing.add(point);
						prevPosition = lns.mousePosition.clone();
					}
				}
			} else if (lns.eraser.isActive()) {
				lns.eraser.erase(point);
			}
		}
	}

	function start(ev) {
		ev.preventDefault();

		const drawing = lns.anim.getCurrentDrawing();
		const point = transformPoint(ev.offsetX, ev.offsetY);

		if (ev.which >= 2) lns.eraser.start();
		if (ev.which == 1 && !lns.anim.isPlaying && !ev.altKey) {

			if (ev.ctrlKey) {
				lns.eraser.start(point);
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

	function endPoint(ev) {
		isDrawing = false;
		const drawing = lns.anim.getCurrentDrawing();
		let last = drawing.get(-2)[0]; /* prevent saving single point drawing segments */
		if (last !== 'end' && last !== 'add' && drawing.length > 1) {
			drawing.add(ev.shiftKey ? 'add' : 'end');
		} else {
			drawing.popPoint(); // if its just one point pop it off ...
		}
	}

	function end(ev) {
		lns.eraser.end();

		if (lns.brush.fillActive()) {
			const drawing = lns.anim.getCurrentDrawing();
			const point = transformPoint(ev.offsetX, ev.offsetY);
			lns.brush.endFill(drawing, point);
		} else if (ev.which === 1) {
			endPoint(ev);
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
		lns.renderer.canvas.addEventListener('touchstart', ev => {
			toucher(ev, start);
		});
		lns.renderer.canvas.addEventListener('touchmove', ev => {
			toucher(ev, update);
		});
		lns.renderer.canvas.addEventListener('touchend', ev => {
			end(lastTouch);
		});
	} else if (window.PointerEvent) {
		lns.renderer.canvas.addEventListener('pointermove', update);
		lns.renderer.canvas.addEventListener('pointerdown', start);
		lns.renderer.canvas.addEventListener('pointerup', end);

	} else {
		lns.renderer.canvas.addEventListener('mousemove', update);
		lns.renderer.canvas.addEventListener('mousedown', start);
		lns.renderer.canvas.addEventListener('mouseup', end);
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
	}

	return { 
		connect,
		isDrawing() { return isDrawing; },
		stop() { isDrawing = false; },
	};
}