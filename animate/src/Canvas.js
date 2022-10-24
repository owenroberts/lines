/*
	sets up canvas
	should be generic class?
	does a bunch of stuff that game engine also does ...
	should i just make this work and then consolidate later??

	is this a class?  there could be multiple canvases ...
	not strictly UI
*/

function Canvas(id, width=512, height=512, color='#ffffff', checkRetina= true) {

	/* width and height are pixel dimensions
		canvas width and height are dependent on dpr */
	const canvas = document.getElementById(id); // lns.canvas.canvas is html elem
	// this.canvas.style.imageRendering = 'pixelated'; // doesn't really look different
	let dpr = checkRetina ? window.devicePixelRatio || 1 : 1;
	let scale = 1;
	let lineWidth = 1; // to keep value from getting reset

	const ctx = canvas.getContext('2d');
	ctx.miterLimit = 1;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	// let color = color || '#ffffff';
	// let width = _width || 512;
	// let height = _height || 512;

	setBGColor(color);
	setWidth(width);
	setHeight(height);

	function canvasUpdate() {
		ctx.miterLimit = 1;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function setBGColor(color) {
		canvas.style.backgroundColor = color;
	}

	function setLineWidth(value) {
		ctx.lineWidth = lineWidth = +value;
		canvasUpdate();
	}

	function setScale(value) {
		scale = value;
		setWidth(width);
		setHeight(height);
	}

	function setWidth(value) {
		width = value;
		canvas.width = value * dpr * scale;
		reset();
	}

	function setHeight(value) {
		height = value;
		canvas.height = value * dpr * scale;
		reset();
	}

	function cursorToggle(value) {
		if (value) canvas.classList.add('no-cursor');
		else canvas.classList.remove('no-cursor');
	}

	function reset() {
		// https://www.html5rocks.com/en/tutorials/canvas/hidpi/
		ctx.scale(1, 1); // prevent multiple scales
		ctx.scale(dpr * scale, dpr * scale);
		canvas.style.zoom = 1 / dpr;
		ctx.lineWidth = lineWidth;
		canvasUpdate();
	}

	function fitCanvasToDrawing() {
		lns.draw.reset();
		
		let tolerance = 0;
		let min = { x: 10000, y: 10000 }; // min max size of canvas
		let max = { x: 0, y: 0 };

		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const drawing = lns.anim.drawings[layer.drawingIndex];
			for (let j = 0; j < drawing.length; j++) {
				const point = drawing.points[j];
				if (point === 'end' || point === 'add') continue;
				tolerance = Math.max(tolerance, layer.jiggleRange * 4); /* account for random jiggle */
				min.x = Math.min(min.x, point[0] + layer.x);
				min.y = Math.min(min.y, point[1] + layer.y);
				max.x = Math.max(max.x, point[0] + layer.x);
				max.y = Math.max(max.y, point[1] + layer.y);
			}
		}

		// example of this syntax being counter intuitive/annoying
		lns.ui.faces.width.update(Math.round((max.x - min.x) + tolerance * 2));
		lns.ui.faces.height.update(Math.round((max.y - min.y) + tolerance * 2));

		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			lns.anim.layers[i].x -= min.x - tolerance > 0 ? min.x - tolerance : 0;
			lns.anim.layers[i].y -= min.y - tolerance > 0 ? min.y - tolerance : 0;
		}
	}

	function connect() {
		
		lns.ui.addCallback({
			callback: fitCanvasToDrawing,
			text: 'Fit Canvas',
			key: 'shift-f'
		}, 'canvas');

		lns.ui.addProps({
			'width': {
				value: width,
				callback: value => { setWidth(value); }
			},
			'height': {
				value: height,
				callback: value => { setHeight(value); }
			},
			'lineWidth': {
				type: 'UINumberStep',
				value: 1,
				range: [1, 100],
				callback: value => { setLineWidth(value); }
			},	
			'canvasScale': {
				type: 'UINumberStep',
				value: 1,
				range: [0.5, 4],
				step: 0.05,
				callback: value => { setScale(value); }
			},
			'bgColor': {
				type: 'UIColor',
				value: color,
				callback: value => { setBGColor(value); }
			},
			'hideCursor': {
				type: 'UIToggleCheck',
				key: 'alt-m',
				callback: value => { cursorToggle(value) }
			}
		}, 'canvas');
	}

	return { 
		connect, canvas, ctx,
		fitCanvasToDrawing,
		setWidth, setHeight,
		setBGColor,
		getScale() { return scale; },
		getWidth() { return width; },
		getHeight() { return height; },
		getLineWidth() { return lineWidth; },
		getBGColor() { return color; },
	};
}