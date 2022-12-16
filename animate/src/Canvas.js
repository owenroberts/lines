/*
	sets up canvas
	should be generic class?
	does a bunch of stuff that game engine also does ...
	should i just make this work and then consolidate later??

	is this a class?  there could be multiple canvases ...
	not strictly UI
*/

function Canvas(lns, params) {

	const { canvas, ctx } = lns.renderer;
	let { width, height, scale, lineWidth, bgColor } = lns.renderer.getProps();
	let canvasTempScale = 1; // for full sizing

	setBGColor(bgColor);

	function setBGColor(value) {
		bgColor = value;
		canvas.style.backgroundColor = bgColor;
	}

	function cursorToggle(value) {
		if (value) canvas.classList.add('no-cursor');
		else canvas.classList.remove('no-cursor');
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
				callback: value => {
					width = value;
					lns.renderer.setWidth(value); 
				}
			},
			'height': {
				value: height,
				callback: value => { 
					height = value;
					lns.renderer.setHeight(value); 
				}
			},
			'canvasScale': {
				type: 'UINumberStep',
				value: scale,
				range: [0.5, 10],
				step: 0.05,
				callback: value => { 
					scale = value;
					lns.renderer.setScale(value); 
				}
			},
			'bgColor': {
				type: 'UIColor',
				value: bgColor,
				callback: value => { setBGColor(value); }
			},
			'hideCursor': {
				type: 'UIToggleCheck',
				key: 'alt-m',
				callback: value => { cursorToggle(value); }
			}
		}, 'canvas');

		lns.ui.addCallback({
			type: 'UIToggle',
			callback: value => {
				const { container } = lns.ui.getLayout();
				
				if (value) {
					canvasTempScale = scale;
					
					// const rect = container.el.getBoundingClientRect();
					const w = window.innerWidth - 32;
					const h = window.innerHeight - 32;

					// console.dir(container.el)
					// console.log(w, h, width, height);
					// console.log(width/height, w/h);

					// width proportion larger, scale to height
					if (width / height < w / h) {
						let s = h > height ? h / height : height / h;
						// console.log('h', s);
						lns.renderer.setScale(s);
						scale = s;
					} else {
						let s = w > width ? w / width : width / w;
						// console.log('w', s);
						lns.renderer.setScale(s);
						scale = s;
					}

					container.addClass('full-size');

				} else {
					lns.ui.getLayout().container.removeClass('full-size');
					lns.renderer.setScale(canvasTempScale);
					scale = canvasTempScale;
				}
			},
			text: 'Full Size',
			key: '`'
		});

		lns.ui.addCallback({
			type: 'UIToggle',
			callback: value => {
				if (value) {
					canvasTempScale = scale;
					lns.renderer.setScale(1);
					scale = 1;
				} else {
					lns.renderer.setScale(canvasTempScale);
					scale = canvasTempScale;
				}
			},
			text: 'x1',
			key: '1'
		});
	}

	return { 
		connect, canvas, ctx,
		fitCanvasToDrawing,
		setBGColor,
		getScale() { return lns.renderer.getProps().scale; },
		getWidth() { return lns.renderer.getProps().width; },
		getHeight() { return lns.renderer.getProps().height; },
		getLineWidth() { return lns.renderer.getProps().lineWidth; },
		getBGColor() { return bgColor; },
	};
}