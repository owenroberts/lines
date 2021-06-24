/*
	Sprite -> Entity
	Entity is basically anything that appears on the map
	needs to be updated by offset generated in game map

	sprite position is draw position - origin + offset
	origin is really map position
*/

class Entity extends Sprite {
	constructor(params, debug) {
		super(params.x, params.y);
		this.debug = debug;
		this.origin = new Cool.Vector(params.x, params.y);
		// this.origin = { x: params.x, y: params.y };
		if (params.animation) this.addAnimation(params.animation);
		if (params.loop !== undefined) this.animation.loop = params.loop;
		if (params.play) this.animation.play();

		this.center = params.center !== undefined ? params.center : true;
	}

	update(offset) {
		console.log(this);
		/* simpler than vectors */
		this.position.x = this.origin.x + offset.x;
		this.position.y = this.origin.y + offset.y;
	}

	setPosition(x, y) {
		this.origin.x = x;
		this.origin.y = y;
	}
}