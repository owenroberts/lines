class UI extends Sprite {
	constructor(params, debug) {
		/* xy orientation to game window */
		let x = params.x;
		let y = params.y;
		if (x % 1 != 0) x = Game.width * x; /* decimal / percentage of window */
		if (x < 0) x = Game.width + x; /* negative x offset from right side */
		if (y % 1 != 0) y = Game.height * y; /* decimal / percentage of window */
		if (y < 0) y = Game.height + y; /* negative y offset from bottom */
		
		super(x, y);
		this.debug = debug;
		this.center = true;

		if (params.hidden) this.isActive = false; /* hidden prob in garden json ...  */
		if (params.json) this.addJSON(params.json);
		
		if (params.states) {
			this.animation.states = params.states;
			this.animation.state = 'idle';
		}

		this.scenes = params.scenes; // deprecate ? 
		
		if (params.func) this.func = window[params.func]; 
		/* shouldnt be attached to window - fine for now */
	}
}
