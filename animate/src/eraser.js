import { getPointDistance } from '../../../cool/cool.js';
import { Points } from '../../src/lines.js';
import { UIPanel } from '../../../oi/src/oi.js';

const EraserMode = {
	POINTS: "points",
	LINES: "lines",
};

export class EraserPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'eraser', ui });

		this.anim = anim;
		this.renderer = renderer;

		this.isActive = false;
		this.distance = 10;
		this.mode = EraserMode.POINTS;
		this.position = [];

		this.addRefs(
			{ obj: this, },
			[
				{ ref: "mode", value: EraserMode.POINTS, options: Object.values(EraserMode), },
				{ ref: "distance" },
			]
		);
	}

	erase(mousePosition) {

		this.position = structuredClone(mousePosition);
		
		let layers = [];
		for (let i = this.anim.layers.length - 1; i >= 0; i--) {
			const layer = this.anim.layers[i];
			
			if (layer.isLocked) continue;
			if (!layer.isInFrame(this.anim.currentFrame)) continue;
		
			const drawing = this.anim.drawings[layer.drawingIndex];

			for (let j = drawing.points.length - 1; j >= 0; j--) {
				if (drawing.points[j] === Points.END) continue;
				if (drawing.points[j] === Points.ADD) continue; // prob need to deal w this

				
				const point = structuredClone(drawing.points[j]);
				const d = getPointDistance(this.position, point);

				if (d < this.distance) {
					if (this.mode === EraserMode.LINES) {
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

					} else if (this.mode === EraserMode.POINTS) {
						drawing.points[j] = Points.END;
					}
				}
			}

			if (this.mode === EraserMode.POINTS) {
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
			
			if (drawing.points.length === 0 && i !== this.anim.layers.length - 1) {

				// *** error here, maybe don't need to remove layer here 

				// layer.removeIndex(this.anim.currentFrame, () => {
					// this.anim.layers.splice(i, 1);
					// this.ui.panels.styles.reset();
				// });
			} else {
				drawing.update({ 
					...layer.drawProps, 
					...this.anim.styles[layer.styleIndex].getProps(),
				});
			}
		}
	}

	draw() {
		if (!this.isActive) return;
		if (!this.position) return;
		this.renderer.ctx.fillStyle = "rgba(150, 50, 200, 0.25)";
		this.renderer.ctx.beginPath();
		this.renderer.ctx.arc(this.position[0], this.position[1], this.distance, 0, Math.PI * 2);
		this.renderer.ctx.fill();
	}

	start(point) {
		this.isActive = true; 
		this.position = point;
	}

	end() { this.isActive = false; }
}