import { assert } from '../../../cool/cool.js';

/**
 * bounding box class for sprite collisions etc.
 */
export class BBox {
	
	constructor(x=0, y=0, w=0, h=0) {
		this.isBBox = true;
		this.set(x, y, w, h);
	}

	set(x, y, w, h) {
		this.xywh = [x, y, w, h];
		this.halfWidth = Math.round(w / 2);
		this.halfHeight = Math.round(h / 2);
	}

	center() {
		this.xywh[0] -= this.halfWidth;
		this.xywh[1] -= this.halfHeight;
	}

	setPosition(x, y) {
		assert(Number.isFinite(x), `x is not a number, ${x}`);
		assert(Number.isFinite(y), `y is not a number, ${y}`);
		this.xywh[0] = x;
		this.xywh[1] = y;
	}

	addPosition(x, y) {
		assert(Number.isFinite(x), `x is not a number, ${x}`);
		assert(Number.isFinite(y), `y is not a number, ${y}`);
		this.xywh[0] += x;
		this.xywh[1] += y;
	}

	setSize(w, h) {
		assert(Number.isFinite(w), `w is not a number, ${w}`);
		assert(Number.isFinite(h), `h is not a number, ${h}`);

		this.xywh[2] = w;
		this.xywh[3] = h;
		this.halfWidth = Math.round(w / 2);
		this.halfHeight = Math.round(h / 2);
	}

	get x() { return this.xywh[0]; }
	get y() { return this.xywh[1]; }
	get width() { return this.xywh[2]; }
	get height() { return this.xywh[3]; }

	containsPoint(x, y) {
		// if (!this.isActive) return false;

		if (
			x > this.xywh[0] &&
			x < (this.xywh[0] + this.xywh[2]) &&
			y > this.xywh[1] &&
			y < (this.xywh[1] + this.xywh[3])
		) {
			return true;
		}

		return false;
	}

	isColliding(othr) {
		assert(othr.isBBox, `other is not bbox`);
		// if (!this.isActive) return false;
		// if (!othr.isActive) return false;

		if (
			this.xywh[0] < othr.xywh[0] + othr.xywh[2] &&
			this.xywh[0] + this.xywh[2] > othr.xywh[0] &&
			this.xywh[1] < othr.xywh[1] + othr.xywh[3] &&
			this.xywh[1] + this.xywh[3] > othr.xywh[1]
		) {
			return true;
		}
		return false;
	}

	isCollidingBox(x, y, w, h) {
		if (
			this.xywh[0] < x + w &&
			this.xywh[0] + this.xywh[2] > x &&
			this.xywh[1] < y + h &&
			this.xywh[1] + this.xywh[3] > y
		) {
			return true;
		}
		return false;
	}

	// put this in debug renderer??
	drawDebug({ x=0, y=0, color="#00ffbb", label }={}) {
		GAME.renderer.ctx.lineWidth = 1;
		GAME.renderer.ctx.beginPath();
		GAME.renderer.ctx.rect(x + this.xywh[0], y + this.xywh[1], this.xywh[2], this.xywh[3]);
		const temp = GAME.renderer.ctx.strokeStyle;
		GAME.renderer.ctx.strokeStyle = color;
		GAME.renderer.ctx.stroke();
		GAME.renderer.ctx.strokeStyle = temp;
		if (label) {
			GAME.renderer.ctx.fillText(this.label, x + this.xywh[0], y + this.xywh[1]);
		}
		if (GAME.renderer.lineWidth !== 1) {
			GAME.renderer.ctx.lineWidth = GAME.lineWidth;
		}
	}

}