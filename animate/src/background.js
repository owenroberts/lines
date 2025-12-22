import { UIPanel } from '../../../oi/src/oi.js';

/**
 * bg image or grid
 */
export class BackgroundPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'bg', ui });

		this.anim = anim;
		this.renderer = renderer;
		this.canvas = renderer.canvas;
		this.ctx = renderer.ctx;

		this.img = new Image();
		this.show = true;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.size = 1;
		this.rotation = 0;
		
		this.dotGrid = false;
		this.lineGrid = false;
		this.gridColumns = 1;
		this.gridRows = 1;
		this.gridColor = '#808080';
		this.dotSize = 2;
		this.dotEdges = true;

		this.addRef({
			label: "add bg image",
			value: "URL",
			css: { 'flex-basis': '100%' },
			callback: value => { this.loadImage(value) },
		});

		this.addRefs(
			{ obj: this, },
			[

				{ ref: "show", key: 'alt-b', },
				{ ref: "x", range: [-1024, 1024], },
				{ ref: "y", range: [-1024, 1024], },
				{ ref: "size", range: [0.1, 2], step: 0.1, },
				{ ref: "rotation", range: [0, 360], },
				{ ref: "dotGrid", },
				{ ref: "lineGrid", },
				{ ref: "gridColumns", },
				{ ref: "gridRows", },
				{ ref: "gridColor", type: "UIColor" },
				{ ref: "dotSize", },
				{ ref: "dotEdges", },
			]
		);
	}

	loadImage(url) {
		if (url === 'URL') return; // dumb default to prevent error
		this.img.src = url;
		this.img.onload = () => {
			this.width = this.img.width;
			this.height = this.img.height;
		}
	}

	draw() {
		if (this.img.src && this.show) {
			if (this.rotation > 0) {
				this.ctx.save();
				this.ctx.rotate(this.rotation * Math.PI / 180);
			}
			this.ctx.drawImage(this.img, this.x, this.y, this.size * this.width, this.height * this.size);
			if (this.rotation > 0) this.ctx.restore();
		}

		if (this.dotGrid || this.lineGrid) {
			let w = this.renderer.width / this.gridColumns;
			let h = this.renderer.height / this.gridRows;

			for (let x = 0; x <= this.gridColumns; x++) {
				for (let y = 0; y <= this.gridRows; y++){
					
					let _x = x * w;
					let _y = y * h;

					const tempWidth = this.renderer.lineWidth;
					
					this.ctx.lineWidth = 1;
					this.ctx.strokeStyle = this.gridColor;
					this.ctx.fillStyle = this.gridColor;
					
					if (this.lineGrid && y > 0 && y < this.gridRows) {
						this.ctx.beginPath();
						this.ctx.moveTo(_x, _y);
						this.ctx.lineTo(_x + w, _y);
						this.ctx.stroke();
					}

					if (this.lineGrid && x > 0 && x < this.gridColumns) {
						this.ctx.beginPath();
						this.ctx.moveTo(_x, _y);
						this.ctx.lineTo(_x, _y + h);
						this.ctx.stroke();
					}
					
					if (this.dotGrid) {
						
						let drawDot = true;
						if (!this.dotEdges && (x === 0 || x === this.gridColumns)) {
							drawDot = false;
						}
						if (!this.dotEdges && (y === 0 || y === this.gridRows)) {
							drawDot = false;
						}
						
						if (drawDot) {
							this.ctx.beginPath();
							this.ctx.arc(_x, _y, this.dotSize, 0, Math.PI * 2);
							this.ctx.fill();
						}
					}
					
					this.ctx.lineWidth = tempWidth; // remove after adding lw to layers later
				}
			}
		}
	}
}