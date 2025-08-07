/*
	sets up canvas
	should be generic class?
	does a bunch of stuff that game engine also does ...
	should i just make this work and then consolidate later??

	is this a class?  there could be multiple canvases ...
	not strictly UI
*/

import { Points } from '../../src/Lines.js';

export function Canvas(lns, params) {

	let canvasTempScale = 1; // for full sizing

	function cursorToggle(value) {
		if (value) lns.renderer.canvas.classList.add('no-cursor');
		else lns.renderer.canvas.classList.remove('no-cursor');
	}

	function fitCanvasToDrawing() {
		lns.styles.reset();
		
		let tolerance = 0;
		let min = { x: 10000, y: 10000 }; // min max size of canvas
		let max = { x: 0, y: 0 };

		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const drawing = lns.anim.drawings[layer.drawingIndex];
			for (let j = 0; j < drawing.length; j++) {
				const point = drawing.points[j];
				if (point === Points.END || point === Points.ADD) continue;
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
				value: lns.renderer.width,
				callback: value => {
					lns.renderer.setWidth(value); 
				}
			},
			'height': {
				value: lns.renderer.height,
				callback: value => { 
					lns.renderer.setHeight(value); 
				}
			},
			'canvasScale': {
				type: 'UINumberStep',
				value: lns.renderer.scale,
				range: [0.5, 10],
				step: 0.05,
				callback: value => { 
					lns.renderer.setScale(value); 
				}
			},
			'bgColor': {
				type: 'UIColor',
				value: lns.renderer.bgColor,
				callback: value => { 
					lns.renderer.setBGColor(value);
				}
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
					canvasTempScale = lns.renderer.scale;
					
					// const rect = container.el.getBoundingClientRect();
					const w = window.innerWidth - 32;
					const h = window.innerHeight - 32;

					// width proportion larger, scale to height
					if (lns.renderer.width / lns.renderer.height < w / h) {
						let s = h > lns.renderer.height ? 
							h / lns.renderer.height : 
							lns.renderer.height / h;
						lns.renderer.setScale(s);
					} else {
						let s = w > lns.renderer.width ? 
							w / lns.renderer.width : 
							lns.renderer.width / w;
						lns.renderer.setScale(s);
					}

					container.addClass('full-size');

				} else {
					lns.ui.getLayout().container.removeClass('full-size');
					lns.renderer.setScale(canvasTempScale);
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
				} else {
					lns.renderer.setScale(canvasTempScale);
				}
			},
			text: 'x1',
			key: 'alt-1',
		});
	}

	return { 
		connect,
		fitCanvasToDrawing,
		getScale() { return lns.renderer.scale; },
		getWidth() { return lns.renderer.width; },
		getHeight() { return lns.renderer.height; },
		getLineWidth() { return lns.renderer.lineWidth; },
		getBGColor() { return lns.renderer.bgColor; },
	};
}