import { assert, randomInt } from '../../../cool/cool.js';
import { BBox } from '../Engine.js';

export const FrameTypes = {
	INDEX: 0, // gets index from location
	RANDOM_INDEX: 1, // randomized location index
	RANDOM_FRAME: 2, // just random frames all the time
};
 
/**
 * set of frames from LinesAnimation
 * draw at tiles
 */
export class TileSet {

	/**
	 * creates TileSet
	 * @param  {object} 	[params] 
	 * @param  {number} 	[params.frameType=FrameTypes.INDEX] - type of frame to display
	 * @param  {boolean} 	[params.isActive=true]
	 * @param  {boolean} 	[params.hasColliders=false]
	 * @param  {boolean} 	debug
	 */
	constructor(params, debug) {
		this.debug = debug;

		this.frameType = params.frameType ?? FrameTypes.INDEX; // bad name
		this.isActive = params.isActive ?? true;
		this.hasColliders = params.hasColliders ?? false;

		this.tiles = [];
		this.offset = { x: 0, y: 0 }; // for moving maps
		
		if (params.animation) {
			this.addAnimation(params.animation);
		}
	}

	addAnimation(animation) {
		this.animation = animation;
	}

	/**
	 * add tile
	 * @param {number} x     - x position
	 * @param {number} y     - y position
	 * @param {number} index - frame index
	 */
	add(x, y, frameIndex) {

		if (!Number.isFinite(frameIndex) && this.frameType === FrameTypes.RANDOM_INDEX) {
			frameIndex = randomInt(0, this.animation.endFrame);	
		}

		this.animation.createNewState(`f-${frameIndex}`, frameIndex, frameIndex);
		let tile = { x, y, frameIndex };

		if (this.hasColliders) {
			tile.collider = new BBox(x, y, this.animation.width, this.animation.height);
		}

		this.tiles.push(tile);
	}

	addLocations(tiles) {
		assert(false, "do i use this? deprecate?");
		if (tiles) this.tiles.push(...tiles);

		// why doesn't this just call add location?
		for (let i = 0; i < this.tiles.length; i++) {
			if (this.frame === 'index') {
				this.tiles[i].i = i;
				this.animation.createNewState(`f-${i}`, i, i);
			}
			else if (this.frame === 'random') {
				this.animation.randomFrames = true;
			}
			else if (this.frame === 'randomIndex') {
				let randomIndex = Cool.randomInt(0, this.animation.endFrame);
				this.tiles[i].i = randomIndex;
				this.animation.createNewState(`f-${randomIndex}`, randomIndex, randomIndex);
			}
		}
	}

	clear() { this.tiles = []; }

	draw(view) {
		if (!this.isActive) return;
		for (let i = 0; i < this.tiles.length; i++) {
			// need to rewrite for moving map to update colliders
			// let x = this.tiles[i].x + this.offset[0];
			// let y = this.tiles[i].y + this.offset[1];
			
			// test on screen -- tackle this later
			// if (!view.isColliding(this.tiles[i].collider)) {
				// continue;
			// }

			this.animation.state = `f-${this.tiles[i].frameIndex}`;
			this.animation.draw(this.tiles[i].x, this.tiles[i].y);
		}
	}

	// tackle later with moving game
	update(offset) {
		this.offset[0] = offset[0];
		this.offset[1] = offset[1];

		if (this.hasColliders) {
			// add later
		}
	}

	isColliding(othr) {
		for (let i = 0; i < this.tiles.length; i++) {
			if (othr.isColliding(this.tiles[i].collider)) {
				return true;
			}
		}
		return false;
	}

	getCollisionLocation(othr) {
		for (let i = 0; i < this.tiles.length; i++) {
			if (othr.isColliding(this.tiles[i].collider)) {
				return [this.tiles[i].x, this.tiles[i].y];
			}
		}
		return false;
	}
}