class Item extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.debug = debug;
		this.origin = { x: params.x, y: params.y };
		if (!src) src = params.src;
		if (src) {
			const self = this;
			this.addAnimation(src, function() {
				self.animation.states = params.states || { idle: { start: 0, end: 0 } };
				self.animation.state = params.state || 'idle';
			});
		} else {
			this.animation = new Animation();
		}

		this.scenes = params.scenes;
		// console.log(params.center)
		this.center = params.center || true;
	}

	update(offset) {
		this.position.x = this.origin.x + offset.x;
		this.position.y = this.origin.y + offset.y;

		// console.log(this.position.x, this.position.y);
	}
}