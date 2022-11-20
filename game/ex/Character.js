/* separate classes forlder */

const { Sprite } = window.LinesEngine;

class Character extends Sprite {
	constructor(x, y) {
		super(x, y);
		this.speed = [0, 0]; /* sprite physics has velocity ... */
		this.addAnimation(gme.anims.data.sprite);
	}

	update() {
		this.position[0] += this.speed[0];
		this.position[1] += this.speed[1];
	}
}