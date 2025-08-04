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
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.halfWidth = Math.round(w / 2);
		this.halfHeight = Math.round(h / 2);
	}

	center() {
		this.x -= this.halfWidth;
		this.y -= this.halfHeight;
	}

	setPosition(x, y) {
		assert(Number.isFinite(x), `x is not a number, ${x}`);
		assert(Number.isFinite(y), `y is not a number, ${y}`);
		this.x = x;
		this.y = y;
	}

	addPosition(x, y) {
		assert(Number.isFinite(x), `x is not a number, ${x}`);
		assert(Number.isFinite(y), `y is not a number, ${y}`);
		this.x += x;
		this.y += y;
	}

	setSize(w, h) {
		assert(Number.isFinite(w), `w is not a number, ${w}`);
		assert(Number.isFinite(h), `h is not a number, ${h}`);

		this.w = w;
		this.h = h;
		this.halfWidth = Math.round(w / 2);
		this.halfHeight = Math.round(h / 2);
	}

	get position() { return [this.x, this.y]; }
	get size() { return [this.w, this.h]; }
	get width() { return this.w; }
	get height() { return this.h; }
	get centeredPosition() {
		return [
			this.x + this.halfWidth,
			this.y + this.halfHeight,
		];
	}

	containsPoint(x, y) {
		if (
			x > this.x &&
			x < (this.x + this.w) &&
			y > this.y &&
			y < (this.y + this.h)
		) {
			return true;
		}
		return false;
	}

	isColliding(othr) {
		assert(othr.isBBox, `other is not bbox`);

		if (
			this.x < othr.x + othr.w &&
			this.x + this.h > othr.x &&
			this.y < othr.y + othr.h &&
			this.y + this.h > othr.y
		) {
			return true;
		}
		return false;
	}

	isCollidingBox(x, y, w, h) {
		if (
			this.x < x + w &&
			this.x + this.w > x &&
			this.y < y + h &&
			this.y + this.h > y
		) {
			return true;
		}
		return false;
	}

	// put this in gm?
	drawDebug({ x=0, y=0, color="#00ffbb", label }={}) {
		GAME.renderer.ctx.lineWidth = 1;
		GAME.renderer.ctx.beginPath();
		GAME.renderer.ctx.rect(x + this.x, y + this.y, this.w, this.h);
		const temp = GAME.renderer.ctx.strokeStyle;
		GAME.renderer.ctx.strokeStyle = color;
		GAME.renderer.ctx.stroke();
		GAME.renderer.ctx.strokeStyle = temp;
		if (label) {
			GAME.renderer.ctx.fillText(this.label, x + this.x, y + this.y);
		}
		if (GAME.renderer.lineWidth !== 1) {
			GAME.renderer.ctx.lineWidth = GAME.lineWidth;
		}
	}

}