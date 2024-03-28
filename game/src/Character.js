/* separate classes forlder */

import { Sprite } from '../../src/GameEngine.js';

export class Character extends Sprite {
	constructor(x, y, animation) {
		super(x, y);
		this.speed = [0, 0]; /* sprite physics has velocity ... */
		this.addAnimation(animation);
	}

	update() {
		this.position[0] += this.speed[0];
		this.position[1] += this.speed[1];
	}
}