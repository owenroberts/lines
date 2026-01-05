import { random, randomInt } from "../../../cool/cool.js";
import { Points } from '../../src/lines.js';
import { UIPanel } from '../../../oi/src/oi.js';

/**
 * props for drawing in "brush" mode
 */
export class BrushPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'brush', ui });

		this.anim = anim;
		this.renderer = renderer;
	
		this.isActive = false;
		this.isGrass = false;

		this.spreadXLeft = 0;
		this.spreadXRight = 0;
		this.spreadYDown = 0;
		this.spreadYUp = 0;
		this.spreadMultiplier = 1;
		this.randomX = 0;
		this.randomY = 0;
		this.segmentsMin = 1;
		this.segmentsMax = 3;
		
		this.fillActive = false;
		this.fillArea = 10;
		this.fillStartPoint = [];

		this.addRefs(
			{ obj: this, },
			[
				{ ref: "isActive", key: 'b', },	
				{ ref: "isGrass", key: 'ctrl-b', },	
				{ ref: "spreadXLeft", range: [0, 10], },	
				{ ref: "spreadXRight", range: [0, 10], },	
				{ ref: "spreadYDown", range: [0, 10], },	
				{ ref: "spreadYUp", range: [0, 10], },	
				{ ref: "randomX", range: [0, 1], },	
				{ ref: "randomY", range: [0, 1], },	
				{ ref: "segmentsMin", range: [1, 5], },	
				{ ref: "segmentsMax", range: [2, 5], },	
				{ ref: "spreadMultiplier", range: [1, 32], },	
				{ ref: "fillArea", range: [10, 50], },	
			]
		);

	}

	draw(drawing, origin) {

		const numPoints = randomInt(this.segmentsMin, this.segmentsMax);
		const dist = [
			random(-this.spreadXLeft, this.spreadXRight) * this.spreadMultiplier,  
			random(-this.spreadYDown, this.spreadYUp) * this.spreadMultiplier
		];

		for (let i = 1; i <= numPoints; i ++) {
			let _x = (this.isGrass ? 
				random(-this.spreadXLeft, this.spreadXRight)
			 	* this.spreadMultiplier 
				* (1 - random(this.randomX)) : // this does nothing ... already random
			 	dist[0])
				* (this.isGrass ? (i / numPoints) : 1);
			
			let _y = (this.isGrass ? 
				random(-this.spreadYDown,this. spreadYUp)
			 	* this.spreadMultiplier
			 	* (1 - random(this.randomY)) :
			 	dist[1])
				* (this.isGrass ? (i / numPoints) : 1);
			
			let point = [origin[0] + Math.round(_x), origin[1] - Math.round(_y)];
			if (point[0] > 0 && point[0] < this.renderer.width && 
				point[1] > 0 && point[1] < this.renderer.height) {
				drawing.add(point);
			}
		}
		drawing.add(Points.END);
		this.anim.activeLayer.drawingEndIndex = this.anim.activeDrawing.length;
	}

	startFill(point) {
		this.fillStartPoint = point;
		this.fillActive = true;
	}

	endFill(drawing, point) {
		const w = Math.abs(this.fillStartPoint[0] - point[0]);
		const h = Math.abs(this.fillStartPoint[1] - point[1]);
		const ratio =  w / h;
		const c = w / (ratio * this.fillArea / 2);
		const r = h / (1 / ratio * this.fillArea / 2);
		
		let [startX, endX] = this.fillStartPoint[0] < point[0] ? 
			[this.fillStartPoint[0], point[0]] : 
			[point[0], this.fillStartPoint[0]];
		
		let [startY, endY] = this.fillStartPoint[1] < point[1] ? 
			[this.fillStartPoint[1], point[1]] : 
			[point[1], this.fillStartPoint[1]];
		
		for (let x = startX; x < endX; x += c) {
			for (let y = startY; y < endY; y += r) {
				const _x = Math.round(x) + randomInt(-c/2, c/2);
				const _y = Math.round(y) + randomInt(-r/2, r/2);
				const points = randomInt(1,3);
				for (let i = 0; i < points; i ++) {
					drawing.add([
						_x + randomInt(-1, 1),
						_y + randomInt(-1, 1)
					]);
				}
				drawing.add(Points.END);
			}
		}
		this.fillActive = false;
		this.anim.activeLayer.drawingEndIndex = this.anim.activeDrawing.length;
	}
}