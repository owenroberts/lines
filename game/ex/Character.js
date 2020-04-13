/* separate classes forlder */
class Character extends Sprite {
	constructor(x, y) {
		super(x, y);
		this.speed = new Cool.Vector(0, 0); /* sprite physics has velocity ... */
		this.addAnimation(gme.anims.data.sprite);
	}

	update() {
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	}
}