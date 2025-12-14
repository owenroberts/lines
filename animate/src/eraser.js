/*
	eraser stuff
*/

import { getPointDistance } from '../../../cool/cool.js';
import { Points } from '../../src/lines.js';

export function Eraser(lns) {

	let isActive = false;
	let distance = 10;
	let method = 'points'; // points, lines
	let position;

	function erase(mousePosition) {
		position = structuredClone(mousePosition);
		let layers = [];
		for (let i = lns.anim.layers.length - 1; i >= 0; i--) {
			const layer = lns.anim.layers[i];
			
			if (layer.isLocked) continue;
			if (!layer.isInFrame(lns.anim.currentFrame)) continue;
		
			const drawing = lns.anim.drawings[layer.drawingIndex];

			for (let j = drawing.points.length - 1; j >= 0; j--) {
				if (drawing.points[j] === Points.END) continue;
				if (drawing.points[j] === Points.ADD) continue; // prob need to deal w this

				
				const point = structuredClone(drawing.points[j]);
				const d = getPointDistance(position, point);

				if (d < distance) {
					if (method === 'lines') {
						let s = j, e = j; // start and end points

						// work backward to start of line segment
						while (drawing.points[s] !== Points.END && s > 0) {
							s--;
						}
						
						// work forward to end of line segment
						while (drawing.points[e] !== Points.END && e < drawing.length) {
							e++;
						}
					
						drawing.points.splice(s, e - s + 1);
						break;

					} else if (method === 'points') {
						drawing.points[j] = Points.END;
					}
				}
			}

			if (method === 'points') {
				for (let j = drawing.points.length - 1; j >= 0; j--) {
					if (drawing.points[j] === Points.END && drawing.points[j - 1] === Points.END) {
						drawing.points.splice(j, 1);
					}
					if (drawing.points[j + 1] === Points.END && drawing.points[j - 1] === Points.END) {
						drawing.points.splice(j, 1);
					}
					if (drawing.points[j] === Points.END && j === 0) {
						drawing.points.splice(j, 1);
					}
				}
			}
			
			if (drawing.points.length === 0 && i !== lns.anim.layers.length - 1) {
				layer.removeIndex(lns.anim.currentFrame, function() {
					lns.anim.layers.splice(i, 1);
					lns.styles.reset();
				});
			} else {
				// console.log(layer.styleIndex, lns.anim.styles[layer.styleIndex]);
				drawing.update({ ...layer.drawProps, ...lns.anim.styles[layer.styleIndex].getProps() });
			}
		}
	}

	function connect() {
		lns.ui.addProps({
			'eraseMethod': {
				type: 'UISelect',
				options: ['points', 'lines'],
				value: method,
				callback: value => { method = value; },
			},
			eraseDistance: {
				type: 'UINumberStep',
				value: distance,
				callback: value => { distance = value; },
			}
		}, 'erase');
	}

	function draw() {
		if (!isActive) return;
		if (!position) return;
		lns.renderer.ctx.fillStyle = "rgba(150, 50, 200, 0.25)";
		lns.renderer.ctx.beginPath();
		lns.renderer.ctx.arc(position[0], position[1], distance, 0, Math.PI * 2);
		lns.renderer.ctx.fill();
	}

	return {
		connect, erase, draw,
		start(point) { 
			isActive = true; 
			position = point;
		},
		end() { isActive = false; },
		isActive() { return isActive; },
	};
}