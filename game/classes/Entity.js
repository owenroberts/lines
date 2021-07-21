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
		// this.origin = new Cool.Vector(params.x, params.y);
		this.origin = [params.x, params.y];
		// this.origin = { x: params.x, y: params.y };
		if (params.animation) this.addAnimation(params.animation);
		if (params.loop !== undefined) this.animation.loop = params.loop;
		if (params.play) this.animation.play();

		this.center = params.center !== undefined ? params.center : true;
	}

	update(offset) {
		/* simpler than vectors */
		this.position[0] = this.origin[0] + offset[0];
		this.position[1] = this.origin[1] + offset[1];
	}

	setPosition(x, y) {
		this.origin[0] = x;
		this.origin[1] = y;
	}
}