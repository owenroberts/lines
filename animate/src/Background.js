/*
	display background image for tracing ...
	should this be possible in deployed version?
	can use css to show an image ...
	use css for this ?
*/

function Background(lns) {

	const { canvas, ctx } = lns.renderer;

	let img = new Image();
	let show = true;
	let x = 0;
	let y = 0;
	let width = 0;
	let height = 0;
	let size = 1;
	let rotation = 0;

	let dotGrid = false;
	let lineGrid = false;
	let gridColumns = 1;
	let gridRows = 1;
	let gridColor = '#808080';
	let dotSize = 2;
	let dotEdges = true;

	function loadImage(url) {
		img.src = url;
		img.onload = function() {
			width = img.width;
			height = img.height;
		}
	}

	function display(width, height) {
		if (img.src && show) {
			if (rotation > 0) {
				ctx.save();
				ctx.rotate(rotation * Math.PI / 180);
			}
			ctx.drawImage(img, x, y, size * width, height * size);
			if (rotation > 0) ctx.restore();
		}

		if (dotGrid || lineGrid) {
			let w = width / gridColumns;
			let h = height / gridRows;

			for (let x = 0; x <= gridColumns; x++) {
				for (let y = 0; y <= gridRows; y++){
					
					let _x = x * w;
					let _y = y * h;

					const tempWidth = lns.canvas.getLineWidth();
					ctx.lineWidth = 1;
					ctx.strokeStyle = gridColor;
					ctx.fillStyle = gridColor;
					
					if (lineGrid && y > 0 && y < gridRows) {
						ctx.beginPath();
						ctx.moveTo(_x, _y);
						ctx.lineTo(_x + w, _y);
						ctx.stroke();
					}

					if (lineGrid && x > 0 && x < gridColumns) {
						ctx.beginPath();
						ctx.moveTo(_x, _y);
						ctx.lineTo(_x, _y + h);
						ctx.stroke();
					}
					
					if (dotGrid) {
						let drawDot = true;
						if (!dotEdges && (x === 0 || x === gridColumns)) drawDot = false;
						if (!dotEdges && (y === 0 || y === gridRows)) drawDot = false;
					
						if (drawDot) {
							ctx.beginPath();
							ctx.arc(_x, _y, dotSize, 0, Math.PI * 2);
							ctx.fill();
						}
					}
					
					ctx.lineWidth = tempWidth; // remove after adding lw to layers later
				}
			}
		}
	}

	function connect() {
		lns.ui.addProps({
			'bgImage': {
				type: 'UIText',
				placeholder: 'URL',
				css: { 'flex-basis': '100%' },
				callback: value => { loadImage(value); },
			},
			'showBG': {
				value: show,
				key: 'alt-b',
				onText: 'Hide',
				offText: 'Show',
				callback: value => { show = value; },
			},
			'bgX': {
				row: true,
				type: 'UINumberRange',
				value: x,
				label: 'X',
				range: [-1024, 1024],
				callback: value => { x = value; },
				// input: 'x-range' ??
			},
			'bgY': {
				row: true,
				type: 'UINumberRange',
				value: y,
				label: 'Y',
				range: [-1024, 1024],
				callback: value => { y = value; },
			},
			'bgSize': {
				row: true,
				type: 'UINumberRange',
				value: size,
				label: 'Size',
				range: [0.1, 2],
				step: 0.1,
				callback: value => { size = value; },
				// input: 'x-range' ??
			},
			'bgRotation': {
				row: true,
				type: 'UINumberRange',
				value: rotation,
				label: 'Rotation',
				range: [0, 360],
				callback: value => { rotation = value; },
				// input: 'x-range' ??
			},
		}, 'background');

		lns.ui.addProps({
			'dotGrid': {
				type: 'UIToggleCheck',
				value: dotGrid,
				callback: value => { dotGrid = value; },
			},
			'dotEdges': {
				type: 'UIToggleCheck',
				value: dotEdges,
				callback: value => { dotEdges = value; },
			},
			'lineGrid': {
				type: 'UIToggleCheck',
				value: lineGrid,
				callback: value => { lineGrid = value; },
			},
			gridColumns: {
				type: 'UINumberStep',
				value: gridColumns,
				callback: value => { gridColumns = value; }
			},
			gridRows: {
				type: 'UINumberStep',
				value: gridRows,
				callback: value => { gridRows = value; }
			},
			dotSize: {
				type: 'UINumberStep',
				value: dotSize,
				callback: value => { dotSize = value; }
			},
			gridColor: {
				type: 'UIColor',
				value: gridColor,
				callback: value => { gridColor = value; }
			},
		}, 'grid');
	}

	return { connect, display };
}