import { assert } from '../../../cool/cool.js';
import { BBox } from './BBox.js';

/**
 * base class for game elements
 * animation with position, size
 */
export class Sprite {

	/**
	 * sprite constructor
	 * @param  {number}   x         x position
	 * @param  {number}   y         y position
	 * @param  {object}   animation 
	 * @param  {function} callback  after animation loaded
	 */
	constructor(x, y, animation, callback) {
		
		this.bbox = new BBox(x, y); // maybe viewbox?

		this.debug = false;
		this.isActive = true;
		// this.center = false;
		
		if (animation) this.addAnimation(animation, callback);
	}

	addAnimation(animation, callback) {
		assert(animation.width, `adding animation needs width`);
		assert(animation.height, `adding animation needs height`);
		
		this.animation = animation;
		this.bbox.setSize(this.animation.width, this.animation.height);
		if (callback) callback(animation);
	}

	setPosition(x, y) {
		this.bbox.setPosition(x, y);
	}

	addCollider(x, y, w, h) {
		this.collider = new BBox(x, y, w, h);
	}

	isColliding(bbox) {

		return bbox.isCollidingBox(this.bbox.x + this.collider.x, this.bbox.y + this.collider.y, this.collider.width, this.collider.height);
	}

	draw(view) {
		if (!this.isActive) return;
		if (!this.isOnScreen(view)) return;
		// if (editorOnScreen !== undefined) isDraw = editorOnScreen;
		
		this.animation.update();
		this.animation.draw(this.bbox.x, this.bbox.y);
		
		if (this.onDraw) this.onDraw();
	}

	isOnScreen(view) {
		return this.bbox.isColliding(view);
	} 
}