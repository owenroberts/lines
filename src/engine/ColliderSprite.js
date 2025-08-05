import { Sprite } from './Sprite.js';

/**
 * leaving this here for UI update
 */
export class ColliderSprite extends Sprite {

	// rename this shit ... 
	tap(x, y) {
		return (
			x > this.colliderPosition[0] &&
			x < (this.colliderPosition[0] + this.collider[2]) &&
			y > this.colliderPosition[1] &&
			y < (this.colliderPosition[1] + this.collider[3])
		);
	}

	outside(other) {
		// rewrite this shit
		var next = this.position.copy();
		var nextCollider = this.collider.position.copy();
		next.add(nextCollider);
		next.add(this.velocity);
		var nextSize = this.collider.size.copy();
		if (next.x < other.position.x + other.collider.position.x ||
			next.x + nextSize.x > other.position.x + other.collider.position.x + other.collider.size.x ||
			next.y < other.position.y + other.collider.position.y ||
			next.y + nextSize.y > other.position.y + other.collider.position.y + other.collider.size.y) {
			return true;
		} else {
			return false;
		}
	}

	over(x, y) {
		// console.log('over', this);
		// if (this.isDebug) console.log(this.tap(x,y))
			// console.log(x,y, this.x * GAME.zoom, this.y * GAME.zoom);
		if (this.isActive && this.tap(x,y) && !this.mouseOver && !this.waitToGoOut) {
			this.mouseOver = true;
			if (this.onOver) this.onOver();
			return true;
		} else {
			return false;
		}
	}

	out(x, y) {
		if (this.isActive && !this.tap(x,y) && (this.mouseOver || this.waitToGoOut)) {
			this.clickStarted = false;
			this.waitToGoOut = false;
			this.mouseOver = false;
			if (this.onOut) this.onOut();
			return true;
		} else {
			return false;
		}
	}

	down(x, y) {
		if (this.isActive && this.tap(x,y)) {
			this.clickStarted = true;
			this.waitToGoOut = true;
			if (this.onDown) this.onDown();
			return true;
		} else {
			return false;
		}
	}

	up(x, y) {
		if (this.isActive && this.tap(x,y) && this.clickStarted) {
			this.mouseOver = false;
			if (this.onUp) this.onUp();
			if (this.onClick) this.onClick(x, y);
			if (this.func) this.func();
			return true;
		} else {
			return false;
		}
		this.clickStarted = false;
	}
}