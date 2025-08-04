import { assert, randomInt } from '../../../cool/cool.js';

// rename SpriteTexture? (vs TextSprite)
// or SpriteMap, TileMap, TextureMap ... 

export const FrameTypes = {
	INDEX: 0, // gets index from location
	RANDOM_INDEX: 1, // randomized location index
	RANDOM_FRAME: 2, // just random frames all the time
};
 
/**
 * draws frames from one animation in multuple places (locations)
 */
export class Texture {

	/**
	 * creates texture
	 * @param  {Object} params { locations, frame, center, animation }
	 * @param  {boolean} debug  
	 */
	constructor(params, debug) {
		this.debug = debug;
		this.locations = [];

		this.frameType = params.frameType ?? FrameTypes.INDEX; // bad name
		this.center = params.center ?? false;
		this.offset = [0, 0]; // for moving maps
		this.isActive = params.isActive ?? true;

		if (params.animation) {
			this.addAnimation(params.animation);
		}

		if (params.locations && params.animation) {
			this.addLocations(); // wtf? -- is this even used?
		}
	}

	addAnimation(animation) {
		this.animation = animation;
	}

	/**
	 * add location to texture
	 * @param {number} x     - x position
	 * @param {number} y     - y position
	 * @param {number} index - frame index
	 */
	addLocation(x, y, index) {

		if (!Number.isFinite(index) && this.frameType === FrameTypes.RANDOM_INDEX) {
			index = randomInt(0, this.animation.endFrame);	
		}

		this.animation.createNewState(`f-${index}`, index, index);
		this.locations.push([x, y, index]);
	}

	addLocations(locations) {
		assert(false, "do i use this? deprecate?");
		if (locations) this.locations.push(...locations);

		// why doesn't this just call add location?
		for (let i = 0; i < this.locations.length; i++) {
			if (this.frame === 'index') {
				this.locations[i].i = i;
				this.animation.createNewState(`f-${i}`, i, i);
			}
			else if (this.frame === 'random') {
				this.animation.randomFrames = true;
			}
			else if (this.frame === 'randomIndex') {
				let randomIndex = Cool.randomInt(0, this.animation.endFrame);
				this.locations[i].i = randomIndex;
				this.animation.createNewState(`f-${randomIndex}`, randomIndex, randomIndex);
			}
		}
	}

	clear() { this.locations = []; }

	display(view) {
		if (!this.isActive) return;
		for (let i = 0; i < this.locations.length; i++) {
			let x = this.locations[i][0] + this.offset[0];
			let y = this.locations[i][1] + this.offset[1];
			
			// test on screen
			if (!view.isCollidingBox(x, y, this.animation.width, this.animation.height)) {
				continue;
			}

			this.animation.state = `f-${this.locations[i][2]}`;
			this.animation.draw(x, y);
		}
	}

	update(offset) {
		this.offset[0] = offset[0];
		this.offset[1] = offset[1];
	}

	getCollisionLocation(othr) {
		for (let i = 0; i < this.locations.length; i++) {
			let x = this.locations[i][0] + this.offset[0];
			let y = this.locations[i][1] + this.offset[1];

			if (othr.isCollidingBox(x, y, this.animation.width, this.animation.height)) {
				return [x, y];
			}
		}
		return false;
	}
}