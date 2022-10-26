/*
	properties for drawing with brush
*/

function Brush(lns) {
	
	let isActive = false;

	let brushSpreadXLeft = 0;
	let brushSpreadXRight = 0;
	let brushSpreadYDown = 0;
	let brushSpreadYUp = 0;
	let brushSpreadMultiplier = 1;
	let brushRandomX = 0;
	let brushRandomY = 0;
	let brushSegmentsMin = 1;
	let brushSegmentsMax = 3;
	
	let fillActive = false;
	let fillArea = 10;
	let fillStartPoint;


	function add(drawing, origin) {

		drawing.add(origin);

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

			let point = new Cool.Vector(origin.x + _x, origin.y - _y);
			if (point.x > 0 && point.x < lns.canvas.getWidth() && 
				point.y > 0 && point.y < lns.canvas.getHeight()) {
				drawing.add(point.round());
			}
		}
		drawing.add('end');
	}

	function startFill(point) {
		fillStartPoint = point; // new Cool.Vector(x, y);
		fillActive = true;
	}

	function endFill(drawing, point) {
		const w = Math.abs(fillStartPoint.x - point.x);
		const h = Math.abs(fillStartPoint.y - point.y);
		const ratio =  w / h;
		const c = w / (ratio * fillArea / 2);
		const r = h / (1 / ratio * fillArea / 2);
		let [startX, endX] = fillStartPoint.x < point.x ? 
			[fillStartPoint.x, point.x] : 
			[x, fillStartPoint.x];
		let [startY, endY] = fillStartPoint.y < point.y ? 
			[fillStartPoint.y, point.y] : 
			[y, fillStartPoint.y];
		
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
		fillActive = false;
	}

	function connect() {

		lns.ui.addProps({
			'brushIsActive': {
				type: 'UIToggleCheck',
				value: isActive,
				label: 'Use Brush',
				key: 'b',
				callback: value => { isActive = value; }
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
				callback: value => { brushSpreadYDown = value; },
			},
			'brushSpreadYUp': {
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
			'brushFillArea': {
				type: 'UINumberRange',
				range: [10, 50],
				value: 10,
				callback: value => { fillArea = value; }
			},
		}, 'brush');
	}

	return {
		connect, add,
		startFill, endFill,
		isActive() { return isActive; },
		fillActive() { return fillActive; },
	};
}