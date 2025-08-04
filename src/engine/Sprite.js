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
		
		this.bbox = new BBox(x, y);

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

	setCollider(x, y, w, h) {
		this.collider = new BBox(x, y, w, h);
	}

	isColliding(bbox) {
		return this.collider.isColliding(bbox);
	}

	display(editorOnScreen) {
		// better way to do this ... 
		if (!this.isActive) return;
		if (!this.isOnScreen()) return;
		// if (editorOnScreen !== undefined) isDraw = editorOnScreen;
	
		if (this.debug) {
			this.bbox.drawDebug();
			if (this.collider) {
				this.collider.drawDebug({ 
					color: '#ff00bb',
				});
			}
		}
		
		this.animation.update();
		this.animation.draw(this.bbox.x, this.bbox.y, GAME.suspend);
		
		// onDisplay?
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen() {
		return this.bbox.isColliding(GAME.view);
	} 
}