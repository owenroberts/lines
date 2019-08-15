class Item extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.origin = { x: params.x, y: params.y };
		this.debug = debug;
		if (!src) src = params.src;
		if (src) {
			const self = this;
			this.addAnimation(src, function() {
				if (params.states) {
					self.animation.states = params.states;
					self.animation.state = params.state || 'idle';
				}
				if (params.r) this.animation.randomFrames = true; /* tags? */
			});
		}
		this.scenes = params.scenes;
		this.center = true; // fine for now?
	}

	update(offset) {
		this.position.x = this.origin.x + offset.x;
		this.position.y = this.origin.y + offset.y;
	}
}