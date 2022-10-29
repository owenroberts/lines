/*
	eraser stuff
*/

function Eraser(lns) {

	let isActive = false;
	let distance = 10;
	let method = 'points'; // points, lines
	let position;

	function erase(mousePosition) {
		// let mousePosition = new Cool.Vector(x, y).divide(lns.canvas.getScale()).round();
		position = mousePosition;
		let layers = [];
		for (let i = lns.anim.layers.length - 1; i >= 0; i--) {
			const layer = lns.anim.layers[i];
			
			if (layer.isLocked) continue;
			if (!layer.isInFrame(lns.anim.currentFrame)) continue;
		
			const drawing = lns.anim.drawings[layer.drawingIndex];

			for (let j = drawing.points.length - 1; j >= 0; j--) {
				if (drawing.points[j] === 'end') continue;
				if (drawing.points[j] === 'add') continue; // prob need to deal w this

				const point = new Cool.Vector(drawing.points[j]);
				const d = mousePosition.distance(point);
				
				if (d < distance) {
					if (method === 'lines') {
						let s = j, e = j; // start and end points
						while (drawing.points[s] !== 'end' && s > 0) {
							s--;
						}
						while (drawing.points[e] !== 'end' && e < drawing.length) {
							e++;
						}
						drawing.points.splice(s, e);
					} else if (method === 'points') {
						drawing.points[j] = 'end';
					}
				}
			}

			if (method === 'points') {
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

	function display() {
		if (!isActive) return;
		if (!position) return;
		lns.renderer.ctx.fillStyle = "rgba(150, 50, 200, 0.25)";
		lns.renderer.ctx.beginPath();
		lns.renderer.ctx.arc(position.x, position.y, distance, 0, Math.PI * 2);
		lns.renderer.ctx.fill();
	}

	return {
		connect, erase, display,
		start(point) { 
			isActive = true; 
			position = point;
		},
		end() { isActive = false; },
		isActive() { return isActive; },
	}
}