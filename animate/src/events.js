import { getPointDistance } from '../../../cool/cool.js';
import { Points } from '../../src/lines.js';
import { UIPanel } from '../../../oi/src/oi.js';

/**
 * mouse / pointer events
 */
export class EventsPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'events', ui });

		this.anim = anim;
		this.renderer = renderer;

		this.renderer.canvas.oncontextmenu = () => {
			return false;
		};

		// nice but doesn't matter for refs
		// should this just be part of animate.js? or AnimateAnim???
		// activeDrawing, activeLayer, activeStyle
		Object.defineProperty(this, "activeDrawing", {
			get: () => {
				return this.anim.drawings.at(-1);
			}
		});

		// how often the mousemove records, default 30ms
		this.mouseTimer = performance.now();  //  independent of draw timer
		this.mouseInterval = 15;
		this.distanceThreshold = 2; // distance between points required to record
		this.isConnectLines = false;
		this.isDrawing = false; // for drawStart to drawEnd so its not always moving
		this.mousePosition = [0, 0]; // stop using vectors all together ??
		this.prevPosition = [0, 0];
	
		// sample/snap to grid
		this.samples = 0;

		this.addRef({
			obj: this,
			ref: "mouseInterval",
			range: [0, 100],
			key: "m", // need keys for this stuff???
		});

		this.addRef({
			obj: this,
			ref: "distanceThreshold",
			range: [0, 30],
			key: "shift-m",
		});

		this.addRef({
			obj: this,
			ref: "isConnectLines",
			key: "alt-o",
		});

		this.addRef({
			obj: this,
			ref: "samples",
			range: [0, 25],
			step: 1,
		});

		if (window.navigator.platform.includes('iPad')) {
			const lastTouch = { which: 1 };
			const dpr = window.devicePixelRatio;

			function toucher(ev, callback) {
				ev.preventDefault();
				if (ev.touches[0]) {
					const rect = ev.target.getBoundingClientRect();
					lastTouch.offsetX = ev.targetTouches[0].pageX - rect.left / dpr;
					lastTouch.offsetY = ev.targetTouches[0].pageY - rect.top / dpr;
					lastTouch.which = 1;
					callback(lastTouch);
				}
			}

			/* apple pencil - safari doesn't support pointer event */
			this.renderer.canvas.addEventListener('touchstart', ev => {
				this.toucher(ev, start);
			});
			this.renderer.canvas.addEventListener('touchmove', ev => {
				this.toucher(ev, update);
			});
			this.renderer.canvas.addEventListener('touchend', ev => {
				this.end(lastTouch);
			});

		} else if (window.PointerEvent) {
			this.renderer.canvas.addEventListener('pointermove', ev => {
				this.update(ev);
			});
			this.renderer.canvas.addEventListener('pointerdown', ev => {
				this.start(ev);
			});
			this.renderer.canvas.addEventListener('pointerup', ev => {
				this.end(ev);
			});
		} else {
			this.renderer.canvas.addEventListener('mousemove', ev => {
				this.update(ev);
			});
			this.renderer.canvas.addEventListener('mousedown', ev => {
				this.start(ev);
			});
			this.renderer.canvas.addEventListener('mouseup', ev => {
				this.end(ev);
			});
		}

		document.addEventListener('mousemove', ev => {
			this.detectMouseOutsideCanvas(ev);
		});
	}

	detectMouseOutsideCanvas(ev) {
		if (ev.toElement === this.renderer.canvas) return;
		if (this.isDrawing) this.endPoint(ev);
	}

	transformPoint(x, y) {
		const point = [
			Math.round(x / this.renderer.scale),
			Math.round(y / this.renderer.scale),
		];

		if (this.samples > 0) {	
			point[0] = Math.floor(point[0] / this.samples) * this.samples;
			point[1] = Math.floor(point[1] / this.samples) * this.samples;
		}
		return point;
	}

	update(ev) {
		if (performance.now() > this.mouseInterval + this.mouseTimer) {
			this.mouseTimer = performance.now();
			this.mousePosition[0] = Math.round(ev.pageX);
			this.mousePosition[1] = Math.round(ev.pageY);

			const point = this.transformPoint(ev.offsetX, ev.offsetY);

			if (this.isDrawing) {
				if (this.ui.panels.brush.isActive) {
					this.ui.panels.brush.draw(this.activeDrawing, point);
				} else {
					if (getPointDistance(this.mousePosition, this.prevPosition) > this.distanceThreshold) {
						this.activeDrawing.add(point);
						this.prevPosition = structuredClone(this.mousePosition);
					}
				}
			} else if (this.ui.panels.eraser.isActive) {
				this.ui.panels.eraser.erase(point);
			}
		}
	}

	start(ev) {
		ev.preventDefault();

		const point = this.transformPoint(ev.offsetX, ev.offsetY);

		if (ev.which >= 2) {
			this.ui.panels.eraser.start(point);
		}

		if (ev.which == 1 && !this.anim.isPlaying && !ev.altKey) {
			if (ev.ctrlKey) {
				this.ui.panels.eraser.start(point);
			} else {
				this.isDrawing = true;
				this.mouseTimer = performance.now();
				if (this.ui.panels.brush.isActive) {
					this.ui.panels.brush.draw(this.activeDrawing, point);
				} else {
					this.activeDrawing.add(point);
					this.prevPosition = structuredClone(this.mousePosition);
				}
			}
		} else if (ev.altKey) {
			this.ui.panels.brush.startFill(point);
		}
	}

	endPoint(ev) {
		this.isDrawing = false;
		let last = this.activeDrawing.get(-2)[0]; /* prevent saving single point drawing segments */
		if (last !== Points.END && last !== Points.ADD && this.activeDrawing.length > 1) {
			this.activeDrawing.add((this.isConnectLines || ev.shiftKey) ? Points.ADD : Points.END);
		} else {
			this.activeDrawing.popPoint(); // if its just one point pop it off ...
		}
	}

	end(ev) {
		this.ui.panels.eraser.end();
		if (this.ui.panels.brush.fillActive) {
			const point = this.transformPoint(ev.offsetX, ev.offsetY);
			this.ui.panels.brush.endFill(this.activeDrawing, point);
		} else if (ev.which === 1) {
			this.endPoint(ev);
		}
		this.prevPosition = undefined;
	}

	stop() { 
		this.isDrawing = false; 
	}
}