class Entity extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.debug = debug;
		this.origin = new Cool.Vector(params.x, params.y);
		// this.origin = { x: params.x, y: params.y };

		this.center = params.center || true;
	}

	update(offset) {
		// this.position.x = this.origin.x + offset.x;
		// this.position.y = this.origin.y + offset.y;
		this.position = this.origin.copy().add(offset.copy());
	}

	setPosition(x, y) {
		this.origin = new Cool.Vector(x, y);
		// this.origin.x = x;
		// this.origin.y = y;
	}
}