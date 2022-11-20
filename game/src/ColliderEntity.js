/*
	Sprite -> ColliderSprite -> ColliderEntity
	problem with inheritance pattern
	sprite is just a renderer basically
	some sprites need collisions -> ColliderSprite
	some sprite need to update with map -> Entity
	and it if need both ...
	add collider as sub class ... so a collider can be added to sprite or entity
*/

class ColliderEntity extends ColliderSprite {
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
		// console.log(offset);
		/* simpler than vectors */
		this.position[0] = this.origin[0] + offset[0];
		this.position[1] = this.origin[1] + offset[1];
	}

	setPosition(x, y) {
		this.origin[0] = x;
		this.origin[1] = y;
	}
}