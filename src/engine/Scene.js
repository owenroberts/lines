import { assert } from '../../../cool/cool.js';
import { SpriteCollection } from './SpriteCollection.js';

/**
 * basic container for sprites and events for scene in LinesEngine game
 * scene instances extend Scene (or MapScene or UIScene)
 * add their own update function called by gm
 * add scene.onKeyDown.x = fn, for key events
 */
export class Scene {
	constructor() {
		this.sprites = [];
		this.onKeyDown = {};
		this.onKeyUp = {};
	}

	/**
	 * add sprites by single, array or args
	 * @param {Sprite|Sprite[]|Sprite,Sprite..} sprite
	 */
	add(sprite) {
		if (arguments.length > 1) {
			for (const arg in arguments) {
				this.add(arg);
			}
		}

		if (Array.isArray(sprite)) {
			sprite.forEach(s => { this.add(s) });
			return;
		}

		this.sprites.push(sprite);
		return sprite;
	}

	remove(sprite) {
		this.sprites.splice(this.sprites.indexOf(sprite), 1);
	}

	clear() {
		this.sprites = [];
	}

	display(view) {
		for (let i = 0; i < this.sprites.length; i++) {
			assert(this.sprites[i].display, `sprite at ${i} has no display fn`);
			this.sprites[i].display(view);
		}
	}	
}