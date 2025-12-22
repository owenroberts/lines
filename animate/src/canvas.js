/*
	sets up canvas
	should be generic class?
	does a bunch of stuff that game engine also does ...
	should i just make this work and then consolidate later??

	is this a class?  there could be multiple canvases ...
	not strictly UI
*/

import { Points } from '../../src/lines.js';
import { UIPanel } from '../../../oi/src/oi.js';

export class CanvasPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'canvas', ui });

		this.anim = anim;
		this.renderer = renderer;

		this.tempScale = 1; // for full sizing
		this.isTemp = false;

		this.isFullSize = false;
		this.isCursorHidden = false;

		this.addButton({
			callback: () => { this.fitCanvasToDrawing(); },
			text: 'fit to drawing',
			key: 'shift-f',
		});

		this.addRef({
			obj: renderer,
			ref: "width",
			callback: value => { renderer.setWidth(value) },
		});

		this.addRef({
			obj: renderer,
			ref: "height",
			callback: value => { renderer.setHeight(value) },
		});

		this.addRef({
			obj: renderer,
			ref: "scale",
			range: [0.5, 8],
			step: 0.25,
			callback: value => {  renderer.setScale(value); },
		});

		this.addRef({
			obj: renderer,
			ref: "bgColor",
			type: "UIColor",
			callback: value => { renderer.setBGColor(value); },
		});

		this.addRef({
			obj: this,
			ref: "isCursorHidden",
			callback: value => { this.cursorToggle(value); },
			key: "alt-m",
		});

		this.addButton({
			key: "`",
			// obj: this,
			// ref: "isFullSize",
			text: "full",
			type: "UIToggle",
			callback: value => { this.setFullSize(value); },
		});

		this.addButton({
			key: "alt-1",
			text: "x1",
			callback: () => { this.toggleScale(); }
		});
	}

	cursorToggle(value) {
		if (value) {
			this.renderer.canvas.classList.add('no-cursor');
		} else {
			this.renderer.canvas.classList.remove('no-cursor');
		}
	}

	// *** test this
	fitCanvasToDrawing() {
		// this.ui.panels.styles.reset();
		
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
		this.ui.faces.width.update(Math.round((max.x - min.x) + tolerance * 2));
		this.ui.faces.height.update(Math.round((max.y - min.y) + tolerance * 2));

		for (let i = 0; i < this.anim.layers.length - 1; i++) {
			this.anim.layers[i].x -= min.x - tolerance > 0 ? min.x - tolerance : 0;
			this.anim.layers[i].y -= min.y - tolerance > 0 ? min.y - tolerance : 0;
		}
	}

	setFullSize(value) {
		this.isFullSize = value;
		console.log(this.isFullSize);
		if (this.isFullSize) {
			this.tempScale = this.renderer.scale;
			
			// const rect = container.el.getBoundingClientRect();
			const w = window.innerWidth - 32;
			const h = window.innerHeight - 32;

			// width proportion larger, scale to height
			if (this.renderer.width / this.renderer.height < w / h) {
				let s = h > this.renderer.height ? 
					h / this.renderer.height : 
					this.renderer.height / h;
				this.renderer.setScale(s);
			} else {
				let s = w > this.renderer.width ? 
					w / this.renderer.width : 
					this.renderer.width / w;
				this.renderer.setScale(s);
			}

			this.ui.container.addClass('full-size');

		} else {
			this.ui.container.removeClass('full-size');
			this.renderer.setScale(this.tempScale);
		}
	}

	toggleScale() {
		this.isTemp = !this.isTemp;
		if (this.isTemp) {
			this.tempScale = this.renderer.scale;
			this.renderer.setScale(1);
		} else {
			this.renderer.setScale(this.tempScale);
		}
	}
}