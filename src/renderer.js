import { PixelMixin } from './effects/pixel-mixin.js';
import { AntiMixin, antiMixinRenderSetup } from './effects/anti-mixin.js';
import { setupSVGFilter } from './effects/svg-filter.js';

/**
 * renderer, sets up canvas, gets ctx, runs animationFrame loop
 * @param {object} params - params from game manager
 */
export class Renderer {
	
	constructor(params) {

		this.id = params.id ?? 'lines';
		this.dps = params.dps ?? 30; // draw per second
		this.scale = params.scale ?? 1;
		this.lineWidth = params.lineWidth ?? 1;
		this.bgColor = params.bgColor ?? params.bg ?? false;
		this.clearBg = params.clearBg ?? true;
		this.isMultiColor = params.isMultiColor ?? false;
		this.isMultiLineWidth = params.isMultiLineWidth ?? false;
		
		this.width = params.width;
		this.height = params.height;
		
		this.dpr = Math.max(1, (params.isHDPI ?? true) ? (window.devicePixelRatio ?? 1) : 1);

		this.canvas = document.getElementById(this.id);
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = this.id;
			document.body.appendChild(this.canvas);
		}

		this.ctx = this.canvas.getContext('2d');
		if (!this.ctx) return alert('the canvas cannot render');
	
		this.ctx.lineWidth = this.lineWidth;
		if (params.lineColor) this.ctx.strokeStyle = params.lineColor;
		if (this.bgColor) this.canvas.style.backgroundColor = this.bgColor;
		if (this.width) this.canvas.width = this.width * this.dpr * this.scale;
		if (this.height) this.canvas.height = this.height * this.dpr * this.scale;

		this.canvasUpdate();

		if (params.zoom || this.dpr > 1) {
			let zoom = params.zoom;
			this.canvas.style.width = this.width + 'px';
			this.canvas.style.height = this.height + 'px';
		}

		if (params.usePixels) {
			Object.assign(Lines.prototype, PixelMixin);
		}

		if (params.antiFactor) { 
			Object.assign(Lines.prototype, AntiMixin);
			antiMixinRenderSetup(this, params.antiFactor, params.smallCanvas);
		}

		if (params.svgFilter) {
			setupSVGFilter(this);
		}

		window.drawCount = 0; // lns.drawCount? ... window.updateCount ...
	
		this.interval = 1000 / (this.dps ?? 60);  // time interval between updates
		this.updateTime = performance.now();
		this.timeElapsed = null;
		this.isSuspended = false;

		this.onDraw = params.onDraw;
	}

	setDPS(value) {
		this.dps = value;
		this.interval = 1000 / value;
	}

	setScale(value) {
		this.scale = value;
		this.setWidth(this.width);
		this.setHeight(this.height);
	}

	setWidth(value) {
		this.width = value;
		this.canvas.width = this.width * this.dpr * this.scale;
		this.reset();
	}

	setHeight(value) {
		this.height = value;
		this.canvas.height = this.height * this.dpr * this.scale;
		this.reset();
	}

	setLineWidth(value) {
		this.lineWidth = value;
		this.ctx.lineWidth = value;
		this.canvasUpdate(); // idk
	}

	setBGColor(value) {
		this.bgColor = value;
		this.canvas.style.backgroundColor = this.bgColor;
	}

	canvasUpdate() {
		this.ctx.miterLimit = 1;
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
	}

	reset() {
		this.ctx.resetTransform(); // prevent multiple scales
		this.ctx.scale(this.dpr * this.scale, this.dpr * this.scale);
		// this is the part i dont want i think
		// canvas.style.zoom = 1 / dpr; 
		this.ctx.lineWidth = this.lineWidth;
		this.canvasUpdate();
	}

	update(time) {
		this.timeElapsed = time - this.updateTime;
		if (this.timeElapsed > this.interval || time === 'capture') {
			this.updateTime = time - (this.timeElapsed % this.interval);
			if (this.clearBg) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}
			this.onDraw(this.timeElapsed);
			window.drawCount++;
		}
		if (this.isSuspended) return;
		window.requestAnimFrame((timeElapsed) => {
			this.update(timeElapsed);
		});
	}

	start() {
		this.reset();
		this.updateTime = performance.now();
		this.isSuspended = false;
		window.requestAnimFrame((timeElapsed) => {
			this.update(timeElapsed);
		});
	}
}