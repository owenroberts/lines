/*
	Sprite -> Entity
	Entity is basically anything that appears on the map
	needs to be updated by offset generated in game map

	sprite position is draw position - origin + offset
	origin is really map position
*/

class Entity extends Sprite {
	constructor(params, debug) {
		super(params.x, params.y, params.animation);
		this.debug = debug;
		this.origin = [params.x, params.y];
		if (params.loop !== undefined) this.animation.loop = params.loop;
		if (params.play) this.animation.play();

		this.center = params.center !== undefined ? params.center : true;
	}

	update(offset) {
		this.position[0] = this.origin[0] + offset[0];
		this.position[1] = this.origin[1] + offset[1];
	}

	setPosition(x, y) {
		this.origin[0] = x;
		this.origin[1] = y;
	}
}